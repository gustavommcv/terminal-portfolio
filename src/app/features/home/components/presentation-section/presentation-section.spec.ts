import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationSection } from './presentation-section';

describe('PresentationSection', () => {
  let fixture: ComponentFixture<PresentationSection>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PresentationSection] });
    fixture = TestBed.createComponent(PresentationSection);
    fixture.detectChanges();
  });

  it('renders its complete, final presentation state when instantiated', () => {
    expect(fixture.componentInstance).toBeTruthy();
    const presentation: HTMLElement = fixture.nativeElement.querySelector(
      '.presentation-section',
    );
    expect(presentation).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.terminal-section')).toBeNull();
    expect(presentation.className).not.toMatch(/reveal|fade|stagger|animation/i);
    expect(presentation.getAttribute('style')).toBeNull();
  });
});
