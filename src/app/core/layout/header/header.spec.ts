import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Header] });
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

  function closeButton(overlay: HTMLElement): HTMLButtonElement {
    return overlay.querySelector('.neo-sidebar__close') as HTMLButtonElement;
  }

  function links(overlay: HTMLElement): HTMLAnchorElement[] {
    return Array.from(overlay.querySelectorAll('.neo-sidebar__link'));
  }

  function focusableInPanel(overlay: HTMLElement): HTMLElement[] {
    const panel = overlay.querySelector('.neo-sidebar') as HTMLElement;
    return Array.from(
      panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    );
  }

  async function openMenu(): Promise<HTMLElement> {
    const button = menuButton();
    button.focus();
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.menu-overlay');
  }

  it('renders semantic, locale-aware desktop links with current-page metadata', () => {
    const desktopLinks = Array.from(
      fixture.nativeElement.querySelectorAll('.desktop-nav .header__link'),
    ) as HTMLAnchorElement[];

    expect(desktopLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/about',
      '/portfolio',
    ]);
    expect(desktopLinks[0].getAttribute('aria-current')).toBe('page');
  });

  it('does not render the overlay or sidebar while closed', () => {
    expect(fixture.nativeElement.querySelector('.menu-overlay')).toBeNull();
    expect(fixture.nativeElement.querySelector('.neo-sidebar')).toBeNull();
  });

  it('renders exactly one backdrop and one sidebar immediately on open', async () => {
    const overlay = await openMenu();

    expect(component.isMenuOpen()).toBe(true);
    expect(
      fixture.nativeElement.querySelectorAll('.menu-overlay'),
    ).toHaveLength(1);
    expect(overlay.querySelectorAll('.neo-sidebar')).toHaveLength(1);
  });

  it('mounts the backdrop and sidebar synchronously, with no timer gating appearance', () => {
    vi.useFakeTimers();
    try {
      const button = menuButton();
      button.click();
      fixture.detectChanges();

      // No vi.advanceTimersByTime()/runAllTimers() call: if any setTimeout
      // gated the overlay's appearance, it would not exist yet here.
      expect(fixture.nativeElement.querySelector('.menu-overlay')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.neo-sidebar')).not.toBeNull();
      expect(
        fixture.nativeElement.querySelectorAll('.neo-sidebar__link'),
      ).toHaveLength(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders route rows as semantic list/navigation markup with one icon each', async () => {
    const overlay = await openMenu();
    const nav = overlay.querySelector('nav.neo-sidebar__nav');
    const rows = overlay.querySelectorAll('.neo-sidebar__tree > li.neo-sidebar__row');

    expect(nav).not.toBeNull();
    expect(nav?.querySelector('ul.neo-sidebar__tree')).not.toBeNull();
    expect(rows).toHaveLength(3);

    rows.forEach((row) => {
      const link = row.querySelector('a.neo-sidebar__link');
      expect(link).not.toBeNull();
      expect(row.querySelectorAll('svg')).toHaveLength(1);
    });
  });

  it('gives every menu icon aria-hidden and no accessible name of its own', async () => {
    const overlay = await openMenu();
    const icons = Array.from(overlay.querySelectorAll('svg'));

    expect(icons.length).toBeGreaterThan(0);
    icons.forEach((icon) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      expect(icon.hasAttribute('aria-label')).toBe(false);
      expect(icon.hasAttribute('title')).toBe(false);
    });
  });

  it('marks the current route with aria-current and the active row class', async () => {
    const overlay = await openMenu();
    const homeLink = links(overlay)[0];

    expect(homeLink.getAttribute('aria-current')).toBe('page');
    expect(homeLink.classList.contains('neo-sidebar__link--active')).toBe(
      true,
    );
    links(overlay)
      .slice(1)
      .forEach((link) => {
        expect(link.hasAttribute('aria-current')).toBe(false);
        expect(link.classList.contains('neo-sidebar__link--active')).toBe(
          false,
        );
      });
  });

  it('renders correct route labels regardless of the active locale', async () => {
    const overlay = await openMenu();
    expect(links(overlay).map((link) => link.textContent?.trim())).toEqual([
      'home',
      'about',
      'portfolio',
    ]);

    // Route labels are derived from the path, not the translation catalog,
    // so they stay identical under the Portuguese locale too - this is
    // existing, intentional behavior this redesign preserves as-is.
    component.language.toggleLanguage = vi.fn().mockResolvedValue(true);
    expect(links(overlay).map((link) => link.textContent?.trim())).toEqual([
      'home',
      'about',
      'portfolio',
    ]);
  });

  it('keeps hrefs locale-aware', async () => {
    const overlay = await openMenu();
    expect(links(overlay).map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/about',
      '/portfolio',
    ]);
  });

  it('moves focus to the active route link on open, falling back to the first link', async () => {
    const overlay = await openMenu();
    const rowLinks = links(overlay);
    const activeLink = rowLinks.find((link) =>
      link.classList.contains('neo-sidebar__link--active'),
    );

    expect(document.activeElement).toBe(activeLink ?? rowLinks[0]);
  });

  it('closes immediately, removes the backdrop, and restores trigger focus', async () => {
    const button = menuButton();
    await openMenu();

    button.click();
    fixture.detectChanges();

    expect(component.isMenuOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.menu-overlay')).toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(button);
  });

  it('closes immediately through the static close button inside the panel', async () => {
    const overlay = await openMenu();
    closeButton(overlay).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.menu-overlay')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(menuButton());
  });

  it('closes immediately through backdrop interaction', async () => {
    const overlay = await openMenu();
    overlay.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.menu-overlay')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('closes immediately with Escape', async () => {
    const overlay = await openMenu();
    const firstLink = links(overlay)[0];
    firstLink.focus();
    expect(document.activeElement).toBe(firstLink);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.menu-overlay')).toBeNull();
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(menuButton());
  });

  it('closes after selecting a route without delaying navigation', async () => {
    const navigateSpy = vi
      .spyOn(component.language, 'navigateWithLocale')
      .mockResolvedValue(true);
    const overlay = await openMenu();
    const aboutLink = links(overlay)[1];

    aboutLink.click();
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith('/about');
    expect(fixture.nativeElement.querySelector('.menu-overlay')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('wraps focus from the last focusable panel element back to the first via Tab', async () => {
    const overlay = await openMenu();
    const focusable = focusableInPanel(overlay);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    last.focus();
    last.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );

    expect(document.activeElement).toBe(first);
  });

  it('wraps focus from the first focusable panel element back to the last via Shift+Tab', async () => {
    const overlay = await openMenu();
    const focusable = focusableInPanel(overlay);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first.focus();
    first.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(document.activeElement).toBe(last);
  });

  it('handles rapid repeated activation with one authoritative state', () => {
    const button = menuButton();
    button.focus();

    button.click();
    button.click();
    button.click();
    fixture.detectChanges();

    expect(component.isMenuOpen()).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('.menu-overlay')).toHaveLength(
      1,
    );
  });

  it('does not recreate or alter desktop navigation when the mobile menu toggles', async () => {
    const desktopNav = fixture.nativeElement.querySelector('.desktop-nav');
    const desktopLinks = desktopNav.querySelectorAll('.header__link');

    await openMenu();
    component.closeMenu();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.desktop-nav')).toBe(desktopNav);
    expect(desktopNav.querySelectorAll('.header__link')).toHaveLength(3);
    expect(desktopNav.querySelectorAll('.header__link')[0]).toBe(desktopLinks[0]);
  });

  it('always restores body scrolling if the header is destroyed while open', async () => {
    await openMenu();

    fixture.destroy();

    expect(document.body.style.overflow).toBe('');
  });

  it('gives the trigger and close button accessible names', async () => {
    const overlay = await openMenu();

    expect(menuButton().getAttribute('aria-label')).toBe('Menu');
    expect(closeButton(overlay).getAttribute('aria-label')).toBe('Close menu');
  });

  it('contains no menu motion rules, intermediate classes, or reveal styling', async () => {
    const headerStyles = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .find(
        (styles) =>
          styles.includes('.menu-overlay') && styles.includes('.neo-sidebar'),
      );
    const overlay = await openMenu();
    const menuClassNames = [
      overlay.className,
      overlay.querySelector('.neo-sidebar')?.className ?? '',
      ...Array.from(overlay.querySelectorAll('*')).map(
        (el) => el.className,
      ),
    ]
      .filter((value) => typeof value === 'string')
      .join(' ');

    expect(headerStyles).toBeDefined();
    expect(headerStyles).not.toMatch(
      /transition|animation|@keyframes|transform|opacity|visibility/i,
    );
    expect(menuClassNames).not.toMatch(
      /opening|closing|animating|transitioning|reveal|fade|slide/i,
    );
  });
});
