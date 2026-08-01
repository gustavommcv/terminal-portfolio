import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { PresentationSection } from '../components/presentation-section/presentation-section';
import { ServicesSection } from '../components/services-section/services-section';
import { TechStackSection } from '../components/tech-stack-section/tech-stack-section';
import { ContactSection } from '../components/contact-section/contact-section';
import { FeaturedProjectsSection } from '../components/featured-projects-section/featured-projects-section';
import { Footer } from '../../../core/layout/footer/footer';
import { Meta, Title } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';
import { HomeIntro } from '../components/home-intro/home-intro';
import { HOME_INTRO_CONFIG } from '../home-intro.config';
import { HomeIntroService } from '../services/home-intro.service';

@Component({
  selector: 'home-page',
  imports: [
    PresentationSection,
    ServicesSection,
    TechStackSection,
    ContactSection,
    FeaturedProjectsSection,
    Footer,
    HomeIntro,
    TranslatePipe,
  ],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit, OnDestroy {
  readonly intro = inject(HomeIntroService);
  readonly introConfig = inject(HOME_INTRO_CONFIG);

  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Gustavo Monnerat - Home Page');
    this.meta.updateTag({
      name: 'description',
      content:
        "Hello, I'm Gustavo Monnerat — software developer/architect. I build full-stack apps with care and scalability. Freelancer open to cool and challenging projects.",
    });
  }

  onRevealAnimationEnd(event: AnimationEvent): void {
    if (event.target === event.currentTarget) {
      this.intro.finishReveal();
    }
  }

  ngOnDestroy(): void {
    this.intro.interrupt();
  }
}
