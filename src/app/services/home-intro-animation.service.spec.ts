import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { HomeIntroAnimationService } from './home-intro-animation.service';

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

describe('HomeIntroAnimationService', () => {
  function createService(): HomeIntroAnimationService {
    TestBed.configureTestingModule({});
    return TestBed.inject(HomeIntroAnimationService);
  }

  describe('normal motion', () => {
    beforeEach(() => {
      mockMatchMedia(false);
    });

    it('starts notStarted and unsettled', () => {
      const service = createService();
      expect(service.state()).toBe('notStarted');
      expect(service.settled()).toBe(false);
    });

    it('lets the first caller play and moves to running, still unsettled', () => {
      const service = createService();
      expect(service.requestPlay()).toBe(true);
      expect(service.state()).toBe('running');
      expect(service.settled()).toBe(false);
    });

    it('refuses every later caller once the animation has been claimed', () => {
      const service = createService();
      expect(service.requestPlay()).toBe(true);

      expect(service.requestPlay()).toBe(false);
      expect(service.requestPlay()).toBe(false);
      expect(service.state()).toBe('running');
    });

    it('only moves to completed after having been claimed', () => {
      const service = createService();
      service.complete();
      expect(service.state()).toBe('notStarted');

      service.requestPlay();
      service.complete();
      expect(service.state()).toBe('completed');
      expect(service.settled()).toBe(true);
    });

    it('keeps returning false once completed, so it never replays', () => {
      const service = createService();
      service.requestPlay();
      service.complete();

      expect(service.requestPlay()).toBe(false);
      expect(service.state()).toBe('completed');
    });

    it('gives a fresh instance a notStarted state, representing a full reload', () => {
      const service = createService();
      service.requestPlay();
      expect(service.state()).toBe('running');

      const freshInstance = TestBed.runInInjectionContext(
        () => new HomeIntroAnimationService(),
      );
      expect(freshInstance.state()).toBe('notStarted');
      expect(freshInstance.settled()).toBe(false);
    });
  });

  describe('reduced motion', () => {
    it('starts completed/settled, so neither typing nor the reveal ever animate', () => {
      mockMatchMedia(true);
      const service = createService();

      expect(service.state()).toBe('completed');
      expect(service.settled()).toBe(true);
      expect(service.requestPlay()).toBe(false);
    });
  });

  describe('server platform', () => {
    it('never touches matchMedia and starts notStarted', () => {
      // Deliberately left undefined: if the service tried to call
      // `window.matchMedia` while "on the server", this throws and fails
      // the test instead of silently passing.
      delete (window as unknown as { matchMedia?: unknown }).matchMedia;

      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });
      const service = TestBed.inject(HomeIntroAnimationService);

      expect(service.state()).toBe('notStarted');
      expect(service.settled()).toBe(false);
    });
  });
});
