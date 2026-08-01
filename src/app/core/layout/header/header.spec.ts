import { ComponentFixture, TestBed } from '@angular/core/testing';

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
  });

  it('renders semantic, locale-aware links with current-page metadata', () => {
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

  it('publishes menu state and always restores body scrolling', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.hamburger-button',
    );

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');

    component.closeMenuFromKeyboard();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.body.style.overflow).toBe('');

    component.toggleMenu();
    fixture.destroy();
    expect(document.body.style.overflow).toBe('');
  });
});
