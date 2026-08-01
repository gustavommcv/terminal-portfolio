import { TestBed } from '@angular/core/testing';

import { HomeIntroAnimationService } from './home-intro-animation.service';

describe('HomeIntroAnimationService', () => {
  let service: HomeIntroAnimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomeIntroAnimationService);
  });

  it('starts idle', () => {
    expect(service.state()).toBe('idle');
  });

  it('lets the first caller play and moves to running', () => {
    expect(service.requestPlay()).toBe(true);
    expect(service.state()).toBe('running');
  });

  it('refuses every later caller once the animation has been claimed', () => {
    expect(service.requestPlay()).toBe(true);

    expect(service.requestPlay()).toBe(false);
    expect(service.requestPlay()).toBe(false);
    expect(service.state()).toBe('running');
  });

  it('only moves to completed after having been claimed', () => {
    service.complete();
    expect(service.state()).toBe('idle');

    service.requestPlay();
    service.complete();
    expect(service.state()).toBe('completed');
  });

  it('keeps returning false once completed, so it never replays', () => {
    service.requestPlay();
    service.complete();

    expect(service.requestPlay()).toBe(false);
    expect(service.state()).toBe('completed');
  });

  it('gives a fresh instance an idle state, representing a full reload', () => {
    service.requestPlay();
    expect(service.state()).toBe('running');

    const freshInstance = new HomeIntroAnimationService();
    expect(freshInstance.state()).toBe('idle');
  });
});
