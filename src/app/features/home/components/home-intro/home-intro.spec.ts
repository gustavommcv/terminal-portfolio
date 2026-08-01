import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { HOME_INTRO_CONFIG, HomeIntroConfig } from '../../home-intro.config';
import { HomeIntroService } from '../../services/home-intro.service';
import { HomeIntro } from './home-intro';

const config: HomeIntroConfig = {
  initialDelayMs: 10,
  typingIntervalMs: 5,
  completionDelayMs: 7,
  cursorBlinkIntervalMs: 500,
  revealContent: true,
  revealDurationMs: 100,
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
    TestBed.configureTestingModule({
      imports: [HomeIntro],
      providers: [{ provide: HOME_INTRO_CONFIG, useValue: config }],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createIntro(command = 'abc'): ComponentFixture<HomeIntro> {
    const fixture = TestBed.createComponent(HomeIntro);
    fixture.componentRef.setInput('command', command);
    fixture.detectChanges();
    return fixture;
  }

  function displayedCommand(fixture: ComponentFixture<HomeIntro>): string {
    fixture.detectChanges();
    return (
      fixture.nativeElement.querySelector('.command')?.textContent ?? ''
    ).trim();
  }

  it('types one complete command in order and finishes from the final character', () => {
    const fixture = createIntro();
    const service = TestBed.inject(HomeIntroService);

    expect(service.state()).toBe('typing');
    expect(displayedCommand(fixture)).toBe('');

    vi.advanceTimersByTime(10);
    expect(displayedCommand(fixture)).toBe('a');

    vi.advanceTimersByTime(5);
    expect(displayedCommand(fixture)).toBe('ab');

    vi.advanceTimersByTime(5);
    expect(displayedCommand(fixture)).toBe('abc');
    expect(service.state()).toBe('typing');

    vi.advanceTimersByTime(7);
    expect(service.state()).toBe('revealing');
  });

  it('does not finish when only part of the typing time has elapsed', () => {
    const fixture = createIntro('abcdef');
    const service = TestBed.inject(HomeIntroService);

    vi.advanceTimersByTime(20);

    expect(displayedCommand(fixture)).toBe('abc');
    expect(service.state()).toBe('typing');
  });

  it('cancels pending callbacks and consumes the sequence on destroy', () => {
    const fixture = createIntro('abcdef');
    const service = TestBed.inject(HomeIntroService);
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    vi.advanceTimersByTime(10);
    fixture.destroy();

    expect(service.state()).toBe('completed');
    expect(clearTimeoutSpy).toHaveBeenCalled();

    vi.advanceTimersByTime(1_000);
    expect(service.state()).toBe('completed');
  });

  it('does not create another typing loop after the lifecycle was consumed', () => {
    const first = createIntro('abc');
    first.destroy();

    const second = createIntro('abc');

    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(vi.getTimerCount()).toBe(0);
    expect(displayedCommand(second)).toBe('abc');
  });

  it('skips typing immediately when reduced motion is already requested', () => {
    mockMatchMedia(true);
    const fixture = createIntro('whoami');

    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(displayedCommand(fixture)).toBe('whoami');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops an active sequence if reduced motion is enabled while typing', () => {
    const media = mockMatchMedia(false);
    const fixture = createIntro('whoami');

    vi.advanceTimersByTime(10);
    media.dispatch(true);

    expect(TestBed.inject(HomeIntroService).state()).toBe('completed');
    expect(displayedCommand(fixture)).toBe('whoami');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('types Unicode code points without truncating translated commands', () => {
    const fixture = createIntro('ação');

    vi.advanceTimersByTime(10 + 5 * 3);

    expect(displayedCommand(fixture)).toBe('ação');
  });

  it.each([
    ['English', 'whoami'],
    ['Brazilian Portuguese', 'whoami'],
  ])('completes the %s catalog command', (_language, command) => {
    const fixture = createIntro(command);

    vi.advanceTimersByTime(10 + 5 * (Array.from(command).length - 1));

    expect(displayedCommand(fixture)).toBe(command);
    expect(TestBed.inject(HomeIntroService).state()).toBe('typing');

    vi.advanceTimersByTime(7);
    expect(TestBed.inject(HomeIntroService).state()).toBe('revealing');
  });
});
