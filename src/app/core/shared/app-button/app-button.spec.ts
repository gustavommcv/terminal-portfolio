import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { AppButton } from './app-button';

describe('AppButton', () => {
  let fixture: ComponentFixture<AppButton>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AppButton] });
    fixture = TestBed.createComponent(AppButton);
  });

  it('renders a normal localized route without bypassing URL sanitization', () => {
    fixture.componentRef.setInput('route', '/portfolio');
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('href')).toBe('/portfolio');
  });

  it('uses instant in-page scrolling when reduced motion is requested', () => {
    const target = document.createElement('div');
    target.id = 'target';
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    fixture.componentRef.setInput('scrollTo', 'target');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('a').click();

    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant' });
    target.remove();
  });
});
