import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  Component,
  computed,
  contentChild,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** What the template of a slide receives: the item, and where it is among the items. */
export interface CarouselSlideContext<T> {
  readonly $implicit: T;
  readonly index: number;
}

/**
 * Two stops closer than this are one. The last stop is held back by the end of
 * the track, so it can fall almost on the one before it.
 */
const MIN_STOP_GAP = 10;

const sameStops = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((stop, index) => stop === b[index]);

/**
 * A row of slides that rests on one slide at a time, with previous and next
 * buttons and one dot for each place it can rest (a stop).
 *
 * It is the browser that scrolls and snaps (CSS `scroll-snap`), so touch,
 * trackpad and keyboard focus work as on any page; the buttons and dots move the
 * track to a stop, and the track tells them where it is. As many slides as fit
 * are shown together, so the stops are not one for each slide: the last slides
 * share the stop at the end of the track. When everything fits there is nothing
 * to move, and the buttons and dots are not shown.
 *
 * Follows the WAI-ARIA carousel pattern, without rotation: it never moves on its
 * own. The slides are drawn from the template passed as content, which receives
 * each item as the implicit value:
 *
 * ```html
 * <app-carousel [items]="projects" label="Featured projects">
 *   <ng-template let-project><app-project-card [project]="project" /></ng-template>
 * </app-carousel>
 * ```
 *
 * It measures in the browser only: during server rendering, and until the first
 * render, every slide is there and there are no buttons.
 */
@Component({
  selector: 'app-carousel',
  imports: [NgTemplateOutlet, TranslatePipe],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel<T> {
  /** What the carousel is, for a screen reader (e.g. "Featured projects"). */
  readonly label = input.required<string>();

  readonly items = input.required<readonly T[]>();

  protected readonly slide = contentChild.required<TemplateRef<CarouselSlideContext<T>>>(TemplateRef);

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  /** Where the track can rest, in pixels from its start; one stop means nothing to move. */
  protected readonly stops = signal<readonly number[]>([], { equal: sameStops });

  private readonly scrollLeft = signal(0);

  /** The stop the track is at, or the closest one while it moves. */
  protected readonly activeStop = computed(() => {
    const stops = this.stops();
    const left = this.scrollLeft();

    return stops.reduce(
      (closest, stop, index) => (Math.abs(stop - left) < Math.abs(stops[closest] - left) ? index : closest),
      0,
    );
  });

  protected readonly canGoBack = computed(() => this.activeStop() > 0);
  protected readonly canGoForward = computed(() => this.activeStop() < this.stops().length - 1);

  private observer?: ResizeObserver;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());

    // After the first render and after each one that changes the items: measure,
    // and watch the track and the slides, so a resize or a longer text (a
    // language switch) is measured again.
    afterRenderEffect(() => {
      this.items();
      this.watch();
    });
  }

  protected previous(): void {
    if (this.canGoBack()) {
      this.goTo(this.activeStop() - 1);
    }
  }

  protected next(): void {
    if (this.canGoForward()) {
      this.goTo(this.activeStop() + 1);
    }
  }

  protected goTo(stop: number): void {
    // The smooth movement, or none for a visitor who asked for less motion, is
    // the track's `scroll-behavior` in the stylesheet.
    this.track().nativeElement.scrollTo({ left: this.stops()[stop] });
  }

  protected onScroll(): void {
    this.scrollLeft.set(this.track().nativeElement.scrollLeft);
  }

  private watch(): void {
    const track = this.track().nativeElement;

    this.measure();

    // Every current browser has it; where it is missing (a test DOM) the
    // carousel is measured once and never again.
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.observer ??= new ResizeObserver(() => this.measure());
    this.observer.disconnect();
    this.observer.observe(track);
    Array.from(track.children).forEach((slide) => this.observer?.observe(slide));
  }

  private measure(): void {
    const track = this.track().nativeElement;
    const slides = Array.from(track.children) as HTMLElement[];
    const first = slides[0]?.offsetLeft ?? 0;
    const end = Math.max(0, track.scrollWidth - track.clientWidth);

    const stops: number[] = [];
    for (const slide of slides) {
      // A slide that cannot be brought to the start of the track rests at the end of it.
      const stop = Math.min(Math.round(slide.offsetLeft - first), end);
      if (stops.length === 0 || stop - stops[stops.length - 1] >= MIN_STOP_GAP) {
        stops.push(stop);
      }
    }

    this.stops.set(stops);
    this.scrollLeft.set(track.scrollLeft);
  }
}
