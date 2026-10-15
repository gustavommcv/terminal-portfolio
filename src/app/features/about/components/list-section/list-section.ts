import { Component, input } from '@angular/core';

import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

/**
 * A titled list of short texts in a terminal window, such as the interests or the
 * languages of the About page. The texts come in already translated, so the page
 * that uses it names the catalog keys.
 */
@Component({
  selector: 'app-list-section',
  imports: [TerminalSection, AppTitle],
  templateUrl: './list-section.html',
  styleUrl: './list-section.scss',
})
export class ListSection {
  readonly heading = input.required<string>();
  readonly items = input.required<readonly string[]>();

  /** What the terminal line shows as the command that printed the list, e.g. `glow interests.md`. */
  readonly command = input.required<string>();
}
