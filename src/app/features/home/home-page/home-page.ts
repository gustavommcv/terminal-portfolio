import {
  Component,
  computed,
  inject,
  OnDestroy,
} from '@angular/core';
import { PresentationSection } from '../components/presentation-section/presentation-section';
import { ServicesSection } from '../components/services-section/services-section';
import { TechStackSection } from '../components/tech-stack-section/tech-stack-section';
import { ContactSection } from '../components/contact-section/contact-section';
import { FeaturedProjectsSection } from '../components/featured-projects-section/featured-projects-section';
import { HomeIntro } from '../components/home-intro/home-intro';
import { HomeIntroCommandService } from '../services/home-intro-command.service';
import { HomeIntroService } from '../services/home-intro.service';

@Component({
  selector: 'app-home-page',
  imports: [
    PresentationSection,
    ServicesSection,
    TechStackSection,
    ContactSection,
    FeaturedProjectsSection,
    HomeIntro,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnDestroy {
  readonly intro = inject(HomeIntroService);
  readonly introCommand = inject(HomeIntroCommandService);
  private readonly ownsEligibleIntro = this.intro.state() === 'eligible';
  readonly revealLowerContent = computed(
    () => this.ownsEligibleIntro && this.intro.completedByTyping(),
  );

  ngOnDestroy(): void {
    this.intro.interrupt();
  }
}
