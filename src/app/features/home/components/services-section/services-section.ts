import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { TranslatePipe } from '@ngx-translate/core';
import { AppButton } from '../../../../core/shared/app-button/app-button';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'services-section',
  imports: [TerminalSection, TranslatePipe, AppButton, AppTitle],
  templateUrl: './services-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './services-section.scss',
})
export class ServicesSection {}
