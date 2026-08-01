import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { HOME_INTRO_CONFIG } from '../../home-intro.config';
import type { HomeIntroCommandState } from '../../services/home-intro-command.service';
import { HomeIntroService } from '../../services/home-intro.service';

@Component({
  selector: 'home-intro',
  imports: [TerminalSection],
  templateUrl: './home-intro.html',
  styleUrl: './home-intro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeIntro {
  readonly commandState = input.required<HomeIntroCommandState>();
  readonly title = input('Who am I');

  readonly displayedCommand = signal('');
  readonly config = inject(HOME_INTRO_CONFIG);

  private readonly lifecycle = inject(HomeIntroService);
  private readonly browserReady = signal(false);
  private readonly activeCommand = signal<string | null>(null);

  readonly introVisible = this.lifecycle.introVisible;
  readonly resolvedCommand = computed(() => {
    const command = this.commandState();
    return command.status === 'ready' ? command.command : null;
  });
  readonly commandToRender = computed(() => {
    if (this.lifecycle.state() === 'completed') {
      return this.resolvedCommand() ?? this.lifecycle.completedCommand() ?? '';
    }

    return this.displayedCommand();
  });
  readonly accessibleCommand = computed(() => {
    if (this.lifecycle.state() === 'typing') {
      return this.activeCommand() ?? '';
    }

    return this.commandToRender();
  });

  private readonly destroyRef = inject(DestroyRef);
  private timeoutId: ReturnType<typeof setTimeout> | undefined;
  private motionQuery: MediaQueryList | undefined;
  private characters: string[] = [];
  private characterIndex = 0;

  constructor() {
    // This is client-only. SSR and the first hydration pass both render the
    // same empty, stable terminal while the active catalog is unresolved.
    afterNextRender(() => this.claimInBrowser());

    effect(() => {
      if (!this.browserReady()) {
        return;
      }

      const commandState = this.commandState();
      const lifecycleState = this.lifecycle.state();

      if (lifecycleState === 'completed') {
        if (commandState.status === 'ready') {
          this.lifecycle.rememberCompletedCommand(commandState.command);
        }
        return;
      }

      if (lifecycleState !== 'waiting' || commandState.status === 'waiting') {
        return;
      }

      if (commandState.status === 'unavailable') {
        this.lifecycle.completeWithoutTyping();
        return;
      }

      if (this.lifecycle.startTyping()) {
        this.beginTyping(commandState.command);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.cancelPendingTimeout();
      this.removeMotionListener();
      this.lifecycle.interrupt(
        this.activeCommand() ?? this.resolvedCommand(),
      );
    });
  }

  private claimInBrowser(): void {
    this.motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : undefined;

    this.motionQuery?.addEventListener('change', this.onMotionChange);
    this.lifecycle.claim(this.motionQuery?.matches ?? false);
    this.browserReady.set(true);
  }

  private beginTyping(command: string): void {
    this.activeCommand.set(command);
    // Array.from advances by Unicode code point instead of UTF-16 code unit.
    this.characters = Array.from(command);
    this.characterIndex = 0;
    this.displayedCommand.set('');
    this.schedule(this.config.initialDelayMs, () => this.typeNextCharacter());
  }

  private readonly onMotionChange = (event: MediaQueryListEvent): void => {
    if (!event.matches) {
      return;
    }

    const state = this.lifecycle.state();
    if (state === 'typing') {
      this.cancelPendingTimeout();
      const command = this.activeCommand();
      this.displayedCommand.set(command ?? '');
      this.lifecycle.interrupt(command);
    } else if (state === 'waiting') {
      this.lifecycle.completeWithoutTyping(this.resolvedCommand());
    }
  };

  private typeNextCharacter(): void {
    if (this.lifecycle.state() !== 'typing') {
      return;
    }

    this.characterIndex += 1;
    this.displayedCommand.set(
      this.characters.slice(0, this.characterIndex).join(''),
    );

    if (this.characterIndex >= this.characters.length) {
      this.schedule(this.config.completionDelayMs, () => {
        const command = this.activeCommand();
        if (command !== null) {
          this.lifecycle.finishTyping(command);
        }
      });
      return;
    }

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
