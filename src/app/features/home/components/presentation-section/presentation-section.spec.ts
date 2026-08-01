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
    expect(fixture.nativeElement.querySelector('.presentation-section')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.home-reveal--pending')).toBeNull();
  });
});
