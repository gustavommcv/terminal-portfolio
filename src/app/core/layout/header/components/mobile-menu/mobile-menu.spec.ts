import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogEntry } from '../../../../../../testing/english-catalog';
import { NAV_ROUTES } from '../../nav-routes';
import { MobileMenu } from './mobile-menu';

@Component({
  imports: [MobileMenu],
  template: `<app-mobile-menu [open]="open()" (closed)="closedCount.update((count) => count + 1)" />`,
})
class Host {
  readonly open = signal(false);
  readonly closedCount = signal(0);
}

describe('MobileMenu', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Host],
      // Any address matches, so the spec can navigate.
      providers: [provideRouter([{ path: '**', children: [] }])],
    });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.style.overflow = '';
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const host = (): Host => fixture.componentInstance;
  const root = (): HTMLElement => fixture.nativeElement;
  const overlay = (): HTMLElement | null => root().querySelector('.menu-overlay');
  const links = (): HTMLAnchorElement[] => Array.from(root().querySelectorAll('.neo-sidebar__link'));
  const closeButton = (): HTMLButtonElement => root().querySelector('.neo-sidebar__close')!;
  const focusableInPanel = (): HTMLElement[] =>
    Array.from(root().querySelectorAll<HTMLElement>('.neo-sidebar a[href], .neo-sidebar button:not([disabled])'));

  async function openMenu(): Promise<void> {
    host().open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function click(target: HTMLElement, init: MouseEventInit = {}): MouseEvent {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    return event;
  }

  describe('closed', () => {
    it('renders neither the backdrop nor the panel', () => {
      expect(overlay()).toBeNull();
      expect(root().querySelector('.neo-sidebar')).toBeNull();
    });

    it('leaves the page scrolling', () => {
      expect(document.body.style.overflow).toBe('');
    });

    it('does not ask to be closed when Escape is pressed', () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(host().closedCount()).toBe(0);
    });
  });

  describe('open', () => {
    it('renders exactly one backdrop and one panel', async () => {
      await openMenu();

      expect(root().querySelectorAll('.menu-overlay')).toHaveLength(1);
      expect(overlay()!.querySelectorAll('.neo-sidebar')).toHaveLength(1);
    });

    it('mounts the backdrop and panel synchronously, with no timer gating appearance', () => {
      vi.useFakeTimers();
      try {
        host().open.set(true);
        fixture.detectChanges();

        // No vi.advanceTimersByTime()/runAllTimers() call: if any setTimeout
        // gated the backdrop's appearance, it would not exist yet here.
        expect(overlay()).not.toBeNull();
        expect(root().querySelector('.neo-sidebar')).not.toBeNull();
        expect(links()).toHaveLength(NAV_ROUTES.length);
      } finally {
        vi.useRealTimers();
      }
    });

    it('is a modal dialog with a name', async () => {
      await openMenu();
      const panel = root().querySelector('.neo-sidebar')!;

      expect(panel.getAttribute('role')).toBe('dialog');
      expect(panel.getAttribute('aria-modal')).toBe('true');
      expect(panel.getAttribute('aria-label')).toBe(catalogEntry('header.menu-dialog'));
      expect(panel.id).toBe('mobile-menu'); // what the header's button points at with aria-controls
    });

    it('renders route rows as semantic list/navigation markup with one icon each', async () => {
      await openMenu();
      const nav = root().querySelector('nav.neo-sidebar__nav');
      const rows = root().querySelectorAll('.neo-sidebar__tree > li.neo-sidebar__row');

      expect(nav).not.toBeNull();
      expect(nav?.querySelector('ul.neo-sidebar__tree')).not.toBeNull();
      expect(rows).toHaveLength(NAV_ROUTES.length);

      rows.forEach((row) => {
        expect(row.querySelector('a.neo-sidebar__link')).not.toBeNull();
        expect(row.querySelectorAll('svg')).toHaveLength(1);
      });
    });

    it('gives every icon aria-hidden and no accessible name of its own', async () => {
      await openMenu();
      const icons = Array.from(overlay()!.querySelectorAll('svg'));

      expect(icons.length).toBeGreaterThan(0);
      icons.forEach((icon) => {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
        expect(icon.hasAttribute('aria-label')).toBe(false);
        expect(icon.hasAttribute('title')).toBe(false);
      });
    });

    it('names the close button', async () => {
      await openMenu();

      expect(closeButton().getAttribute('aria-label')).toBe(catalogEntry('header.menu-close'));
    });

    it('offers the language toggle', async () => {
      await openMenu();

      expect(root().querySelectorAll('.neo-sidebar app-language-toggle-button')).toHaveLength(1);
    });
  });

  describe('the links', () => {
    it('are the pages of the site, with the labels of their paths', async () => {
      await openMenu();

      expect(links().map((link) => link.getAttribute('href'))).toEqual([...NAV_ROUTES]);
      expect(links().map((link) => link.textContent?.trim())).toEqual(['home', 'about', 'portfolio']);
    });

    it('carry the language of the page', async () => {
      await TestBed.inject(Router).navigateByUrl('/anywhere?locale=pt');
      await openMenu();

      expect(links().map((link) => link.getAttribute('href'))).toEqual([
        '/?locale=pt',
        '/about?locale=pt',
        '/portfolio?locale=pt',
      ]);
    });

    it('mark the current page with aria-current and the active row class', async () => {
      await openMenu();

      expect(links()[0].getAttribute('aria-current')).toBe('page');
      expect(links()[0].classList.contains('neo-sidebar__link--active')).toBe(true);
      links()
        .slice(1)
        .forEach((link) => {
          expect(link.hasAttribute('aria-current')).toBe(false);
          expect(link.classList.contains('neo-sidebar__link--active')).toBe(false);
        });
    });

    it('take the visitor to the page within the app on a plain click, and ask for the menu to close', async () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      await openMenu();

      const event = click(links()[1]);

      expect(event.defaultPrevented).toBe(true);
      expect(navigate).toHaveBeenCalledWith(['/about'], { queryParams: {} });
      expect(host().closedCount()).toBe(1);
    });

    it.each([
      ['Ctrl', { ctrlKey: true }],
      ['Cmd', { metaKey: true }],
      ['Shift', { shiftKey: true }],
      ['Alt', { altKey: true }],
      ['the middle button', { button: 1 }],
    ])('are left to the browser on a click with %s, and the menu stays open', async (_name, init) => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      await openMenu();

      const event = click(links()[1], init);

      expect(event.defaultPrevented).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
      expect(host().closedCount()).toBe(0);
    });
  });

  describe('focus', () => {
    it('moves to the link of the current page on open', async () => {
      await openMenu();

      expect(document.activeElement).toBe(links()[0]);
    });

    it('moves to the link of the current page, wherever it is in the list', async () => {
      await TestBed.inject(Router).navigateByUrl('/about');
      await openMenu();

      expect(document.activeElement).toBe(links()[1]);
    });

    it('does not interfere with Tab, or any other key, away from the ends of the panel', async () => {
      await openMenu();
      const middle = focusableInPanel()[1];
      middle.focus();

      const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      const letter = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
      middle.dispatchEvent(tab);
      middle.dispatchEvent(letter);

      expect(tab.defaultPrevented).toBe(false);
      expect(letter.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(middle);
    });

    it('wraps from the last focusable element back to the first with Tab', async () => {
      await openMenu();
      const focusable = focusableInPanel();
      const last = focusable[focusable.length - 1];

      last.focus();
      const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      last.dispatchEvent(tab);

      expect(document.activeElement).toBe(focusable[0]);
      expect(tab.defaultPrevented).toBe(true); // or the browser would move focus on from there
    });

    it('wraps from the first focusable element back to the last with Shift+Tab', async () => {
      await openMenu();
      const focusable = focusableInPanel();
      const first = focusable[0];

      first.focus();
      const shiftTab = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
      first.dispatchEvent(shiftTab);

      expect(document.activeElement).toBe(focusable[focusable.length - 1]);
      expect(shiftTab.defaultPrevented).toBe(true);
    });
  });

  describe('asking to be closed', () => {
    it('by the close button', async () => {
      await openMenu();

      closeButton().click();

      expect(host().closedCount()).toBe(1);
    });

    it('by a click on the backdrop', async () => {
      await openMenu();

      overlay()!.click();

      expect(host().closedCount()).toBe(1);
    });

    it('but not by a click inside the panel', async () => {
      await openMenu();

      root().querySelector<HTMLElement>('.neo-sidebar__source-bar')!.click();
      root().querySelector<HTMLElement>('.neo-sidebar')!.click();

      expect(host().closedCount()).toBe(0);
    });

    it('by Escape, wherever focus is', async () => {
      await openMenu();
      document.body.focus();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(host().closedCount()).toBe(1);
    });
  });

  describe('the page behind', () => {
    it('does not scroll while the menu is open', async () => {
      await openMenu();

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('scrolls again once the menu is closed', async () => {
      await openMenu();

      host().open.set(false);
      fixture.detectChanges();

      expect(document.body.style.overflow).toBe('');
    });

    it('is always given back if the menu is destroyed while open', async () => {
      await openMenu();

      fixture.destroy();

      expect(document.body.style.overflow).toBe('');
    });
  });

  it('contains no menu motion rules, intermediate classes, or reveal styling', async () => {
    const styles = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .find((css) => css.includes('.menu-overlay') && css.includes('.neo-sidebar'));
    await openMenu();
    const classNames = Array.from(overlay()!.querySelectorAll('*'))
      .map((element) => element.className)
      .concat(overlay()!.className)
      .filter((value) => typeof value === 'string')
      .join(' ');

    expect(styles).toBeDefined();
    expect(styles).not.toMatch(/transition|animation|@keyframes|transform|opacity|visibility/i);
    expect(classNames).not.toMatch(/opening|closing|animating|transitioning|reveal|fade|slide/i);
  });
});
