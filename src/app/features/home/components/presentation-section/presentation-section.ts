import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { AppButton } from '../../../../core/shared/app-button/app-button';
import { TranslatePipe } from '@ngx-translate/core';
import type { HomeIntroPresentationContent } from '../../home-intro-layout-reservations';

@Component({
  selector: 'presentation-section',
  imports: [AppButton, TranslatePipe],
  templateUrl: './presentation-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './presentation-section.scss',
})
export class PresentationSection {
  readonly content = input<HomeIntroPresentationContent | null>(null);
}
