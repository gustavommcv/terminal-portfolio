import { Injectable, signal } from '@angular/core';

export type HomeIntroAnimationState = 'idle' | 'running' | 'completed';

/**
 * Tracks the home page intro typing animation for the current application
 * instance. `providedIn: 'root'` makes this a singleton that survives
 * Angular Router navigation, so the animation is not replayed when the user
 * leaves the home page and comes back. A full browser reload creates a new
 * application instance (and therefore a new service instance), which is
 * what naturally resets the state back to `idle`.
 */
@Injectable({ providedIn: 'root' })
export class HomeIntroAnimationService {
  private readonly _state = signal<HomeIntroAnimationState>('idle');
  readonly state = this._state.asReadonly();

  /**
   * Claims the animation for the caller. Returns `true` only the first time
   * this is called during the application's lifetime; every later call
   * returns `false`, so the caller can render the finished state right away
   * instead of animating again.
   */
  requestPlay(): boolean {
    if (this._state() !== 'idle') {
      return false;
    }

    this._state.set('running');
    return true;
  }

  /** Marks the animation as finished once its CSS animation ends. */
  complete(): void {
    if (this._state() === 'running') {
      this._state.set('completed');
    }
  }
}
