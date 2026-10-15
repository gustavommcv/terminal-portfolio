import { ComponentFixture, TestBed } from '@angular/core/testing';

import { catalogEntry } from '../../../../../testing/english-catalog';
import { EducationSection } from './education-section';

interface Degree {
  title: string;
  type: string;
  data: string;
}

describe('EducationSection', () => {
  let fixture: ComponentFixture<EducationSection>;
  let root: HTMLElement;
  const degrees = catalogEntry<Degree[]>('about-page.education-section.degrees');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [EducationSection] });
    fixture = TestBed.createComponent(EducationSection);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('shows the section title from the catalog', () => {
    expect(root.querySelector('h2')?.textContent?.trim()).toBe(
      catalogEntry('about-page.education-section.title'),
    );
  });

  it('shows every degree of the catalog with its type and period, in order', () => {
    const items = Array.from(root.querySelectorAll('.education-container__item'));

    expect(degrees.length).toBeGreaterThan(1);
    expect(items).toHaveLength(degrees.length);
    items.forEach((item, index) => {
      expect(item.querySelector('h3')?.textContent?.trim()).toBe(degrees[index].title);
      const info = Array.from(item.querySelectorAll('.education-container__info')).map(
        (line) => line.textContent?.trim(),
      );
      expect(info).toEqual([degrees[index].type, degrees[index].data]);
    });
  });

  it('puts an arrow between degrees and none after the last', () => {
    const container = root.querySelector('.education-container') as HTMLElement;
    const sequence = Array.from(container.children)
      .filter((child) => child.matches('.education-container__item, .education-container__split'))
      .map((child) => (child.classList.contains('education-container__split') ? 'arrow' : 'degree'));

    expect(root.querySelectorAll('.education-container__split')).toHaveLength(
      degrees.length - 1,
    );
    expect(sequence.at(-1)).toBe('degree');
    expect(sequence.join(' ')).toBe(
      degrees.map(() => 'degree').join(' arrow '),
    );
  });
});
