import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.scss',
})
export class Footer {
  @Input() key: string = '';

  getCurrentYear() {
    return new Date().getFullYear()
  }
}
