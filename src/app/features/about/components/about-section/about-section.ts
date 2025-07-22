import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { TranslateModule } from '@ngx-translate/core';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'about-section',
  imports: [TerminalSection, TranslateModule, AppTitle],
  templateUrl: './about-section.html',
  styleUrl: './about-section.scss',
})
export class AboutSection {
  age = calculateAge('2004-05-16');
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);

  let calculatedAge = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    calculatedAge--;
  }

  return calculatedAge;
}
