import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
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
export class TerminalLine implements OnInit {
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
}
