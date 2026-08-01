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
  });

  function menuButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.hamburger-button');
  }

  function openMenu(): HTMLElement {
    const button = menuButton();
    button.focus();
    button.click();
    fixture.detectChanges();
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.menu-overlay');
  }

  it('renders semantic, locale-aware desktop links with current-page metadata', () => {
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.desktop-nav .header__link'),
    ) as HTMLAnchorElement[];

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/about',
      '/portfolio',
    ]);
    expect(links[0].getAttribute('aria-current')).toBe('page');
  });

  it('renders the final backdrop, sidebar, and interactive links immediately', () => {
    expect(fixture.nativeElement.querySelector('.menu-overlay')).toBeNull();
    const overlay = openMenu();
    const links = Array.from(
      overlay.querySelectorAll('.mobile-nav__link'),
    ) as HTMLAnchorElement[];

    expect(component.isMenuOpen()).toBe(true);
    expect(overlay).not.toBeNull();
    expect(overlay.querySelector('.mobile-nav')).not.toBeNull();
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/about',
      '/portfolio',
    ]);
    expect(links.every((link) => link.tabIndex === 0)).toBe(true);
    expect(menuButton().getAttribute('aria-expanded')).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.activeElement).toBe(menuButton());
  });

  it('contains no menu motion rules or intermediate visual state classes', () => {
    const headerStyles = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .find(
        (styles) =>
          styles.includes('.menu-overlay') && styles.includes('.mobile-nav'),
      );
    const overlay = openMenu();
    const menuClassNames = [
      overlay.className,
      overlay.querySelector('.mobile-nav')?.className ?? '',
      ...Array.from(overlay.querySelectorAll('.mobile-nav__link')).map(
        (link) => link.className,
      ),
    ].join(' ');

    expect(headerStyles).toBeDefined();
    expect(headerStyles).not.toMatch(
      /transition|animation|@keyframes|transform|opacity|visibility/i,
    );
    expect(menuClassNames).not.toMatch(
      /opening|closing|animating|transitioning|reveal|fade|slide/i,
    );
  });

  it('closes immediately, removes the backdrop, and restores trigger focus', () => {
    const button = menuButton();
    openMenu();

    button.click();
    fixture.detectChanges();
    fixture.detectChanges();

    expect(component.isMenuOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.menu-overlay')).toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(button);
  });

  it('closes immediately through backdrop interaction', () => {
    openMenu().click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.menu-overlay')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('closes immediately with Escape', () => {
    const overlay = openMenu();
    const firstLink = overlay.querySelector<HTMLAnchorElement>(
      '.mobile-nav__link',
    );
    expect(firstLink).not.toBeNull();
    firstLink?.focus();
    expect(document.activeElement).toBe(firstLink);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.menu-overlay')).toBeNull();
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(menuButton());
  });

  it('closes after selecting a route without delaying navigation', () => {
    const navigateSpy = vi
      .spyOn(component.language, 'navigateWithLocale')
      .mockResolvedValue(true);
    const overlay = openMenu();
    const aboutLink: HTMLAnchorElement = overlay.querySelectorAll(
      '.mobile-nav__link',
    )[1] as HTMLAnchorElement;

    aboutLink.click();
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith('/about');
    expect(fixture.nativeElement.querySelector('.menu-overlay')).toBeNull();
    expect(document.body.style.overflow).toBe('');
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

  it('does not recreate or alter desktop navigation when the mobile menu toggles', () => {
    const desktopNav = fixture.nativeElement.querySelector('.desktop-nav');
    const desktopLinks = desktopNav.querySelectorAll('.header__link');

    openMenu();
    component.closeMenu();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.desktop-nav')).toBe(desktopNav);
    expect(desktopNav.querySelectorAll('.header__link')).toHaveLength(3);
    expect(desktopNav.querySelectorAll('.header__link')[0]).toBe(desktopLinks[0]);
  });

  it('always restores body scrolling if the header is destroyed while open', () => {
    openMenu();

    fixture.destroy();

    expect(document.body.style.overflow).toBe('');
  });
});
