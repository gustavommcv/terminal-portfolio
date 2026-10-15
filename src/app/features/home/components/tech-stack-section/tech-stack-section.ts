import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'app-tech-stack-section',
  imports: [NgOptimizedImage, TerminalSection, AppTitle, TranslatePipe],
  templateUrl: './tech-stack-section.html',
  styleUrl: './tech-stack-section.scss',
})
export class TechStackSection {}
