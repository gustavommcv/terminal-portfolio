import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';

import { ProjectsDataService } from '../../../services/projects-data.service';
import { HOME_INTRO_CONFIG, HomeIntroConfig } from '../home-intro.config';
import { HomeIntroService } from '../services/home-intro.service';
import { HomePage } from './home-page';

const config: HomeIntroConfig = {
  initialDelayMs: 10,
  typingIntervalMs: 5,
  completionDelayMs: 7,
  cursorBlinkIntervalMs: 500,
  revealContent: true,
  revealDurationMs: 100,
};

function mockMatchMedia(matches: boolean): void {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList);
}

describe('HomePage intro lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [{ provide: HOME_INTRO_CONFIG, useValue: config }],
    });

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      'home-page': {
        'presentation-section': { command: 'whoami' },
      },
    });
    translate.use('en');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function createHome(): ComponentFixture<HomePage> {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    return fixture;
  }

  function completeTyping(fixture: ComponentFixture<HomePage>): void {
    // 10ms initial delay + five 5ms gaps for six characters + 7ms final pause.
    vi.advanceTimersByTime(42);
    fixture.detectChanges();
  }

  function finishReveal(fixture: ComponentFixture<HomePage>): void {
    const content: HTMLElement = fixture.nativeElement.querySelector(
      '[data-testid="home-content"]',
    );
    content.dispatchEvent(new Event('animationend'));
    fixture.detectChanges();
  }

  it('renders only the terminal intro on the first eligible home render', () => {
    const projectsConstructorEffect = vi.spyOn(
      ProjectsDataService.prototype,
      'getFeaturedProjects',
    );
    const fixture = createHome();

    expect(fixture.nativeElement.querySelector('[data-testid="home-intro"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="home-content"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('presentation-section')).toBeNull();
    expect(fixture.nativeElement.querySelector('services-section')).toBeNull();
    expect(fixture.nativeElement.querySelector('tech-stack-section')).toBeNull();
    expect(fixture.nativeElement.querySelector('featured-projects-section')).toBeNull();
    expect(fixture.nativeElement.querySelector('contact-section')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-footer')).toBeNull();
    expect(projectsConstructorEffect).not.toHaveBeenCalled();
  });

  it('keeps the complete secondary component tree absent after partial typing', () => {
    const fixture = createHome();

    vi.advanceTimersByTime(20);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.command')?.textContent.trim()).toBe(
      'who',
    );
    expect(fixture.nativeElement.querySelector('[data-testid="home-content"]')).toBeNull();
  });

  it('mounts secondary components only after the complete command and final pause', () => {
    const projectsConstructorEffect = vi.spyOn(
      ProjectsDataService.prototype,
      'getFeaturedProjects',
    );
    const fixture = createHome();

    vi.advanceTimersByTime(35);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="home-content"]')).toBeNull();

    vi.advanceTimersByTime(7);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="home-intro"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="home-content"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('presentation-section')).not.toBeNull();
    expect(projectsConstructorEffect).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(HomeIntroService).state()).toBe('revealing');
  });

  it('finishes the initial reveal once and cannot replay it', () => {
    const fixture = createHome();
    completeTyping(fixture);

    const content: HTMLElement = fixture.nativeElement.querySelector(
      '[data-testid="home-content"]',
    );
    expect(content.classList.contains('home-content--revealing')).toBe(true);

    finishReveal(fixture);
    content.dispatchEvent(new Event('animationend'));
    fixture.detectChanges();

    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(content.classList.contains('home-content--revealing')).toBe(false);
  });

  it('consumes an interrupted typing run and returns immediately in the final state', () => {
    const first = createHome();
    vi.advanceTimersByTime(15);
    first.destroy();

    expect(vi.getTimerCount()).toBe(0);
    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');

    const second = createHome();
    const content: HTMLElement = second.nativeElement.querySelector(
      '[data-testid="home-content"]',
    );

    expect(second.nativeElement.querySelector('[data-testid="home-intro"]')).toBeNull();
    expect(content).not.toBeNull();
    expect(content.classList.contains('home-content--revealing')).toBe(false);
  });

  it('returns after normal completion without replaying typing or secondary reveal', () => {
    const first = createHome();
    completeTyping(first);
    finishReveal(first);
    first.destroy();

    const second = createHome();
    const content: HTMLElement = second.nativeElement.querySelector(
      '[data-testid="home-content"]',
    );

    expect(second.nativeElement.querySelector('[data-testid="home-intro"]')).toBeNull();
    expect(content.classList.contains('home-content--revealing')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('renders complete content without either animation for reduced motion', () => {
    mockMatchMedia(true);
    const fixture = createHome();
    fixture.detectChanges();

    const content: HTMLElement = fixture.nativeElement.querySelector(
      '[data-testid="home-content"]',
    );
    expect(fixture.nativeElement.querySelector('[data-testid="home-intro"]')).toBeNull();
    expect(content).not.toBeNull();
    expect(content.classList.contains('home-content--revealing')).toBe(false);
    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(vi.getTimerCount()).toBe(0);
  });
});
