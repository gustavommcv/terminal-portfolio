import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { LanguageService } from '../../../services/language.service';
import { AppButton } from './app-button';

describe('AppButton', () => {
  let fixture: ComponentFixture<AppButton>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AppButton] });
    fixture = TestBed.createComponent(AppButton);
  });

  it('renders a normal localized route without bypassing URL sanitization', () => {
    fixture.componentRef.setInput('route', '/portfolio');
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('href')).toBe('/portfolio');
  });

  describe('clicking the button', () => {
    function click(init: MouseEventInit = {}): MouseEvent {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        ...init,
      });
      fixture.nativeElement.querySelector('a').dispatchEvent(event);
      return event;
    }

    it('navigates in the app to its route on a plain left click', () => {
      const navigate = vi
        .spyOn(TestBed.inject(LanguageService), 'navigateWithLocale')
        .mockResolvedValue(true);
      fixture.componentRef.setInput('route', '/portfolio');
      fixture.detectChanges();

      const event = click();

      expect(event.defaultPrevented).toBe(true);
      expect(navigate).toHaveBeenCalledWith('/portfolio');
    });

    it.each([
      ['Ctrl', { ctrlKey: true }],
      ['Cmd', { metaKey: true }],
      ['Shift', { shiftKey: true }],
      ['Alt', { altKey: true }],
      ['the middle button', { button: 1 }],
    ])('leaves the browser to handle a click with %s', (_name, init) => {
      const navigate = vi
        .spyOn(TestBed.inject(LanguageService), 'navigateWithLocale')
        .mockResolvedValue(true);
      const target = document.createElement('div');
      target.id = 'modifier-target';
      target.scrollIntoView = vi.fn();
      document.body.appendChild(target);
      fixture.componentRef.setInput('route', '/portfolio');
      fixture.detectChanges();
      const routeEvent = click(init);

      fixture.componentRef.setInput('route', '');
      fixture.componentRef.setInput('scrollTo', 'modifier-target');
      fixture.detectChanges();
      const scrollEvent = click(init);

      expect(routeEvent.defaultPrevented).toBe(false);
      expect(scrollEvent.defaultPrevented).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
      expect(target.scrollIntoView).not.toHaveBeenCalled();
      target.remove();
    });
  });

  it('uses instant in-page scrolling when reduced motion is requested', () => {
    const target = document.createElement('div');
    target.id = 'target';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    fixture.componentRef.setInput('scrollTo', 'target');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('a').click();

    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant' });
    target.remove();
  });
});
