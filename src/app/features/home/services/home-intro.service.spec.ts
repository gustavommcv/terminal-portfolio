import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { InitialNavigationRouterStub } from '../../../../testing/initial-navigation-router.stub';
import { HomeIntroService } from './home-intro.service';

describe('HomeIntroService', () => {
  function configure(
    initialUrl?: string,
  ): { service: HomeIntroService; router: InitialNavigationRouterStub } {
    const router = new InitialNavigationRouterStub();
    if (initialUrl !== undefined) {
      router.hydrateAt(initialUrl);
    }

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }],
    });

    return { service: TestBed.inject(HomeIntroService), router };
  }

  it('waits for the application initial route instead of the Home component', () => {
    const { service } = configure();

    expect(service.state()).toBe('unclassified');
    expect(service.contentVisible()).toBe(false);
    expect(service.claim(false)).toBe(false);
  });

  it('permits exactly one intro when a fresh application starts on home', () => {
    const { service, router } = configure();
    router.recognize('/');

    expect(service.state()).toBe('eligible');
    expect(service.claim(false)).toBe(true);
    expect(service.claim(false)).toBe(false);
    expect(service.startTyping()).toBe(true);
    expect(service.startTyping()).toBe(false);
  });

  it('creates a new eligible lifecycle for a reload on home', () => {
    const first = configure('/').service;
    first.claim(false);
    first.startTyping();
    first.finishTyping('whoami');
    expect(first.state()).toBe('completed');

    TestBed.resetTestingModule();
    const reloaded = configure('/').service;

    expect(reloaded.state()).toBe('eligible');
    expect(reloaded.claim(false)).toBe(true);
  });

  it('permanently skips an application that starts on portfolio', () => {
    const { service, router } = configure();
    router.recognize('/portfolio');

    expect(service.state()).toBe('completed');
    expect(service.contentVisible()).toBe(true);
    expect(service.claim(false)).toBe(false);

    router.recognize('/');
    expect(service.state()).toBe('completed');
    expect(service.claim(false)).toBe(false);
  });

  it('classifies only the first recognized navigation', () => {
    const { service, router } = configure();

    router.recognize('/about');
    router.recognize('/');

    expect(service.state()).toBe('completed');
  });

  it.each(['/?locale=pt', '/#presentation', '/?locale=pt#presentation', '/'])(
    'accepts a supported home URL %s without raw URL equality',
    (url) => {
      const { service } = configure(url);
      expect(service.state()).toBe('eligible');
    },
  );

  it('classifies a redirect by its first resolved route', () => {
    const { service, router } = configure();

    router.recognize('/start', '/');

    expect(service.state()).toBe('eligible');
  });

  it('stores a completed command and records a legitimate typing completion', () => {
    const { service } = configure('/');

    service.claim(false);
    service.startTyping();
    service.finishTyping('whoami');

    expect(service.state()).toBe('completed');
    expect(service.completedCommand()).toBe('whoami');
    expect(service.completedByTyping()).toBe(true);
    expect(service.contentVisible()).toBe(true);
  });

  it.each(['waiting', 'typing'] as const)(
    'consumes an interrupted %s sequence without marking it typed',
    (state) => {
      const { service } = configure('/');
      service.claim(false);
      if (state === 'typing') {
        service.startTyping();
      }

      service.interrupt('whoami');

      expect(service.state()).toBe('completed');
      expect(service.completedCommand()).toBe('whoami');
      expect(service.completedByTyping()).toBe(false);
    },
  );

  it('skips directly to completed for reduced motion', () => {
    const { service } = configure('/');

    expect(service.claim(true)).toBe(false);
    expect(service.state()).toBe('completed');
    expect(service.completedByTyping()).toBe(false);
  });

  it('does not share state between SSR application injectors', () => {
    const firstRequest = configure('/portfolio').service;
    expect(firstRequest.state()).toBe('completed');

    TestBed.resetTestingModule();
    const secondRequest = configure('/').service;

    expect(secondRequest.state()).toBe('eligible');
  });

  it('uses the already resolved hydration URL and never reclassifies it', () => {
    const router = new InitialNavigationRouterStub();
    router.hydrateAt('/portfolio?locale=pt#work');
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }],
    });
    const service = TestBed.inject(HomeIntroService);

    router.recognize('/');

    expect(service.state()).toBe('completed');
    expect(service.claim(false)).toBe(false);
  });

  it('does not inspect browser persistence or motion APIs during construction', () => {
    const originalMatchMedia = window.matchMedia;
    delete (window as unknown as { matchMedia?: typeof window.matchMedia })
      .matchMedia;

    try {
      const { service } = configure('/');
      expect(service.state()).toBe('eligible');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
