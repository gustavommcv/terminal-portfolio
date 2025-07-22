import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageToggleButton } from './language-toggle-button';

describe('LanguageToggleButton', () => {
  let component: LanguageToggleButton;
  let fixture: ComponentFixture<LanguageToggleButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageToggleButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguageToggleButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
