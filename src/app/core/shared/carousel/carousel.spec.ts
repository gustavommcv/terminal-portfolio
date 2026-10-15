import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogEntry } from '../../../../testing/english-catalog';
import { Carousel } from './carousel';

@Component({
  imports: [Carousel],
  template: `
    <app-carousel [items]="items" label="Things">
      <ng-template let-thing let-index="index">
        <p class="thing">{{ thing }} #{{ index }}</p>
      </ng-template>
    </app-carousel>
  `,
})
class Host {
  items = ['a', 'b', 'c', 'd', 'e'];
}

// jsdom does no layout, so the track is given the sizes a browser would measure:
// five slides 320px wide with a 20px gap (offsets 0, 340, ...) in a track that
// shows a little over three of them.
const SLIDE_OFFSETS = [0, 340, 680, 1020, 1360];

describe('Carousel', () => {
  let fixture: ComponentFixture<Host>;
  let observers: MockResizeObserver[];
  let left: number;
  let scrollTo: ReturnType<typeof vi.fn>;

  class MockResizeObserver {
    readonly observed: Element[] = [];
    disconnected = false;

    constructor(readonly callback: ResizeObserverCallback) {
      observers.push(this);
    }

    observe(element: Element): void {
      this.observed.push(element);
    }
    unobserve(): void {}
    disconnect(): void {
      this.disconnected = true;
    }
    fire(): void {
      this.callback([], this as unknown as ResizeObserver);
    }
  }

  const root = (): HTMLElement => fixture.nativeElement;
  const track = (): HTMLElement => root().querySelector('.carousel__track')!;
  const slides = (): HTMLElement[] => Array.from(root().querySelectorAll('.carousel__slide'));
  const previousButton = (): HTMLElement => root().querySelectorAll<HTMLElement>('.carousel__button')[0];
  const nextButton = (): HTMLElement => root().querySelectorAll<HTMLElement>('.carousel__button')[1];
  const dots = (): HTMLElement[] => Array.from(root().querySelectorAll('.carousel__dot'));
  const activeDot = (): number => dots().findIndex((dot) => dot.getAttribute('aria-current') === 'true');

  /** Gives the track the sizes a browser would measure, then lets it measure them. */
  function layout(scrollWidth: number, clientWidth: number, offsets = SLIDE_OFFSETS): void {
    Object.defineProperty(track(), 'scrollWidth', { value: scrollWidth, configurable: true });
    Object.defineProperty(track(), 'clientWidth', { value: clientWidth, configurable: true });
    slides().forEach((slide, index) =>
      Object.defineProperty(slide, 'offsetLeft', { value: offsets[index], configurable: true }),
    );
    observers[0].fire();
    fixture.detectChanges();
  }

  /** The track, scrolled to a position by the visitor. */
  function scrollTrackTo(position: number): void {
    left = position;
    track().dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    observers = [];
    left = 0;
    scrollTo = vi.fn();
    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();

    Object.defineProperty(track(), 'scrollLeft', { get: () => left, configurable: true });
    Object.defineProperty(track(), 'scrollTo', { value: scrollTo, configurable: true });
  });

  afterEach(() => vi.unstubAllGlobals());

  describe('the slides', () => {
    it('are drawn from the template, one for each item', () => {
      expect(Array.from(root().querySelectorAll('.thing')).map((thing) => thing.textContent)).toEqual([
        'a #0',
        'b #1',
        'c #2',
        'd #3',
        'e #4',
      ]);
    });

    it('make a carousel for a screen reader, named by its label, with each slide numbered', () => {
      const carousel = root().querySelector('.carousel')!;

      expect(carousel.getAttribute('role')).toBe('group');
      expect(carousel.getAttribute('aria-roledescription')).toBe(catalogEntry('carousel.roledescription'));
      expect(carousel.getAttribute('aria-label')).toBe('Things');

      expect(slides().map((slide) => slide.getAttribute('role'))).toEqual(Array(5).fill('group'));
      expect(slides().map((slide) => slide.getAttribute('aria-roledescription'))).toEqual(
        Array(5).fill(catalogEntry('carousel.slide-roledescription')),
      );
      expect(slides().map((slide) => slide.getAttribute('aria-label'))).toEqual([
        '1 of 5',
        '2 of 5',
        '3 of 5',
        '4 of 5',
        '5 of 5',
      ]);
    });
  });

  describe('when everything fits', () => {
    it('has nothing to move, so it shows no buttons and no dots', () => {
      layout(1680, 1700);

      expect(root().querySelector('.carousel__controls')).toBeNull();
    });

    it('shows none before it has measured anything', () => {
      expect(root().querySelector('.carousel__controls')).toBeNull();
    });
  });

  describe('when it does not fit', () => {
    beforeEach(() => layout(1680, 1100));

    it('rests at the start of a slide, and the last slides share the end of the track', () => {
      // 1680 - 1100 = 580 is as far as the track goes, so the slides at 680 and
      // beyond cannot reach its start: they rest at 580, together.
      expect(dots()).toHaveLength(3);

      dots().forEach((dot) => dot.click());

      expect(scrollTo.mock.calls.map(([options]) => options)).toEqual([
        { left: 0 },
        { left: 340 },
        { left: 580 },
      ]);
    });

    it('shows a button for each direction and a dot for each stop, named in the language of the page', () => {
      expect(previousButton().getAttribute('aria-label')).toBe(catalogEntry('carousel.previous'));
      expect(nextButton().getAttribute('aria-label')).toBe(catalogEntry('carousel.next'));
      expect(root().querySelector('.carousel__dots')!.getAttribute('aria-label')).toBe(
        catalogEntry('carousel.positions'),
      );
      expect(dots().map((dot) => dot.getAttribute('aria-label'))).toEqual([
        'Go to 1 of 3',
        'Go to 2 of 3',
        'Go to 3 of 3',
      ]);
    });

    it('marks the stop it is at, and says that "previous" does nothing at the start', () => {
      expect(activeDot()).toBe(0);
      expect(previousButton().getAttribute('aria-disabled')).toBe('true');
      expect(nextButton().getAttribute('aria-disabled')).toBe('false');
    });

    it('moves the track to the next stop with the next button', () => {
      nextButton().click();

      expect(scrollTo).toHaveBeenCalledWith({ left: 340 });
    });

    it('does nothing with "previous" at the start', () => {
      previousButton().click();

      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('follows the track as it is scrolled, and moves from where it is', () => {
      scrollTrackTo(330); // a swipe that came to rest near the second slide

      expect(activeDot()).toBe(1);
      expect(previousButton().getAttribute('aria-disabled')).toBe('false');
      expect(nextButton().getAttribute('aria-disabled')).toBe('false');

      nextButton().click();
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 580 });

      previousButton().click();
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 0 });
    });

    it('says that "next" does nothing at the end, and does nothing', () => {
      scrollTrackTo(580);

      expect(activeDot()).toBe(2);
      expect(nextButton().getAttribute('aria-disabled')).toBe('true');
      expect(previousButton().getAttribute('aria-disabled')).toBe('false');

      nextButton().click();
      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('moves the track to the stop of a dot', () => {
      dots()[2].click();

      expect(scrollTo).toHaveBeenCalledWith({ left: 580 });
    });

    it('keeps the buttons focusable at the ends, so focus is not lost there', () => {
      expect(previousButton().hasAttribute('disabled')).toBe(false);
    });
  });

  describe('measuring', () => {
    it('measures again when the track or a slide changes size', () => {
      layout(1680, 1100);
      expect(dots()).toHaveLength(3);

      layout(1680, 700); // a narrower track: it now goes as far as 980
      expect(dots()).toHaveLength(4);

      layout(1680, 1700);
      expect(root().querySelector('.carousel__controls')).toBeNull();
    });

    it('joins a last stop that is almost on the one before it', () => {
      layout(1445, 1100); // the end of the track is at 345, five pixels from the second slide

      expect(dots()).toHaveLength(2);
    });

    it('watches the track and every slide', () => {
      expect(observers).toHaveLength(1);
      expect(observers[0].observed).toEqual([track(), ...slides()]);
    });

    it('stops watching when it is destroyed', () => {
      fixture.destroy();

      expect(observers[0].disconnected).toBe(true);
    });
  });

  it('is measured once, and nothing breaks, where there is no ResizeObserver', async () => {
    vi.stubGlobal('ResizeObserver', undefined);

    const bare = TestBed.createComponent(Host);
    bare.detectChanges();
    await bare.whenStable();

    expect(bare.nativeElement.querySelectorAll('.carousel__slide')).toHaveLength(5);
    expect(bare.nativeElement.querySelector('.carousel__controls')).toBeNull();
  });
});
