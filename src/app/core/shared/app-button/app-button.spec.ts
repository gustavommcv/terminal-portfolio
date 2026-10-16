import { readFileSync } from 'node:fs';

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { AppButton } from './app-button';

// Written the way the pages write it: the words on a line of their own.
@Component({
  imports: [AppButton],
  template: `
    <app-button route="/portfolio">
      Portfolio
    </app-button>
  `,
})
class HostWithSpacedWords {}

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
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      fixture.componentRef.setInput('route', '/portfolio');
      fixture.detectChanges();

      const event = click();

      expect(event.defaultPrevented).toBe(true);
      expect(navigate).toHaveBeenCalledWith(['/portfolio'], { queryParams: {} });
    });

    it.each([
      ['Ctrl', { ctrlKey: true }],
      ['Cmd', { metaKey: true }],
      ['Shift', { shiftKey: true }],
      ['Alt', { altKey: true }],
      ['the middle button', { button: 1 }],
    ])('leaves the browser to handle a click with %s', (_name, init) => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
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

  it('points at "#" and does nothing when it has neither a route nor a scroll target', () => {
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);

    expect(link.getAttribute('href')).toBe('#');
    expect(click.defaultPrevented).toBe(false);
  });

  it('links to an in-page anchor when it has a scroll target', () => {
    fixture.componentRef.setInput('scrollTo', 'contact-section');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe(
      '#contact-section',
    );
  });

  it('scrolls smoothly unless reduced motion is requested', () => {
    const target = document.createElement('div');
    target.id = 'smooth-target';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    fixture.componentRef.setInput('scrollTo', 'smooth-target');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('a').click();

    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    target.remove();
  });

  describe('its words', () => {
    it('sit in a label after the icon, not loose among its children', () => {
      const host = TestBed.createComponent(HostWithSpacedWords);
      host.detectChanges();
      const link: HTMLAnchorElement = host.nativeElement.querySelector('a');
      const label = link.querySelector('.app-button__label') as HTMLElement;

      expect(label.textContent?.trim()).toBe('Portfolio');
      expect(label.previousElementSibling?.tagName.toLowerCase()).toBe('svg');
      expect(link.lastElementChild).toBe(label);
    });

    // jsdom does not lay anything out, so this reads the source: the whitespace
    // of the page's template arrives inside the link, and the label (an
    // inline-block, which drops the spaces at the ends of its text) is what keeps
    // a space from being underlined with the words on hover.
    it('are the only thing underlined on hover, so no space around the icon is', () => {
      const scss = readFileSync('src/app/core/shared/app-button/app-button.scss', 'utf8').replace(/\r\n/g, '\n');

      expect(scss).toMatch(/&:hover &__label\s*\{\s*[^}]*text-decoration:\s*underline/);
      expect(scss).toMatch(/&__label\s*\{\s*display:\s*inline-block/);
      // the link itself is never underlined, at rest or on hover
      expect(scss).not.toMatch(/&:hover\s*\{[^}]*text-decoration/);
    });
  });
});
