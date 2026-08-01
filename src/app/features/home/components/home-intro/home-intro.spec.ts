import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { InitialNavigationRouterStub } from '../../../../../testing/initial-navigation-router.stub';
import { HOME_INTRO_CONFIG, HomeIntroConfig } from '../../home-intro.config';
import { HOME_INTRO_LAYOUT_RESERVATIONS } from '../../home-intro-layout-reservations';
import { HomeIntroCommandState } from '../../services/home-intro-command.service';
import { HomeIntroService } from '../../services/home-intro.service';
import { HomeIntro } from './home-intro';

const config: HomeIntroConfig = {
  initialDelayMs: 10,
  typingIntervalMs: 5,
  completionDelayMs: 7,
  cursorBlinkIntervalMs: 500,
};

function mockMatchMedia(initialMatches: boolean): {
  dispatch(matches: boolean): void;
} {
  let listener: ((event: MediaQueryListEvent) => void) | undefined;
  window.matchMedia = vi.fn().mockReturnValue({
    matches: initialMatches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(
      (_type: string, callback: (event: MediaQueryListEvent) => void) => {
        listener = callback;
      },
    ),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList);

  return {
    dispatch(matches: boolean): void {
      listener?.({ matches } as MediaQueryListEvent);
    },
  };
}

describe('HomeIntro', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
    const router = new InitialNavigationRouterStub();
    router.hydrateAt('/');
    TestBed.configureTestingModule({
      imports: [HomeIntro],
      providers: [
        { provide: HOME_INTRO_CONFIG, useValue: config },
        { provide: Router, useValue: router },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  function ready(command: string): HomeIntroCommandState {
    return { status: 'ready', language: 'en', command };
  }

  function createIntro(
    commandState: HomeIntroCommandState = ready('abc'),
  ): ComponentFixture<HomeIntro> {
    const fixture = TestBed.createComponent(HomeIntro);
    fixture.componentRef.setInput('commandState', commandState);
    fixture.componentRef.setInput(
      'layoutReservation',
      HOME_INTRO_LAYOUT_RESERVATIONS.en,
    );
    fixture.detectChanges();
    fixture.detectChanges();
    return fixture;
  }

  function displayedCommand(fixture: ComponentFixture<HomeIntro>): string {
    fixture.detectChanges();
    return (
      fixture.nativeElement.querySelector(
        '.terminal-section__visible-content .command',
      )?.textContent ?? ''
    ).trim();
  }

  it('keeps a stable, empty terminal while the catalog is unresolved', () => {
    const fixture = createIntro({ status: 'waiting' });
    const terminal = fixture.nativeElement.querySelector('.terminal-section');
    const reservation: HTMLElement = fixture.nativeElement.querySelector(
      '.terminal-section__layout-reservation',
    );

    vi.advanceTimersByTime(1_000);

    expect(TestBed.inject(HomeIntroService).state()).toBe('waiting');
    expect(displayedCommand(fixture)).toBe('');
    expect(fixture.nativeElement.textContent).not.toContain(
      'home-page.presentation-section.command',
    );
    expect(fixture.nativeElement.querySelector('.terminal-section')).toBe(
      terminal,
    );
    expect(reservation.getAttribute('aria-hidden')).toBe('true');
    expect(reservation.hasAttribute('inert')).toBe(true);
    expect(reservation.textContent).toContain('whoami');
    expect(reservation.querySelectorAll('[id]')).toHaveLength(0);
    expect(reservation.querySelectorAll('a').length).toBeGreaterThan(0);
    expect(
      reservation.querySelector('.terminal-cursor--static'),
    ).not.toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps the same reserved rows and terminal node through typing and completion', () => {
    const fixture = createIntro(ready('abc'));
    const terminal: HTMLElement =
      fixture.nativeElement.querySelector('.terminal-section');
    const reservation: HTMLElement = fixture.nativeElement.querySelector(
      '.terminal-section__layout-reservation',
    );
    const visibleContent: HTMLElement = fixture.nativeElement.querySelector(
      '.terminal-section__visible-content',
    );

    vi.advanceTimersByTime(10);
    fixture.detectChanges();
    expect(displayedCommand(fixture)).toBe('a');
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
    ).toBe(visibleContent);

    vi.advanceTimersByTime(17);
    fixture.detectChanges();
    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(fixture.nativeElement.querySelector('.terminal-section')).toBe(
      terminal,
    );
    expect(
      fixture.nativeElement.querySelector(
        '.terminal-section__layout-reservation',
      ),
    ).toBe(reservation);
  });

  it('does not restart typing or create stale callbacks after a resize', () => {
    const fixture = createIntro(ready('abcdef'));
    vi.advanceTimersByTime(15);
    fixture.detectChanges();
    const progress = displayedCommand(fixture);
    const timersBeforeResize = vi.getTimerCount();

    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    expect(displayedCommand(fixture)).toBe(progress);
    expect(vi.getTimerCount()).toBe(timersBeforeResize);
    vi.advanceTimersByTime(22);
    expect(displayedCommand(fixture)).toBe('abcdef');
  });

  it('starts once after the resolved command arrives', () => {
    const fixture = createIntro({ status: 'waiting' });

    fixture.componentRef.setInput('commandState', ready('abc'));
    fixture.detectChanges();

    expect(TestBed.inject(HomeIntroService).state()).toBe('typing');
    expect(displayedCommand(fixture)).toBe('');
    vi.advanceTimersByTime(10);
    expect(displayedCommand(fixture)).toBe('a');
    vi.advanceTimersByTime(10);
    expect(displayedCommand(fixture)).toBe('abc');
    vi.advanceTimersByTime(7);
    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
  });

  it('does not mix languages when the catalog changes during typing', () => {
    const fixture = createIntro(ready('whoami'));
    vi.advanceTimersByTime(15);
    expect(displayedCommand(fixture)).toBe('wh');

    fixture.componentRef.setInput('commandState', {
      status: 'ready',
      language: 'pt',
      command: 'quem-sou-eu',
    });
    fixture.detectChanges();
    vi.advanceTimersByTime(25);

    expect(displayedCommand(fixture)).toBe('whoami');
    vi.advanceTimersByTime(7);
    expect(displayedCommand(fixture)).toBe('quem-sou-eu');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('completes safely without exposing a key when loading fails', () => {
    const fixture = createIntro({ status: 'waiting' });

    fixture.componentRef.setInput('commandState', {
      status: 'unavailable',
      language: 'en',
      reason: 'catalog-load-failed',
    });
    fixture.detectChanges();

    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(displayedCommand(fixture)).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels pending callbacks and consumes the sequence on destroy', () => {
    const fixture = createIntro(ready('abcdef'));
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    vi.advanceTimersByTime(10);
    fixture.destroy();

    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('does not replay after the lifecycle was consumed', () => {
    const first = createIntro(ready('abc'));
    first.destroy();

    const second = createIntro(ready('abc'));

    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(displayedCommand(second)).toBe('abc');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('mounts immediately and waits without animation for reduced motion', () => {
    mockMatchMedia(true);
    const fixture = createIntro({ status: 'waiting' });

    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(displayedCommand(fixture)).toBe('');

    fixture.componentRef.setInput('commandState', ready('whoami'));
    fixture.detectChanges();

    expect(displayedCommand(fixture)).toBe('whoami');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops an active sequence if reduced motion is enabled', () => {
    const media = mockMatchMedia(false);
    const fixture = createIntro(ready('whoami'));
    vi.advanceTimersByTime(10);

    media.dispatch(true);

    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(displayedCommand(fixture)).toBe('whoami');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('types Unicode code points without truncation', () => {
    const fixture = createIntro(ready('ação'));
    vi.advanceTimersByTime(10 + 5 * 3);
    expect(displayedCommand(fixture)).toBe('ação');
  });
});
