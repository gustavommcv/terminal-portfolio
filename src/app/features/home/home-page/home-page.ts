import { Component } from '@angular/core';
import { PresentationSection } from '../components/presentation-section/presentation-section';
import { ServicesSection } from '../components/services-section/services-section';

@Component({
  selector: 'home-page',
  imports: [PresentationSection, ServicesSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage { }
