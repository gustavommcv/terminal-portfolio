import { Component } from '@angular/core';
import { AboutSection } from '../components/about-section/about-section';
import { EducationSection } from '../components/education-section/education-section';
import { InterestsSection } from '../components/interests-section/interests-section';

@Component({
  selector: 'about-page',
  imports: [AboutSection, EducationSection, InterestsSection],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPage {}
