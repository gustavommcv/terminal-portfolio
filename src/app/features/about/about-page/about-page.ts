import { Component } from '@angular/core';
import { AboutSection } from '../components/about-section/about-section';
import { EducationSection } from '../components/education-section/education-section';

@Component({
  selector: 'about-page',
  imports: [AboutSection, EducationSection],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPage {}
