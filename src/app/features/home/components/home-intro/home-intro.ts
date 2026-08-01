import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';

import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { HOME_INTRO_CONFIG } from '../../home-intro.config';
import { HomeIntroService } from '../../services/home-intro.service';

@Component({
  selector: 'home-intro',
  imports: [TerminalSection],
  templateUrl: './home-intro.html',
  styleUrl: './home-intro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeIntro {
  readonly command = input.required<string>();
  readonly title = input('Who am I');

  readonly displayedCommand = signal('');
  readonly config = inject(HOME_INTRO_CONFIG);

  private readonly lifecycle = inject(HomeIntroService);
  readonly introVisible = this.lifecycle.introVisible;
  readonly commandToRender = computed(() => {
    if (
      this.lifecycle.state() === 'completed' &&
      this.displayedCommand() === ''
    ) {
      return this.command();
    }

    return this.displayedCommand();
  });

  private readonly destroyRef = inject(DestroyRef);
  private timeoutId: ReturnType<typeof setTimeout> | undefined;
  private motionQuery: MediaQueryList | undefined;
  private characters: string[] = [];
  private characterIndex = 0;

  constructor() {
    // Angular skips this hook during SSR and runs it after hydration in the
    // browser, keeping the server and initial browser trees identical.
    afterNextRender(() => this.beginInBrowser());

    this.destroyRef.onDestroy(() => {
      this.cancelPendingTimeout();
      this.removeMotionListener();
      if (this.lifecycle.state() === 'typing') {
        this.lifecycle.interrupt();
      }
    });
  }

  private beginInBrowser(): void {
    this.motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : undefined;

    if (this.motionQuery) {
      this.motionQuery.addEventListener('change', this.onMotionChange);
    }

    const fullCommand = this.command();
    if (!this.lifecycle.begin(this.motionQuery?.matches ?? false)) {
      this.displayedCommand.set(fullCommand);
      return;
    }

    // Array.from advances by Unicode code point instead of UTF-16 code unit.
    this.characters = Array.from(fullCommand);
    this.characterIndex = 0;
    this.displayedCommand.set('');
    this.schedule(this.config.initialDelayMs, () => this.typeNextCharacter());
  }

  private readonly onMotionChange = (event: MediaQueryListEvent): void => {
    if (!event.matches || this.lifecycle.state() !== 'typing') {
      return;
    }

    this.cancelPendingTimeout();
    this.displayedCommand.set(this.command());
    this.lifecycle.interrupt();
  };

  private typeNextCharacter(): void {
    if (this.lifecycle.state() !== 'typing') {
      return;
    }

    if (this.characterIndex >= this.characters.length) {
      this.schedule(this.config.completionDelayMs, () =>
        this.lifecycle.finishTyping(),
      );
      return;
    }

    this.characterIndex += 1;
    this.displayedCommand.set(
      this.characters.slice(0, this.characterIndex).join(''),
    );

    if (this.characterIndex === this.characters.length) {
      this.schedule(this.config.completionDelayMs, () =>
        this.lifecycle.finishTyping(),
      );
      return;
    }

    // Only one callback is pending at a time, so slow/backgrounded tabs
    // cannot create overlapping typing loops.
    this.schedule(this.config.typingIntervalMs, () =>
      this.typeNextCharacter(),
    );
  }

  private schedule(delayMs: number, callback: () => void): void {
    this.cancelPendingTimeout();
    this.timeoutId = setTimeout(() => {
      this.timeoutId = undefined;
      callback();
    }, delayMs);
  }

  private cancelPendingTimeout(): void {
    if (this.timeoutId === undefined) {
      return;
    }

    clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
  }

  private removeMotionListener(): void {
    this.motionQuery?.removeEventListener('change', this.onMotionChange);
    this.motionQuery = undefined;
  }
}
