import { computed, Injectable, signal } from '@angular/core';

export type HomeIntroState = 'idle' | 'typing' | 'completed';

/**
 * Application-scoped, in-memory state machine for the home intro lifecycle.
 * It survives router navigation through the root injector and resets naturally
 * when a new Angular application is bootstrapped after a reload or in a new tab.
 */
@Injectable({ providedIn: 'root' })
export class HomeIntroService {
  private readonly internalState = signal<HomeIntroState>('idle');

  readonly state = this.internalState.asReadonly();
  readonly introVisible = computed(() => {
    const state = this.internalState();
    return state === 'idle' || state === 'typing';
  });
  readonly contentVisible = computed(() => !this.introVisible());

  /** Claims the only eligible run. Reduced-motion users skip command typing. */
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

    this.internalState.set('completed');
  }

  /** Consumes an active sequence when its home view is abandoned. */
  interrupt(): void {
    if (this.internalState() === 'typing') {
      this.internalState.set('completed');
    }
  }
}
