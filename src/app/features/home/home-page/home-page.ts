import { Component } from '@angular/core';
import { PresentationSection } from '../components/presentation-section/presentation-section';
import { ServicesSection } from '../components/services-section/services-section';
import { TechStackSection } from '../components/tech-stack-section/tech-stack-section';
import { ContactSection } from '../components/contact-section/contact-section';

@Component({
  selector: 'home-page',
  imports: [PresentationSection, ServicesSection, TechStackSection, ContactSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage { }
