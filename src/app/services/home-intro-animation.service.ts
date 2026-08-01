import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type HomeIntroState = 'notStarted' | 'running' | 'completed';

/**
 * Coordinates the home page's intro sequence for the current application
 * instance: first the terminal typing animation, then the reveal of the
 * remaining sections. Both phases share this single state so they can
 * never drift out of sync (e.g. the typing being skipped while the reveal
 * still plays).
 *
 * `providedIn: 'root'` makes this a singleton that survives Angular Router
 * navigation, so the sequence is not replayed when the user leaves the
 * home page and comes back. A full browser reload creates a new
 * application instance (and therefore a new service instance), which is
 * what naturally resets the state back to `notStarted` — no browser
 * storage is involved.
 *
 * Users with `prefers-reduced-motion` start directly at `completed`, since
 * no animation should run for them; all home content then renders in its
 * final state immediately.
 */
@Injectable({ providedIn: 'root' })
export class HomeIntroAnimationService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _state = signal<HomeIntroState>(
    this.prefersReducedMotion() ? 'completed' : 'notStarted',
  );
  readonly state = this._state.asReadonly();

  /** True once the intro sequence is finished and later mounts should render their final state immediately. */
  readonly settled = computed(() => this._state() === 'completed');

  /**
   * Claims the typing animation for the caller. Returns `true` only the
   * first time this is called during the application's lifetime; every
   * later call returns `false`, so the caller can render the finished
   * state right away instead of animating again.
   */
  requestPlay(): boolean {
    if (this._state() !== 'notStarted') {
      return false;
    }

    this._state.set('running');
    return true;
  }

  /**
   * Marks the intro sequence as finished, unblocking the reveal of the
   * remaining home-page content. Called both when the typing animation
   * ends naturally and when it is abandoned (the user navigated away
   * before it finished), so the shared state can never stay stuck
   * mid-sequence and later visits always see a settled state.
   */
  complete(): void {
    if (this._state() === 'running') {
      this._state.set('completed');
    }
  }

  private prefersReducedMotion(): boolean {
    if (!isPlatformBrowser(this.platformId) || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
