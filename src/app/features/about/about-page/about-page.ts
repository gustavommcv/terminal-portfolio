import { Component } from '@angular/core';
import { AboutSection } from '../components/about-section/about-section';

@Component({
  selector: 'about-page',
  imports: [AboutSection],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPage {}
