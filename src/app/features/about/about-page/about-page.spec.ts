import { ComponentFixture, TestBed } from '@angular/core/testing';

import { catalogEntry } from '../../../../testing/english-catalog';
import { AboutPage } from './about-page';

describe('AboutPage', () => {
  let fixture: ComponentFixture<AboutPage>;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AboutPage] });
    fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('puts experience between the introduction and education', () => {
    const sections = Array.from(root.querySelector('.about-page')!.children).map((section) =>
      section.tagName.toLowerCase(),
    );

    expect(sections).toEqual([
      'app-about-section',
      'app-experience-section',
      'app-education-section',
      'app-list-section',
      'app-list-section',
      'app-download-section',
    ]);
  });

  it('has exactly one h1, and the other sections are h2 below it', () => {
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelector('app-about-section h1')).not.toBeNull();
    expect(root.querySelectorAll('h2')).toHaveLength(5);
  });

  describe.each([
    ['interests', 'interests'],
    ['languages', 'languages'],
  ])('the %s list', (name, items) => {
    const section = (): HTMLElement =>
      Array.from(root.querySelectorAll<HTMLElement>('app-list-section'))[name === 'interests' ? 0 : 1];

    it('shows its title from the catalog', () => {
      expect(section().querySelector('h2')?.textContent?.trim()).toBe(
        catalogEntry(`about-page.${name}-section.title`),
      );
    });

    it('lists every item of the catalog, in its order', () => {
      const expected = catalogEntry<string[]>(`about-page.${name}-section.${items}`);
      const shown = Array.from(section().querySelectorAll('li')).map((item) => item.textContent?.trim());

      expect(expected.length).toBeGreaterThan(0);
      expect(shown).toEqual(expected);
    });

    it(`shows the command glow ${name}.md`, () => {
      expect(section().textContent).toContain(`glow ${name}.md`);
    });
  });
});
