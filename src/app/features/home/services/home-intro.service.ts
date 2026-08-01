import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  PRIMARY_OUTLET,
  Router,
  RoutesRecognized,
  UrlTree,
} from '@angular/router';
import { filter, take } from 'rxjs';

export type HomeIntroState =
  | 'unclassified'
  | 'eligible'
  | 'waiting'
  | 'typing'
  | 'completed';

/**
 * Application-scoped, in-memory state machine for the home intro lifecycle.
 * It survives router navigation and resets with a new Angular application.
 */
@Injectable({ providedIn: 'root' })
export class HomeIntroService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly internalState = signal<HomeIntroState>('unclassified');
  private readonly internalCompletedCommand = signal<string | null>(null);
  private readonly internalCompletedByTyping = signal(false);

  readonly state = this.internalState.asReadonly();
  readonly completedCommand = this.internalCompletedCommand.asReadonly();
  readonly completedByTyping = this.internalCompletedByTyping.asReadonly();
  readonly introVisible = computed(() => this.internalState() !== 'completed');
  readonly contentVisible = computed(() => this.internalState() === 'completed');

  constructor() {
    // Blocking initial navigation (SSR and some hydration paths) may finish
    // before root services are instantiated. In that case Router already owns
    // the canonical, redirected URL and no later navigation is consulted.
    if (this.router.navigated) {
      this.classifyInitialUrl(this.router.parseUrl(this.router.url));
      return;
    }

    // The root App eagerly creates this service before non-blocking browser
    // initial navigation. RoutesRecognized is both pre-activation and already
    // redirect-resolved, so a later Home component can never claim eligibility.
    this.router.events
      .pipe(
        filter(
          (event): event is RoutesRecognized =>
            event instanceof RoutesRecognized,
        ),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) =>
        this.classifyInitialUrl(this.router.parseUrl(event.urlAfterRedirects)),
      );
  }

  /** Claims the only eligible run. Reduced-motion users complete immediately. */
  claim(prefersReducedMotion: boolean): boolean {
    if (this.internalState() !== 'eligible') {
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
    this.internalCompletedByTyping.set(true);
    this.internalState.set('completed');
  }

  completeWithoutTyping(command: string | null = null): void {
    const state = this.internalState();
    if (state !== 'waiting' && state !== 'eligible') {
      return;
    }

    if (command !== null) {
      this.internalCompletedCommand.set(command);
    }
    this.internalState.set('completed');
  }

  private classifyInitialUrl(url: UrlTree): void {
    if (this.internalState() !== 'unclassified') {
      return;
    }

    const primaryRoute = url.root.children[PRIMARY_OUTLET];
    const startedOnHome =
      primaryRoute === undefined || primaryRoute.segments.length === 0;
    this.internalState.set(startedOnHome ? 'eligible' : 'completed');
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
