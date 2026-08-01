import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';

import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';
import { ProjectsDataService } from '../../../services/projects-data.service';
import { InitialNavigationRouterStub } from '../../../../testing/initial-navigation-router.stub';
import { HOME_INTRO_CONFIG, HomeIntroConfig } from '../home-intro.config';
import { HOME_INTRO_LAYOUT_RESERVATIONS } from '../home-intro-layout-reservations';
import { HomeIntroCommandService } from '../services/home-intro-command.service';
import { HomeIntroService } from '../services/home-intro.service';
import { HomePage } from './home-page';

const config: HomeIntroConfig = {
  initialDelayMs: 10,
  typingIntervalMs: 5,
  completionDelayMs: 7,
  cursorBlinkIntervalMs: 500,
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
  let router: InitialNavigationRouterStub;

  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
    router = new InitialNavigationRouterStub();
    router.hydrateAt('/');
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        { provide: HOME_INTRO_CONFIG, useValue: config },
        { provide: Router, useValue: router },
        {
          provide: HomeIntroCommandService,
          useValue: {
            state: signal({
              status: 'ready' as const,
              language: 'en' as const,
              command: 'whoami',
            }).asReadonly(),
            layoutReservation: signal(
              HOME_INTRO_LAYOUT_RESERVATIONS.en,
            ).asReadonly(),
          },
        },
      ],
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
    fixture.detectChanges();
    return fixture;
  }

  function completeTyping(fixture: ComponentFixture<HomePage>): void {
    // 10ms initial delay + five 5ms gaps for six characters + 7ms final pause.
    vi.advanceTimersByTime(42);
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
    expect(
      fixture.nativeElement.querySelector(
        '.terminal-section__visible-content presentation-section',
      ),
    ).toBeNull();
    const reservation: HTMLElement = fixture.nativeElement.querySelector(
      '.terminal-section__layout-reservation',
    );
    expect(reservation.getAttribute('aria-hidden')).toBe('true');
    expect(reservation.hasAttribute('inert')).toBe(true);
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

    expect(
      fixture.nativeElement
        .querySelector('.terminal-section__visible-content .command')
        ?.textContent.trim(),
    ).toBe('who');
    expect(fixture.nativeElement.querySelector('[data-testid="home-content"]')).toBeNull();
  });

  it('mounts secondary components only after the complete command and final pause', () => {
    const projectsConstructorEffect = vi.spyOn(
      ProjectsDataService.prototype,
      'getFeaturedProjects',
    );
    const fixture = createHome();
    const terminalElementBefore: HTMLElement =
      fixture.nativeElement.querySelector('.terminal-section');
    const reservationBefore: HTMLElement = fixture.nativeElement.querySelector(
      '.terminal-section__layout-reservation',
    );
    const terminalInstanceBefore = fixture.debugElement.query(
      By.directive(TerminalSection),
    ).componentInstance;

    vi.advanceTimersByTime(35);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="home-content"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.terminal-section')).toBe(
      terminalElementBefore,
    );

    vi.advanceTimersByTime(7);
    fixture.detectChanges();

    const terminalElementAfter: HTMLElement =
      fixture.nativeElement.querySelector('.terminal-section');
    const terminalInstanceAfter = fixture.debugElement.query(
      By.directive(TerminalSection),
    ).componentInstance;

    expect(fixture.nativeElement.querySelector('[data-testid="home-intro"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="home-content"]')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        '.terminal-section__visible-content presentation-section',
      ),
    ).not.toBeNull();
    expect(terminalElementAfter).toBe(terminalElementBefore);
    expect(
      fixture.nativeElement.querySelector(
        '.terminal-section__layout-reservation',
      ),
    ).toBe(reservationBefore);
    expect(reservationBefore.getAttribute('aria-hidden')).toBe('true');
    expect(reservationBefore.hasAttribute('inert')).toBe(true);
    expect(terminalInstanceAfter).toBe(terminalInstanceBefore);
    expect(projectsConstructorEffect).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
  });

  it('gives one lower container the eligible opacity entrance state', () => {
    const fixture = createHome();
    const terminalElement: HTMLElement =
      fixture.nativeElement.querySelector('.terminal-section');

    completeTyping(fixture);

    const presentation: HTMLElement = fixture.nativeElement.querySelector(
      '.home-presentation',
    );
    const content: HTMLElement = fixture.nativeElement.querySelector(
      '[data-testid="home-content"]',
    );
    const footer: HTMLElement = fixture.nativeElement.querySelector('app-footer');

    expect(content.classList.contains('home-content--intro-reveal')).toBe(true);
    expect(
      fixture.nativeElement.querySelectorAll('.home-content--intro-reveal'),
    ).toHaveLength(1);

    for (const element of [presentation, footer]) {
      expect(element.className).not.toMatch(/reveal|fade|stagger|transition|animation/i);
      expect(element.getAttribute('style')).toBeNull();
    }
    expect(content.getAttribute('style')).toBeNull();
    expect(terminalElement.className).toBe('terminal-section');
    expect(terminalElement.closest('.home-content--intro-reveal')).toBeNull();
  });

  it('keeps reservation and visible layers stable when lower content mounts', () => {
    const fixture = createHome();
    const terminal: HTMLElement =
      fixture.nativeElement.querySelector('.terminal-section');
    const reservation: HTMLElement = fixture.nativeElement.querySelector(
      '.terminal-section__layout-reservation',
    );
    const visibleLayer: HTMLElement = fixture.nativeElement.querySelector(
      '.terminal-section__visible-content',
    );

    completeTyping(fixture);

    expect(fixture.nativeElement.querySelector('.terminal-section')).toBe(
      terminal,
    );
    expect(
      fixture.nativeElement.querySelector(
        '.terminal-section__layout-reservation',
      ),
    ).toBe(reservation);
    expect(
      fixture.nativeElement.querySelector(
        '.terminal-section__visible-content',
      ),
    ).toBe(visibleLayer);
    expect(reservation.className).toBe(
      'terminal-section__layout-reservation',
    );
    expect(terminal.className).toBe('terminal-section');
  });

  it('instantiates secondary content exactly once in the completed state', () => {
    const projectsConstructorEffect = vi.spyOn(
      ProjectsDataService.prototype,
      'getFeaturedProjects',
    );
    const fixture = createHome();
    completeTyping(fixture);

    const contentBefore: HTMLElement = fixture.nativeElement.querySelector(
      '[data-testid="home-content"]',
    );
    vi.advanceTimersByTime(1_000);
    fixture.detectChanges();
    const contentAfter: HTMLElement = fixture.nativeElement.querySelector(
      '[data-testid="home-content"]',
    );

    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(contentAfter).toBe(contentBefore);
    expect(projectsConstructorEffect).toHaveBeenCalledTimes(1);
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

    expect(second.nativeElement.querySelector('[data-testid="home-intro"]')).not.toBeNull();
    expect(content).not.toBeNull();
    expect(content.classList.contains('home-content--intro-reveal')).toBe(false);
    expect(
      second.nativeElement
        .querySelector('.terminal-section__visible-content .command')
        ?.textContent.trim(),
    ).toBe('whoami');
  });

  it('returns after normal completion without replaying typing or secondary reveal', () => {
    const first = createHome();
    completeTyping(first);
    first.destroy();

    const second = createHome();
    const content: HTMLElement = second.nativeElement.querySelector(
      '[data-testid="home-content"]',
    );

    expect(second.nativeElement.querySelector('[data-testid="home-intro"]')).not.toBeNull();
    expect(content).not.toBeNull();
    expect(content.classList.contains('home-content--intro-reveal')).toBe(false);
    expect(
      second.nativeElement
        .querySelector('.terminal-section__visible-content .command')
        ?.textContent.trim(),
    ).toBe('whoami');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('renders complete content without either animation for reduced motion', () => {
    mockMatchMedia(true);
    const fixture = createHome();
    fixture.detectChanges();

    const content: HTMLElement = fixture.nativeElement.querySelector(
      '[data-testid="home-content"]',
    );
    expect(fixture.nativeElement.querySelector('[data-testid="home-intro"]')).not.toBeNull();
    expect(content).not.toBeNull();
    expect(content.classList.contains('home-content--intro-reveal')).toBe(false);
    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['/portfolio', '/about'])(
    'renders completed content immediately after starting on %s',
    (initialUrl) => {
      router.hydrateAt(initialUrl);
      const fixture = createHome();
      const content: HTMLElement = fixture.nativeElement.querySelector(
        '[data-testid="home-content"]',
      );

      expect(content).not.toBeNull();
      expect(content.classList.contains('home-content--intro-reveal')).toBe(false);
      expect(
        fixture.nativeElement
          .querySelector('.terminal-section__visible-content .command')
          ?.textContent.trim(),
      ).toBe('whoami');
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it('cannot leave returning content transparent after an interrupted reveal', () => {
    const first = createHome();
    completeTyping(first);
    const firstContent: HTMLElement = first.nativeElement.querySelector(
      '[data-testid="home-content"]',
    );
    expect(firstContent.classList.contains('home-content--intro-reveal')).toBe(true);
    expect(firstContent.getAttribute('style')).toBeNull();
    first.destroy();

    const returning = createHome();
    const returningContent: HTMLElement = returning.nativeElement.querySelector(
      '[data-testid="home-content"]',
    );
    expect(returningContent.classList.contains('home-content--intro-reveal')).toBe(false);
    expect(returningContent.getAttribute('style')).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});
