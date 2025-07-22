import { Component } from '@angular/core';
import { PresentationSection } from '../components/presentation-section/presentation-section';

@Component({
  selector: 'home-page',
  imports: [PresentationSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage { }
