import { Component, input } from '@angular/core';

export type NeoTreeIconName =
  | 'tree'
  | 'folder-open'
  | 'folder'
  | 'home'
  | 'about'
  | 'close';

@Component({
  selector: 'app-neo-tree-icon',
  imports: [],
  templateUrl: './neo-tree-icon.html',
  styleUrl: './neo-tree-icon.scss',
})
export class NeoTreeIcon {
  readonly icon = input.required<NeoTreeIconName>();
}
