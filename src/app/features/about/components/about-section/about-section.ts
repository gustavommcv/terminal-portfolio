import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { TranslatePipe } from '@ngx-translate/core';
import { AppTitle } from '../../../../core/shared/app-title/app-title';
import { ageFrom, BirthMonth } from './age-from';

// Only the year and the month: the site shows an age, and the full date would
// ship to every visitor inside the JavaScript (see ageFrom).
const BIRTH: BirthMonth = { year: 2004, month: 5 };

@Component({
  selector: 'app-about-section',
  imports: [NgOptimizedImage, TerminalSection, TranslatePipe, AppTitle],
  templateUrl: './about-section.html',
  styleUrl: './about-section.scss',
})
export class AboutSection {
  age = ageFrom(BIRTH, new Date());
}
