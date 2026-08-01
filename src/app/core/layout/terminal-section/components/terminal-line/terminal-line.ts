import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { HomeIntroAnimationService } from '../../../../../services/home-intro-animation.service';

@Component({
  selector: 'app-terminal-line',
  imports: [],
  templateUrl: './terminal-line.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './terminal-line.scss',
})
export class TerminalLine implements OnInit, OnDestroy {
  short = input(false);
  command = input('whoami');
  error = input(false);

  username = 'guga@';
  hostname = 'arch';
  path = '~';
  prompt = '$';

  private readonly introAnimation = inject(HomeIntroAnimationService);

  /** Whether the typing/cursor CSS animation should run for this instance. */
  readonly playIntroAnimation = signal(false);

  ngOnInit(): void {
    if (!this.short()) {
      this.playIntroAnimation.set(this.introAnimation.requestPlay());
    }
  }

  onIntroAnimationEnd(): void {
    this.introAnimation.complete();
  }

  /**
   * If this instance claimed the animation but is destroyed before it
   * finishes (the user navigated away mid-typing), the shared state must
   * still settle to `completed`. Otherwise it would stay stuck at
   * `running` forever, and the reveal of the rest of the home page would
   * never unblock on a later visit.
   */
  ngOnDestroy(): void {
    if (this.playIntroAnimation()) {
      this.introAnimation.complete();
    }
  }
}
