import { TestBed } from '@angular/core/testing';

import { HomeIntroService } from './home-intro.service';

describe('HomeIntroService', () => {
  function createService(): HomeIntroService {
    TestBed.configureTestingModule({});
    return TestBed.inject(HomeIntroService);
  }

  it('starts idle with only the stable intro tree eligible to render', () => {
    const service = createService();

    expect(service.state()).toBe('idle');
    expect(service.introVisible()).toBe(true);
    expect(service.contentVisible()).toBe(false);
    expect(service.completedCommand()).toBeNull();
  });

  it('claims exactly one run and waits for a resolved catalog', () => {
    const service = createService();

    expect(service.claim(false)).toBe(true);
    expect(service.claim(false)).toBe(false);
    expect(service.state()).toBe('waiting');
    expect(service.startTyping()).toBe(true);
    expect(service.startTyping()).toBe(false);
    expect(service.state()).toBe('typing');
  });

  it('stores the command and completes without replaying', () => {
    const service = createService();

    service.claim(false);
    service.startTyping();
    service.finishTyping('whoami');

    expect(service.state()).toBe('completed');
    expect(service.completedCommand()).toBe('whoami');
    expect(service.contentVisible()).toBe(true);
    expect(service.claim(false)).toBe(false);
  });

  it.each(['waiting', 'typing'] as const)(
    'consumes an interrupted %s sequence',
    (state) => {
      const service = createService();
      service.claim(false);
      if (state === 'typing') {
        service.startTyping();
      }

      service.interrupt('whoami');

      expect(service.state()).toBe('completed');
      expect(service.completedCommand()).toBe('whoami');
      expect(service.introVisible()).toBe(false);
    },
  );

  it('can complete a waiting sequence when the catalog is unavailable', () => {
    const service = createService();
    service.claim(false);

    service.completeWithoutTyping();

    expect(service.state()).toBe('completed');
    expect(service.completedCommand()).toBeNull();
    expect(service.contentVisible()).toBe(true);
  });

  it('skips directly to completed for reduced motion', () => {
    const service = createService();

    expect(service.claim(true)).toBe(false);
    expect(service.state()).toBe('completed');
    expect(service.contentVisible()).toBe(true);
  });

  it('allows a resolved language change to update a completed command', () => {
    const service = createService();
    service.claim(true);

    service.rememberCompletedCommand('quem-sou-eu');

    expect(service.completedCommand()).toBe('quem-sou-eu');
    expect(service.state()).toBe('completed');
  });

  it('does not inspect browser APIs during construction', () => {
    const originalMatchMedia = window.matchMedia;
    delete (window as unknown as { matchMedia?: typeof window.matchMedia })
      .matchMedia;

    try {
      const service = createService();
      expect(service.state()).toBe('idle');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
