import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PresentationSection } from './presentation-section';
import { HomeRevealDirective } from '../../directives/home-reveal.directive';

function mockMatchMedia(matches: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('PresentationSection', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    TestBed.configureTestingModule({
      imports: [PresentationSection],
    });
  });

  function createFixture(): ComponentFixture<PresentationSection> {
    const fixture = TestBed.createComponent(PresentationSection);
    fixture.detectChanges();
    return fixture;
  }

  function revealEl(fixture: ComponentFixture<PresentationSection>): HTMLElement {
    return fixture.debugElement.query(By.directive(HomeRevealDirective))
      .nativeElement as HTMLElement;
  }

  function terminalLineEl(fixture: ComponentFixture<PresentationSection>): HTMLElement {
    return fixture.nativeElement.querySelector('.terminal-line');
  }

  it('should create', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('plays the typing animation and keeps the rest of the content pending on a first visit', () => {
    const fixture = createFixture();

    expect(terminalLineEl(fixture).classList.contains('typing-animation')).toBe(true);
    expect(revealEl(fixture).classList.contains('home-reveal--pending')).toBe(true);
    expect(revealEl(fixture).classList.contains('fade')).toBe(false);
  });

  it('reveals the rest of the content only after the typing animation ends', () => {
    const fixture = createFixture();

    terminalLineEl(fixture).dispatchEvent(new Event('animationend'));
    fixture.detectChanges();

    expect(revealEl(fixture).classList.contains('home-reveal--pending')).toBe(false);
    expect(revealEl(fixture).classList.contains('fade')).toBe(true);
  });

  it('shows everything immediately on a later visit, without replaying typing or the fade', () => {
    const first = createFixture();
    first.destroy();

    const second = createFixture();

    expect(terminalLineEl(second).classList.contains('typing-animation')).toBe(false);
    expect(revealEl(second).classList.contains('home-reveal--pending')).toBe(false);
    expect(revealEl(second).classList.contains('fade')).toBe(false);
  });

  it('settles both typing and the reveal if the page is left mid-animation, so a later visit is complete', () => {
    const first = createFixture();
    // Destroyed before `animationend` ever fires: simulates navigating away
    // while the terminal is still typing.
    first.destroy();

    const second = createFixture();

    expect(terminalLineEl(second).classList.contains('typing-animation')).toBe(false);
    expect(revealEl(second).classList.contains('home-reveal--pending')).toBe(false);
  });

  it('shows everything immediately under reduced motion, with no hidden phase and no animation', () => {
    mockMatchMedia(true);

    const fixture = createFixture();

    expect(terminalLineEl(fixture).classList.contains('typing-animation')).toBe(false);
    expect(revealEl(fixture).classList.contains('home-reveal--pending')).toBe(false);
    expect(revealEl(fixture).classList.contains('fade')).toBe(false);
  });
});
