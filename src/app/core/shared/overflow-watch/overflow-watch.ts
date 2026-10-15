import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  signal,
} from '@angular/core';

/**
 * Tells whether the element is wider than the space it has, that is, whether it
 * scrolls sideways, so a "scroll sideways" hint can be shown only when it does.
 *
 * Observing the element catches viewport and orientation changes; observing each
 * child too catches content-driven width changes (e.g. a language switch giving
 * longer or shorter text). The children present after the first render are the
 * ones watched.
 *
 * It measures in the browser only: during server rendering, and until the first
 * render, `overflowing` is false.
 */
@Directive({
  selector: '[appOverflowWatch]',
  exportAs: 'appOverflowWatch',
})
export class OverflowWatch {
  readonly overflowing = signal(false);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // Every current browser has it; where it is missing (a test DOM) nothing is
      // measured and the hint simply never shows.
      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const observer = new ResizeObserver(() =>
        this.overflowing.set(element.scrollWidth > element.clientWidth),
      );

      observer.observe(element);
      Array.from(element.children).forEach((child) => observer.observe(child));

      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
