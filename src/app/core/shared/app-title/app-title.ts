import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-title',
  imports: [],
  templateUrl: './app-title.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app-title.scss',
})
export class AppTitle {
  title = input('title');
}
