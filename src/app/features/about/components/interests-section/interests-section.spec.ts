import { ComponentFixture, TestBed } from '@angular/core/testing';

import { catalogEntry } from '../../../../../testing/english-catalog';
import { InterestsSection } from './interests-section';

describe('InterestsSection', () => {
  let fixture: ComponentFixture<InterestsSection>;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [InterestsSection] });
    fixture = TestBed.createComponent(InterestsSection);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('shows the section title from the catalog', () => {
    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      catalogEntry('about-page.interests-section.title'),
    );
  });

  it('lists every interest of the catalog, in its order', () => {
    const interests = catalogEntry<string[]>('about-page.interests-section.interests');
    const shown = Array.from(root.querySelectorAll('.interests-container li')).map(
      (item) => item.textContent?.trim(),
    );

    expect(interests.length).toBeGreaterThan(0);
    expect(shown).toEqual(interests);
  });
});
