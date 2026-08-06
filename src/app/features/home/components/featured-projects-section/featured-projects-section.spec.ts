import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FeaturedProjectsSection } from './featured-projects-section';

describe('FeaturedProjectsSection', () => {
  let component: FeaturedProjectsSection;
  let fixture: ComponentFixture<FeaturedProjectsSection>;
  let capturedCallback: ResizeObserverCallback | undefined;

  beforeEach(async () => {
    capturedCallback = undefined;

    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        capturedCallback = callback;
      }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    await TestBed.configureTestingModule({
      imports: [FeaturedProjectsSection],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedProjectsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function stubContainerWidths(scrollWidth: number, clientWidth: number): void {
    const container: HTMLElement = fixture.nativeElement.querySelector(
      '.featured-projects-section__container',
    );
    Object.defineProperty(container, 'scrollWidth', {
      value: scrollWidth,
      configurable: true,
    });
    Object.defineProperty(container, 'clientWidth', {
      value: clientWidth,
      configurable: true,
    });
  }

  it('shows the swipe hint once the container overflows', () => {
    stubContainerWidths(1200, 800);
    capturedCallback?.([], {} as ResizeObserver);
    fixture.detectChanges();

    expect(component.hasOverflow()).toBe(true);
    expect(
      fixture.nativeElement.querySelector('.featured-projects-section__warning'),
    ).not.toBeNull();
  });

  it('hides the swipe hint when everything fits', () => {
    stubContainerWidths(800, 800);
    capturedCallback?.([], {} as ResizeObserver);
    fixture.detectChanges();

    expect(component.hasOverflow()).toBe(false);
    expect(
      fixture.nativeElement.querySelector('.featured-projects-section__warning'),
    ).toBeNull();
  });
});
