import { Component, input } from '@angular/core';
import { AppButton } from '../../../../core/shared/app-button/app-button';
import { TranslatePipe } from '@ngx-translate/core';
import type { HomeIntroPresentationContent } from '../../home-intro-layout-reservations';

@Component({
  selector: 'app-presentation-section',
  imports: [AppButton, TranslatePipe],
  templateUrl: './presentation-section.html',
  styleUrl: './presentation-section.scss',
})
export class PresentationSection {
  readonly content = input<HomeIntroPresentationContent | null>(null);
}
