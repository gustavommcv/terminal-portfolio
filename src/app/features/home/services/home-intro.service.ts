import { computed, Injectable, signal } from '@angular/core';

export type HomeIntroState = 'idle' | 'waiting' | 'typing' | 'completed';

/**
 * Application-scoped, in-memory state machine for the home intro lifecycle.
 * It survives router navigation and resets with a new Angular application.
 */
@Injectable({ providedIn: 'root' })
export class HomeIntroService {
  private readonly internalState = signal<HomeIntroState>('idle');
  private readonly internalCompletedCommand = signal<string | null>(null);

  readonly state = this.internalState.asReadonly();
  readonly completedCommand = this.internalCompletedCommand.asReadonly();
  readonly introVisible = computed(() => this.internalState() !== 'completed');
  readonly contentVisible = computed(() => this.internalState() === 'completed');

  /** Claims the only eligible run. Reduced-motion users complete immediately. */
  claim(prefersReducedMotion: boolean): boolean {
    if (this.internalState() !== 'idle') {
      return false;
    }

    this.internalState.set(prefersReducedMotion ? 'completed' : 'waiting');
    return !prefersReducedMotion;
  }

  startTyping(): boolean {
    if (this.internalState() !== 'waiting') {
      return false;
    }

    this.internalState.set('typing');
    return true;
  }

  finishTyping(command: string): void {
    if (this.internalState() !== 'typing') {
      return;
    }

    this.internalCompletedCommand.set(command);
    this.internalState.set('completed');
  }

  completeWithoutTyping(command: string | null = null): void {
    const state = this.internalState();
    if (state !== 'waiting' && state !== 'idle') {
      return;
    }

    if (command !== null) {
      this.internalCompletedCommand.set(command);
    }
    this.internalState.set('completed');
  }

  rememberCompletedCommand(command: string): void {
    if (this.internalState() === 'completed') {
      this.internalCompletedCommand.set(command);
    }
  }

  /** Consumes claimed work when its home view is abandoned. */
  interrupt(command: string | null = null): void {
    const state = this.internalState();
    if (state !== 'waiting' && state !== 'typing') {
      return;
    }

    if (command !== null) {
      this.internalCompletedCommand.set(command);
    }
    this.internalState.set('completed');
  }
}
