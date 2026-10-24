import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { LocalizedLink } from './localized-link';

@Component({
  imports: [LocalizedLink],
  template: `<a [appLocalizedLink]="route()" (navigated)="navigated.update((count) => count + 1)">link</a>`,
})
class Host {
  readonly route = signal('/about');
  readonly navigated = signal(0);
}

describe('LocalizedLink', () => {
  let fixture: ComponentFixture<Host>;
  let router: Router;

  const link = (): HTMLAnchorElement => fixture.nativeElement.querySelector('a');

  function click(init: MouseEventInit = {}): MouseEvent {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
    link().dispatchEvent(event);
    return event;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Host],
      // Any address matches, so the spec can navigate.
      providers: [provideRouter([{ path: '**', children: [] }])],
    });
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  describe('the address', () => {
    it('is the plain one while the page is in English', () => {
      expect(link().getAttribute('href')).toBe('/about');
    });

    it('carries ?locale=pt while the page is in Portuguese, and follows the language', async () => {
      await router.navigateByUrl('/home?locale=pt');
      fixture.detectChanges();
      expect(link().getAttribute('href')).toBe('/about?locale=pt');

      await router.navigateByUrl('/home');
      fixture.detectChanges();
      expect(link().getAttribute('href')).toBe('/about');
    });

    it('follows the route it is given', () => {
      fixture.componentInstance.route.set('/portfolio/manga2ink');
      fixture.detectChanges();

      expect(link().getAttribute('href')).toBe('/portfolio/manga2ink');
    });
  });

  describe('a plain left click', () => {
    it('goes to the page within the application, and says so', () => {
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      const event = click();

      expect(event.defaultPrevented).toBe(true);
      expect(navigate).toHaveBeenCalledWith(['/about'], { queryParams: {} });
      expect(fixture.componentInstance.navigated()).toBe(1);
    });

    it('stays in Portuguese', async () => {
      await router.navigateByUrl('/home?locale=pt');
      fixture.detectChanges();

      click();
      await fixture.whenStable();

      expect(router.url).toBe('/about?locale=pt');
    });
  });

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Cmd', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }],
    ['the middle button', { button: 1 }],
  ])('leaves the browser to handle a click with %s', (_name, init) => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const event = click(init);

    expect(event.defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(fixture.componentInstance.navigated()).toBe(0);
  });
});
