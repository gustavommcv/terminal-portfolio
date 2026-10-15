import { existsSync } from 'node:fs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { catalogEntry } from '../../../../../testing/english-catalog';
import { AboutSection } from './about-section';

describe('AboutSection', () => {
  let fixture: ComponentFixture<AboutSection>;
  let root: HTMLElement;

  function render(today = new Date(2026, 9, 14)): void {
    // The age is worked out when the component is made, from today's date.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(today);
    TestBed.configureTestingModule({ imports: [AboutSection] });
    fixture = TestBed.createComponent(AboutSection);
    fixture.detectChanges();
    root = fixture.nativeElement;
  }

  afterEach(() => vi.useRealTimers());

  it('is the page heading, followed by the greeting and the three paragraphs of the catalog', () => {
    render();
    const paragraphs = Array.from(root.querySelectorAll('.about-section__paragraph')).map(
      (paragraph) => paragraph.textContent?.trim(),
    );

    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      catalogEntry('about-page.about-section.title'),
    );
    expect(root.querySelector('.app-title')?.textContent?.trim()).toBe(
      catalogEntry('about-page.about-section.greeting'),
    );
    expect(paragraphs).toEqual([
      catalogEntry('about-page.about-section.p1'),
      catalogEntry('about-page.about-section.p2'),
      catalogEntry('about-page.about-section.p3'),
    ]);
  });

  it('shows where he lives, and his age and pronouns', () => {
    render();
    const [place, age] = Array.from(
      root.querySelectorAll('.about-section__additional-info p'),
    ).map((line) => line.textContent?.replace(/\s+/g, ' ').trim());

    expect(place).toBe(`Curitiba/PR - ${catalogEntry('about-page.about-section.country')}`);
    expect(age).toBe(`22 years old - ${catalogEntry('about-page.about-section.pronouns')}`);
  });

  it.each([
    ['April, before the birth month', new Date(2026, 3, 30), '21 years old'],
    ['May, the birth month', new Date(2026, 4, 1), '22 years old'],
    ['the end of the year', new Date(2026, 11, 31), '22 years old'],
    ['the next April', new Date(2027, 3, 30), '22 years old'],
    ['the next May', new Date(2027, 4, 1), '23 years old'],
  ])('works the age out from today: %s -> %s', (_when, today, expected) => {
    render(today);

    expect(root.querySelector('.about-section__additional-info')?.textContent).toContain(
      expected,
    );
  });

  it('shows his photo with its size and a name for it, and the file exists', () => {
    render();
    const photo = root.querySelector('img') as HTMLImageElement;

    expect(photo.getAttribute('alt')).toBe('Gustavo Monnerat');
    expect(photo.getAttribute('width')).toBe('584');
    expect(photo.getAttribute('height')).toBe('855');
    expect(photo.getAttribute('src')).toBe('images/me.webp');
    expect(existsSync('public/images/me.webp')).toBe(true);
  });
});
