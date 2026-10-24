import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AboutSection } from '../components/about-section/about-section';
import { EducationSection } from '../components/education-section/education-section';
import { ListSection } from '../components/list-section/list-section';
import { DownloadSection } from '../components/download-section/download-section';
import { ExperienceSection } from '../components/experience-section/experience-section';

@Component({
  selector: 'app-about-page',
  imports: [
    AboutSection,
    ExperienceSection,
    EducationSection,
    ListSection,
    DownloadSection,
    TranslatePipe,
  ],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPage {}
