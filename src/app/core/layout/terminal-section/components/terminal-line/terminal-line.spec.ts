import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalLine } from './terminal-line';
import { HomeIntroAnimationService } from '../../../../../services/home-intro-animation.service';

describe('TerminalLine', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminalLine],
    }).compileComponents();
  });

  function createTerminalLine(short = false): ComponentFixture<TerminalLine> {
    const fixture = TestBed.createComponent(TerminalLine);
    fixture.componentRef.setInput('short', short);
    fixture.detectChanges();
    return fixture;
  }

  function terminalLineEl(fixture: ComponentFixture<TerminalLine>): HTMLElement {
    return fixture.nativeElement.querySelector('.terminal-line');
  }

  it('should create', () => {
    const fixture = createTerminalLine();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('plays the typing animation on the first non-short line created in the app lifetime', () => {
    const fixture = createTerminalLine(false);

    expect(terminalLineEl(fixture).classList.contains('typing-animation')).toBe(true);
    expect(TestBed.inject(HomeIntroAnimationService).state()).toBe('running');
  });

  it('never claims the animation for short terminal lines', () => {
    const fixture = createTerminalLine(true);

    expect(terminalLineEl(fixture).classList.contains('typing-animation')).toBe(false);
    expect(TestBed.inject(HomeIntroAnimationService).state()).toBe('notStarted');
  });

  it('does not replay the animation for a line recreated later in the same app lifetime', () => {
    const first = createTerminalLine(false);
    expect(terminalLineEl(first).classList.contains('typing-animation')).toBe(true);
    first.destroy();

    const second = createTerminalLine(false);

    expect(terminalLineEl(second).classList.contains('typing-animation')).toBe(false);
  });

  it('shows the full prompt immediately for a recreated line, without an animation replay', () => {
    const first = createTerminalLine(false);
    first.destroy();

    const second = createTerminalLine(false);
    const element = terminalLineEl(second);

    expect(element.textContent).toContain('whoami');
    expect(element.classList.contains('typing-animation')).toBe(false);
  });

  it('does not start overlapping animations when initialized repeatedly in the same lifetime', () => {
    const first = createTerminalLine(false);
    const second = createTerminalLine(false);
    const third = createTerminalLine(false);

    expect(terminalLineEl(first).classList.contains('typing-animation')).toBe(true);
    expect(terminalLineEl(second).classList.contains('typing-animation')).toBe(false);
    expect(terminalLineEl(third).classList.contains('typing-animation')).toBe(false);
  });

  it('marks the animation completed when the CSS animation ends, without allowing a replay', () => {
    const fixture = createTerminalLine(false);
    const service = TestBed.inject(HomeIntroAnimationService);
    expect(service.state()).toBe('running');

    terminalLineEl(fixture).dispatchEvent(new Event('animationend'));

    expect(service.state()).toBe('completed');
    expect(service.requestPlay()).toBe(false);
  });

  it('settles the shared state on destroy if abandoned mid-animation, unblocking the reveal', () => {
    const first = createTerminalLine(false);
    // Component is destroyed before an `animationend` event is ever dispatched,
    // simulating navigating away mid-animation.
    first.destroy();

    const service = TestBed.inject(HomeIntroAnimationService);
    // Must settle to `completed`, not stay stuck at `running` forever: the
    // rest of the home page depends on this to know it's safe to reveal on
    // a later visit.
    expect(service.state()).toBe('completed');

    const second = createTerminalLine(false);
    expect(terminalLineEl(second).classList.contains('typing-animation')).toBe(false);
  });

  it('does not settle the shared state on destroy for a short line that never claimed it', () => {
    const fixture = createTerminalLine(true);
    fixture.destroy();

    expect(TestBed.inject(HomeIntroAnimationService).state()).toBe('notStarted');
  });
});
