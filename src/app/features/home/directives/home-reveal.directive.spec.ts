import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeRevealDirective } from './home-reveal.directive';
import { HomeIntroAnimationService } from '../../../services/home-intro-animation.service';

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

@Component({
  imports: [HomeRevealDirective],
  template: `<div homeReveal>content</div>`,
})
class HostComponent {}

describe('HomeRevealDirective', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  function createHost(): ComponentFixture<HostComponent> {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  function divEl(fixture: ComponentFixture<HostComponent>): HTMLElement {
    return fixture.nativeElement.querySelector('div');
  }

  it('starts pending, without fading, while the intro sequence has not settled', () => {
    const fixture = createHost();
    const el = divEl(fixture);

    expect(el.classList.contains('home-reveal--pending')).toBe(true);
    expect(el.classList.contains('fade')).toBe(false);
  });

  it('reveals with a fade once the sequence completes, having witnessed it live', () => {
    const fixture = createHost();
    const service = TestBed.inject(HomeIntroAnimationService);

    service.requestPlay();
    service.complete();
    fixture.detectChanges();

    const el = divEl(fixture);
    expect(el.classList.contains('home-reveal--pending')).toBe(false);
    expect(el.classList.contains('fade')).toBe(true);
  });

  it('still animates when created after typing already started but before it completed', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const service = TestBed.inject(HomeIntroAnimationService);
    service.requestPlay();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(divEl(fixture).classList.contains('home-reveal--pending')).toBe(true);

    service.complete();
    fixture.detectChanges();

    const el = divEl(fixture);
    expect(el.classList.contains('home-reveal--pending')).toBe(false);
    expect(el.classList.contains('fade')).toBe(true);
  });

  it('renders immediately in the final state for an instance created after the sequence already completed', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const service = TestBed.inject(HomeIntroAnimationService);
    service.requestPlay();
    service.complete();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el = divEl(fixture);
    expect(el.classList.contains('home-reveal--pending')).toBe(false);
    expect(el.classList.contains('fade')).toBe(false);
  });

  it('reveals multiple pending instances together once the sequence completes, with no overlap or duplication', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const service = TestBed.inject(HomeIntroAnimationService);

    const first = TestBed.createComponent(HostComponent);
    first.detectChanges();
    const second = TestBed.createComponent(HostComponent);
    second.detectChanges();

    expect(divEl(first).classList.contains('home-reveal--pending')).toBe(true);
    expect(divEl(second).classList.contains('home-reveal--pending')).toBe(true);

    service.requestPlay();
    service.complete();
    first.detectChanges();
    second.detectChanges();

    expect(divEl(first).classList.contains('fade')).toBe(true);
    expect(divEl(second).classList.contains('fade')).toBe(true);
  });

  it('renders immediately when reduced motion has already settled the sequence', () => {
    mockMatchMedia(true);

    const fixture = createHost();
    const el = divEl(fixture);

    expect(el.classList.contains('home-reveal--pending')).toBe(false);
    expect(el.classList.contains('fade')).toBe(false);
  });
});
