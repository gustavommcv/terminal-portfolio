import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { catalogEntry } from '../../../../testing/english-catalog';
import { Header } from './header';
import { NAV_ROUTES } from './nav-routes';

// The panel itself (its rows, its focus trap, its scroll lock) is the mobile
// menu's, and is checked in its own spec. Here: what the header does around it.
describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Header],
      // Any address matches, so the spec can navigate.
      providers: [provideRouter([{ path: '**', children: [] }])],
    });
    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.style.overflow = '';
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function menuButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.hamburger-button');
  }

  const overlay = (): HTMLElement | null => fixture.nativeElement.querySelector('.menu-overlay');
  const menuLinks = (): HTMLAnchorElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.neo-sidebar__link'));
  const desktopLinks = (): HTMLAnchorElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.desktop-nav .header__link'));

  async function openMenu(): Promise<void> {
    const button = menuButton();
    button.focus();
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function click(link: HTMLElement, init: MouseEventInit = {}): MouseEvent {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
    link.dispatchEvent(event);
    return event;
  }

  it('renders semantic, locale-aware desktop links with current-page metadata', () => {
    expect(desktopLinks().map((link) => link.getAttribute('href'))).toEqual(['/', '/about', '/portfolio']);
    expect(desktopLinks()[0].getAttribute('aria-current')).toBe('page');
  });

  it('names the logo link and the hamburger button', () => {
    expect(fixture.nativeElement.querySelector('.logo').getAttribute('aria-label')).toBe(
      catalogEntry('header.home-link'),
    );
    expect(menuButton().getAttribute('aria-label')).toBe(catalogEntry('header.menu'));
  });

  it('follows the current page with its active link, whichever way the route changes', async () => {
    const activeLabels = () =>
      Array.from(fixture.nativeElement.querySelectorAll('.desktop-nav .header__link--active')).map((link) =>
        (link as HTMLElement).textContent?.trim(),
      );
    const router = TestBed.inject(Router);

    // Not through a click on the header: a reload, or the browser's back button.
    // The header is OnPush with nothing marking it by hand, so it can only be
    // refreshed here because the route it reads is a signal.
    await router.navigateByUrl('/about');
    fixture.detectChanges();
    expect(activeLabels()).toEqual(['about']);

    await router.navigateByUrl('/portfolio?locale=pt');
    fixture.detectChanges();
    expect(activeLabels()).toEqual(['portfolio']);

    await router.navigateByUrl('/');
    fixture.detectChanges();
    expect(activeLabels()).toEqual(['home']);
  });

  describe('the hamburger button', () => {
    it('points at the menu and says it is closed', () => {
      expect(menuButton().getAttribute('aria-controls')).toBe('mobile-menu');
      expect(menuButton().getAttribute('aria-expanded')).toBe('false');
      expect(component.isMenuOpen()).toBe(false);
      expect(overlay()).toBeNull();
    });

    it('opens the menu, and says so', async () => {
      await openMenu();

      expect(component.isMenuOpen()).toBe(true);
      expect(menuButton().getAttribute('aria-expanded')).toBe('true');
      expect(overlay()).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#mobile-menu')).not.toBeNull();
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('closes the menu when pressed again, and keeps focus', async () => {
      await openMenu();

      menuButton().click();
      fixture.detectChanges();

      expect(component.isMenuOpen()).toBe(false);
      expect(menuButton().getAttribute('aria-expanded')).toBe('false');
      expect(overlay()).toBeNull();
      expect(document.body.style.overflow).toBe('');
      expect(document.activeElement).toBe(menuButton());
    });

    it('handles rapid repeated activation with one authoritative state', () => {
      menuButton().focus();

      menuButton().click();
      menuButton().click();
      menuButton().click();
      fixture.detectChanges();

      expect(component.isMenuOpen()).toBe(true);
      expect(fixture.nativeElement.querySelectorAll('.menu-overlay')).toHaveLength(1);
    });
  });

  describe('when the menu asks to be closed', () => {
    it('closes it, and hands focus back to the hamburger button, by its close button', async () => {
      await openMenu();
      fixture.nativeElement.querySelector('.neo-sidebar__close').click();
      fixture.detectChanges();

      expect(component.isMenuOpen()).toBe(false);
      expect(overlay()).toBeNull();
      expect(document.body.style.overflow).toBe('');
      expect(document.activeElement).toBe(menuButton());
    });

    it('closes it, and hands focus back to the button, by a click on the backdrop', async () => {
      await openMenu();
      overlay()!.click();
      fixture.detectChanges();

      expect(overlay()).toBeNull();
      expect(document.activeElement).toBe(menuButton());
    });

    it('closes it, and hands focus back to the button, with Escape', async () => {
      await openMenu();
      menuLinks()[0].focus();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();

      expect(overlay()).toBeNull();
      expect(menuButton().getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(menuButton());
    });

    it('does not move focus to the hamburger button when Escape is pressed with the menu closed', () => {
      menuButton().focus();
      menuButton().blur();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();

      expect(document.activeElement).not.toBe(menuButton());
    });
  });

  describe('clicking a navigation link', () => {
    function spyOnNavigation() {
      return vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    }

    it('in the menu navigates in the app, and closes the menu without delaying the navigation', async () => {
      const navigate = spyOnNavigation();
      await openMenu();

      const event = click(menuLinks()[1]);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(true);
      expect(navigate).toHaveBeenCalledWith(['/about'], { queryParams: {} });
      expect(component.isMenuOpen()).toBe(false);
      expect(overlay()).toBeNull();
      expect(document.body.style.overflow).toBe('');
    });

    it('in the desktop bar navigates in the app, with no menu to close', () => {
      const navigate = spyOnNavigation();

      const event = click(desktopLinks()[2]);

      expect(event.defaultPrevented).toBe(true);
      expect(navigate).toHaveBeenCalledWith(['/portfolio'], { queryParams: {} });
    });

    it.each([
      ['Ctrl', { ctrlKey: true }],
      ['Cmd', { metaKey: true }],
      ['Shift', { shiftKey: true }],
      ['Alt', { altKey: true }],
      ['the middle button', { button: 1 }],
    ])('leaves the browser to handle a click with %s, and the menu stays open', async (_name, init) => {
      const navigate = spyOnNavigation();
      await openMenu();

      const menuEvent = click(menuLinks()[1], init);
      const desktopEvent = click(desktopLinks()[0], init);

      expect(menuEvent.defaultPrevented).toBe(false);
      expect(desktopEvent.defaultPrevented).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
      // the page is not left, so the menu stays open too
      expect(component.isMenuOpen()).toBe(true);
    });
  });

  it('offers the same pages in the desktop bar and in the mobile menu', async () => {
    await openMenu();

    expect(desktopLinks().map((link) => link.getAttribute('href'))).toEqual([...NAV_ROUTES]);
    expect(menuLinks().map((link) => link.getAttribute('href'))).toEqual([...NAV_ROUTES]);
  });

  it('does not recreate or alter desktop navigation when the mobile menu toggles', async () => {
    const desktopNav = fixture.nativeElement.querySelector('.desktop-nav');
    const links = desktopNav.querySelectorAll('.header__link');

    await openMenu();
    component.closeMenu();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.desktop-nav')).toBe(desktopNav);
    expect(desktopNav.querySelectorAll('.header__link')).toHaveLength(3);
    expect(desktopNav.querySelectorAll('.header__link')[0]).toBe(links[0]);
  });

  it('always restores body scrolling if the header is destroyed while the menu is open', async () => {
    await openMenu();

    fixture.destroy();

    expect(document.body.style.overflow).toBe('');
  });
});
