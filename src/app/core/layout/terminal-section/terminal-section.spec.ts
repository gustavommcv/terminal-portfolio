import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalSection } from './terminal-section';

describe('TerminalSection', () => {
  let fixture: ComponentFixture<TerminalSection>;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TerminalSection] });
    fixture = TestBed.createComponent(TerminalSection);
    fixture.componentRef.setInput('customTitle', 'Who am I');
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  function set(input: string, value: unknown): void {
    fixture.componentRef.setInput(input, value);
    fixture.detectChanges();
  }

  it('renders the title it is given, with no default of its own', () => {
    expect(root.querySelector('h2')?.textContent).toBe('Who am I');
  });

  it('makes the title the page heading (h1, not h2) only for the first section of a page', () => {
    expect(root.querySelector('h1')).toBeNull();

    set('isFirstTitle', true);

    expect(root.querySelector('h1')?.textContent).toBe('Who am I');
    expect(root.querySelector('h2')).toBeNull();
  });

  it('shows the command it is given on the terminal line, whoami by default', () => {
    expect(root.querySelector('.command')?.textContent?.trim()).toBe('whoami');

    set('customCommand', 'glow stack.md');

    expect(root.querySelector('.command')?.textContent?.trim()).toBe('glow stack.md');
  });

  it('can shorten the prompt, and show the command as a refused one', () => {
    expect(root.querySelector('.user-host')).not.toBeNull();
    expect(root.querySelector('.command--error')).toBeNull();

    set('shortTerminalLine', true);
    set('errorCommand', true);

    expect(root.querySelector('.user-host')).toBeNull();
    expect(root.querySelector('.command--error')).not.toBeNull();
  });
});
