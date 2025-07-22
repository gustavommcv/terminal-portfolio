import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { TranslateModule } from '@ngx-translate/core';
import { AppButton } from '../../../../core/shared/app-button/app-button';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'services-section',
  imports: [TerminalSection, TranslateModule, AppButton, AppTitle],
  templateUrl: './services-section.html',
  styleUrl: './services-section.scss',
})
export class ServicesSection {}
