import { TestBed } from '@angular/core/testing';

import { HOME_INTRO_CONFIG, HomeIntroConfig } from '../home-intro.config';
import { HomeIntroService } from './home-intro.service';

const config: HomeIntroConfig = {
  initialDelayMs: 10,
  typingIntervalMs: 5,
  completionDelayMs: 7,
  cursorBlinkIntervalMs: 500,
};

describe('HomeIntroService', () => {
  function createService(): HomeIntroService {
    TestBed.configureTestingModule({
      providers: [{ provide: HOME_INTRO_CONFIG, useValue: config }],
    });
    return TestBed.inject(HomeIntroService);
  }

  it('starts idle with only the intro tree eligible to render', () => {
    const service = createService();

    expect(service.state()).toBe('idle');
    expect(service.introVisible()).toBe(true);
    expect(service.contentVisible()).toBe(false);
  });

  it('allows exactly one typing run and prevents overlapping claims', () => {
    const service = createService();

    expect(service.begin(false)).toBe(true);
    expect(service.begin(false)).toBe(false);
    expect(service.state()).toBe('typing');
  });

  it('moves directly from typing to completed without replaying', () => {
    const service = createService();

    service.begin(false);
    service.finishTyping();
    expect(service.state()).toBe('completed');
    expect(service.contentVisible()).toBe(true);

    expect(service.begin(false)).toBe(false);
  });

  it('consumes an interrupted active sequence', () => {
    const service = createService();

    service.begin(false);
    service.interrupt();

    expect(service.state()).toBe('completed');
    expect(service.introVisible()).toBe(false);
  });

  it('skips directly to completed for reduced motion', () => {
    const service = createService();

    expect(service.begin(true)).toBe(false);
    expect(service.state()).toBe('completed');
    expect(service.contentVisible()).toBe(true);
  });

  it('gives a fresh application-scoped instance a fresh lifecycle', () => {
    const service = createService();
    service.begin(false);
    service.interrupt();

    const freshService = TestBed.runInInjectionContext(
      () => new HomeIntroService(),
    );
    expect(freshService.state()).toBe('idle');
  });

  it('does not inspect browser APIs during construction, keeping SSR and browser initial state equal', () => {
    const originalMatchMedia = window.matchMedia;
    delete (window as unknown as { matchMedia?: typeof window.matchMedia })
      .matchMedia;

    try {
      const service = createService();
      expect(service.state()).toBe('idle');
      expect(service.introVisible()).toBe(true);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
