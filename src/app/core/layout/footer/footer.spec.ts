import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { catalogEntry } from '../../../../testing/english-catalog';
import { Footer } from './footer';

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;
  let root: HTMLElement;

  function render(today = new Date(2031, 5, 1)): void {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(today);
    TestBed.configureTestingModule({ imports: [Footer] });
    fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    root = fixture.nativeElement;
  }

  afterEach(() => vi.useRealTimers());

  it('credits the author in English, whatever the language of the page', () => {
    render();
    const credit = root.querySelector('.footer__copyright') as HTMLElement;

    expect(credit.getAttribute('lang')).toBe('en');
    expect(credit.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      '© 2031 Made with ♥ by Gustavo Monnerat',
    );
  });

  it('shows the current year, not the year it was built', () => {
    render(new Date(2040, 0, 1));

    expect(root.querySelector('.footer__year')?.textContent).toBe('2040');
  });

  it('gives the heart a role, since a name on a role-less span is ignored', () => {
    render();
    const heart = root.querySelector('.footer__heart') as HTMLElement;

    expect(heart.getAttribute('role')).toBe('img');
    expect(heart.getAttribute('aria-label')).toBe('love');
  });

  it('credits the colour theme in the language of the page, linking its source safely', () => {
    render();
    const credit = root.querySelector('.footer__theme-credit') as HTMLElement;
    const link = credit.querySelector('a') as HTMLAnchorElement;

    expect(credit.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      `${catalogEntry('footer.theme-before')} NightFox ${catalogEntry('footer.theme-after')}`,
    );
    expect(link.getAttribute('href')).toBe('https://github.com/EdenEast/nightfox.nvim');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('keeps the spaces around the link outside it, so they are not underlined with it', () => {
    render();
    const link = root.querySelector('.footer__theme-credit a') as HTMLAnchorElement;

    // The link is its name and nothing else (whitespace is collapsed to a space
    // that would be drawn, underlined, inside the link)...
    expect(link.textContent).toBe('NightFox');
    // ...and the sentence still has a space before it and after it.
    expect(link.previousSibling?.textContent).toMatch(/\s$/);
    expect(link.nextSibling?.textContent).toMatch(/^\s/);
  });
});
