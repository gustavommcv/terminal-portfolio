import { existsSync } from 'node:fs';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { catalogEntry } from '../../../../../testing/english-catalog';
import { TechStackSection } from './tech-stack-section';

describe('TechStackSection', () => {
  let fixture: ComponentFixture<TechStackSection>;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TechStackSection] });
    fixture = TestBed.createComponent(TechStackSection);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('shows the section title from the catalog', () => {
    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      catalogEntry('home-page.tech-stack-section.title'),
    );
  });

  it('lists the stack, with break hints that do not change the words', () => {
    const items = Array.from(root.querySelectorAll('.tech-stack-section__item')).map(
      (item) => item.textContent?.replace(/\s+/g, ' ').trim(),
    );

    expect(items).toEqual([
      'Go',
      'JavaScript/TypeScript/Angular',
      'HTML/CSS/Sass',
      'Linux',
      'AWS/Cloudflare/Vercel',
      'Arduino',
      'Creo Parametric/Bambu Studio',
      'Claude',
    ]);
  });

  it('shows the gopher, sized so the layout does not jump, with a smaller file on narrow screens', () => {
    const image = root.querySelector('img') as HTMLImageElement;
    const source = root.querySelector('picture source') as HTMLSourceElement;

    expect(image.getAttribute('alt')).toBe('Go Gopher');
    expect(image.getAttribute('width')).toBe('371');
    expect(image.getAttribute('height')).toBe('263');
    expect(image.getAttribute('src')).toBe('images/gopher-l.webp');
    expect(source.getAttribute('media')).toBe('(max-width: 1180px)');
    expect(source.getAttribute('srcset')).toBe('images/gopher-s.webp');
  });

  it('points at image files that exist', () => {
    expect(existsSync('public/images/gopher-l.webp')).toBe(true);
    expect(existsSync('public/images/gopher-s.webp')).toBe(true);
  });
});
