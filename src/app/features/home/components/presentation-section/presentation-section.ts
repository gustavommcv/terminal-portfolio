import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppButton } from '../../../../core/shared/app-button/app-button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'presentation-section',
  imports: [AppButton, TranslatePipe],
  templateUrl: './presentation-section.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './presentation-section.scss',
})
export class PresentationSection { }
