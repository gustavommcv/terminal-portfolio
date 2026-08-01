import { Directive, OnInit, computed, inject, signal } from '@angular/core';
import { HomeIntroAnimationService } from '../../../services/home-intro-animation.service';

/**
 * Gates a home-page section's fade-in reveal behind the shared intro
 * sequence (see `HomeIntroAnimationService`). If the sequence had already
 * settled before this element was created — a later visit within the same
 * application lifetime, or reduced motion — the element renders in its
 * final, visible state immediately, with no hidden phase and no fade. If
 * the sequence is still in progress, the element stays hidden until it
 * completes, then fades in exactly once.
 */
@Directive({
  selector: '[homeReveal]',
  host: {
    '[class.home-reveal--pending]': 'pending()',
    '[class.fade]': 'shouldFade()',
  },
})
export class HomeRevealDirective implements OnInit {
  private readonly intro = inject(HomeIntroAnimationService);

  /** Whether this instance witnessed the sequence live, so it should animate its own reveal once it settles. */
  private readonly animateOnReveal = signal(false);

  readonly pending = computed(() => !this.intro.settled());
  readonly shouldFade = computed(() => this.animateOnReveal() && this.intro.settled());

  ngOnInit(): void {
    this.animateOnReveal.set(!this.intro.settled());
  }
}
