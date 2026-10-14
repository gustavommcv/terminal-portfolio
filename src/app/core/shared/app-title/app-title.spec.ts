import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTitle } from './app-title';

describe('AppTitle', () => {
  let component: AppTitle;
  let fixture: ComponentFixture<AppTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTitle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppTitle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is not a heading, since the section title above it already is one', () => {
    fixture.componentRef.setInput('title', 'My Services');

    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
    expect(element.querySelector('.app-title')?.textContent).toBe(
      'My Services',
    );
  });
});
