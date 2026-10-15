import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalLine } from './terminal-line';

describe('TerminalLine', () => {
  function createTerminalLine(
    inputs: Partial<{
      short: boolean;
      command: string;
      accessibleCommand: string;
      showCursor: boolean;
      animateCursor: boolean;
    }> = {},
  ): ComponentFixture<TerminalLine> {
    TestBed.configureTestingModule({ imports: [TerminalLine] });
    const fixture = TestBed.createComponent(TerminalLine);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  }

  it('renders the supplied command without owning animation state', () => {
    const fixture = createTerminalLine({ command: 'glow stack.md' });
    const element: HTMLElement = fixture.nativeElement.querySelector('.terminal-line');

    expect(element.textContent).toContain('glow stack.md');
    expect(element.querySelector('.terminal-cursor')).toBeNull();
  });

  it('exposes the complete command once while partial visual text stays aria-hidden', () => {
    const fixture = createTerminalLine({
      command: 'who',
      accessibleCommand: 'whoami',
      showCursor: true,
    });
    const element: HTMLElement = fixture.nativeElement.querySelector('.terminal-line');

    expect(element.getAttribute('aria-live')).toBe('off');
    // A name on a role-less div is ignored by assistive technology, so the
    // complete command is real (visually hidden) text instead.
    expect(element.hasAttribute('aria-label')).toBe(false);
    expect(element.querySelector('.visually-hidden')?.textContent).toContain(
      'whoami',
    );
    expect(element.querySelector('.command-container')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(element.querySelector('.terminal-cursor')).not.toBeNull();
  });

  it('names the short prompt as it looks: path, dollar sign, then the whole command', () => {
    const fixture = createTerminalLine({
      short: true,
      command: 'glow',
      accessibleCommand: 'glow stack.md',
    });

    expect(fixture.nativeElement.querySelector('.visually-hidden').textContent.trim()).toBe(
      '~ $ glow stack.md',
    );
  });

  it('keeps the prompt together while allowing the command container to wrap', () => {
    const fixture = createTerminalLine({ command: 'a-very-long-command' });

    expect(fixture.nativeElement.querySelector('.prompt-container')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.command-container')).not.toBeNull();
  });

  it('reserves cursor geometry without running a second cursor animation', () => {
    const fixture = createTerminalLine({
      command: 'whoami',
      showCursor: true,
      animateCursor: false,
    });
    const cursor: HTMLElement =
      fixture.nativeElement.querySelector('.terminal-cursor');

    expect(cursor.classList.contains('terminal-cursor--static')).toBe(true);
  });
});
