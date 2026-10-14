import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('gives the heart a role, since a name on a role-less span is ignored', () => {
    const heart: HTMLElement = fixture.nativeElement.querySelector('.footer__heart');

    expect(heart.getAttribute('role')).toBe('img');
    expect(heart.getAttribute('aria-label')).toBe('love');
  });
});
