import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { HomeIntro } from '../components/home-intro/home-intro';
import { HomeIntroCommandService } from '../services/home-intro-command.service';
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
  ],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit, OnDestroy {
  readonly intro = inject(HomeIntroService);
  readonly introCommand = inject(HomeIntroCommandService);
  private readonly ownsEligibleIntro = this.intro.state() === 'eligible';
  readonly revealLowerContent = computed(
    () => this.ownsEligibleIntro && this.intro.completedByTyping(),
  );

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

  ngOnDestroy(): void {
    this.intro.interrupt();
  }
}
