import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalSection } from './terminal-section';

describe('TerminalSection', () => {
  let component: TerminalSection;
  let fixture: ComponentFixture<TerminalSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminalSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerminalSection);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('customTitle', 'Who am I');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the title it is given, with no default of its own', () => {
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe(
      'Who am I',
    );
  });
});
