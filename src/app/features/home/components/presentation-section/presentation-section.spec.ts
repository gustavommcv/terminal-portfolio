import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationSection } from './presentation-section';
import { HOME_INTRO_LAYOUT_RESERVATIONS } from '../../home-intro-layout-reservations';

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

  it('links his LinkedIn and GitHub profiles, opening them safely in a new tab', () => {
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.social-links a'),
    ) as HTMLAnchorElement[];

    expect(
      links.map((link) => [link.textContent?.trim(), link.getAttribute('href')]),
    ).toEqual([
      ['LinkedIn', 'https://www.linkedin.com/in/gustavommcv/'],
      ['GitHub', 'https://github.com/gustavommcv'],
    ]);
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  it('has a button that scrolls to the contact section', () => {
    const button = fixture.nativeElement.querySelector('app-button a') as HTMLAnchorElement;

    expect(button.getAttribute('href')).toBe('#contact-section');
  });

  it('renders explicit sizing content without consulting translation keys', () => {
    fixture.componentRef.setInput(
      'content',
      HOME_INTRO_LAYOUT_RESERVATIONS.pt.presentation,
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Desenvolvedor de Software',
    );
    expect(fixture.nativeElement.textContent).toContain(
      HOME_INTRO_LAYOUT_RESERVATIONS.pt.presentation.about,
    );
    expect(fixture.nativeElement.textContent).not.toContain(
      'home-page.presentation-section',
    );
  });
});
