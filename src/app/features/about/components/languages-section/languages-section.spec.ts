import { ComponentFixture, TestBed } from '@angular/core/testing';

import { catalogEntry } from '../../../../../testing/english-catalog';
import { LanguagesSection } from './languages-section';

describe('LanguagesSection', () => {
  let fixture: ComponentFixture<LanguagesSection>;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LanguagesSection] });
    fixture = TestBed.createComponent(LanguagesSection);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('shows the section title from the catalog', () => {
    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      catalogEntry('about-page.languages-section.title'),
    );
  });

  it('lists every language of the catalog, in its order', () => {
    const languages = catalogEntry<string[]>('about-page.languages-section.languages');
    const shown = Array.from(root.querySelectorAll('.languages-container li')).map(
      (item) => item.textContent?.trim(),
    );

    expect(languages.length).toBeGreaterThan(0);
    expect(shown).toEqual(languages);
  });
});
