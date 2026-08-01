import { computed, inject, Injectable, signal } from '@angular/core';

import { HOME_INTRO_CONFIG } from '../home-intro.config';

export type HomeIntroState = 'idle' | 'typing' | 'revealing' | 'completed';

/**
 * Application-scoped, in-memory state machine for the home intro lifecycle.
 * It survives router navigation through the root injector and resets naturally
 * when a new Angular application is bootstrapped after a reload or in a new tab.
 */
@Injectable({ providedIn: 'root' })
export class HomeIntroService {
  private readonly config = inject(HOME_INTRO_CONFIG);
  private readonly internalState = signal<HomeIntroState>('idle');

  readonly state = this.internalState.asReadonly();
  readonly introVisible = computed(() => {
    const state = this.internalState();
    return state === 'idle' || state === 'typing';
  });
  readonly contentVisible = computed(() => !this.introVisible());
  readonly shouldReveal = computed(
    () => this.internalState() === 'revealing',
  );

  /** Claims the only eligible run. Reduced-motion users skip both animations. */
  begin(prefersReducedMotion: boolean): boolean {
    if (this.internalState() !== 'idle') {
      return false;
    }

    if (prefersReducedMotion) {
      this.internalState.set('completed');
      return false;
    }

    this.internalState.set('typing');
    return true;
  }

  /** Called only after the final typed character and configured final pause. */
  finishTyping(): void {
    if (this.internalState() !== 'typing') {
      return;
    }

    const revealEnabled =
      this.config.revealContent && this.config.revealDurationMs > 0;
    this.internalState.set(revealEnabled ? 'revealing' : 'completed');
  }

  finishReveal(): void {
    if (this.internalState() === 'revealing') {
      this.internalState.set('completed');
    }
  }

  /** Consumes an active sequence when its home view is abandoned. */
  interrupt(): void {
    const state = this.internalState();
    if (state === 'typing' || state === 'revealing') {
      this.internalState.set('completed');
    }
  }
}
