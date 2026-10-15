import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSection } from './list-section';

@Component({
  imports: [ListSection],
  template: `<app-list-section heading="Things" [items]="items()" command="glow things.md" />`,
})
class Host {
  readonly items = signal(['one', 'two', 'three']);
}

describe('ListSection', () => {
  let fixture: ComponentFixture<Host>;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('shows its heading as the title of the window and of the section', () => {
    expect(root.querySelector('h2')?.textContent?.trim()).toBe('Things');
  });

  it('shows the command that printed the list', () => {
    expect(root.textContent).toContain('glow things.md');
  });

  it('lists every item, in its order', () => {
    const shown = Array.from(root.querySelectorAll('.list-section__items li')).map(
      (item) => item.textContent?.trim(),
    );

    expect(shown).toEqual(['one', 'two', 'three']);
  });

  it('follows the items it is given', () => {
    fixture.componentInstance.items.set(['only']);
    fixture.detectChanges();

    expect(
      Array.from(root.querySelectorAll('.list-section__items li')).map((item) => item.textContent?.trim()),
    ).toEqual(['only']);
  });
});
