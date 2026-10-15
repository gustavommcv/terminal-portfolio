import { ComponentFixture, TestBed } from '@angular/core/testing';

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

  it('puts the five sections in order: about, education, interests, languages, download', () => {
    const sections = Array.from(root.querySelector('.about-page')!.children).map((section) =>
      section.tagName.toLowerCase(),
    );

    expect(sections).toEqual([
      'app-about-section',
      'app-education-section',
      'app-interests-section',
      'app-languages-section',
      'app-download-section',
    ]);
  });

  it('has exactly one h1, and the other sections are h2 below it', () => {
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelector('app-about-section h1')).not.toBeNull();
    expect(root.querySelectorAll('h2')).toHaveLength(4);
  });
});
