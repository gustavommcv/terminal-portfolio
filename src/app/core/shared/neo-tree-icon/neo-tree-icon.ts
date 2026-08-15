import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type NeoTreeIconName =
  | 'tree'
  | 'folder-open'
  | 'folder'
  | 'home'
  | 'about'
  | 'close';

@Component({
  selector: 'neo-tree-icon',
  imports: [],
  templateUrl: './neo-tree-icon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './neo-tree-icon.scss',
})
export class NeoTreeIcon {
  readonly icon = input.required<NeoTreeIconName>();
}
