import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeoTreeIcon } from './neo-tree-icon';

describe('NeoTreeIcon', () => {
  let fixture: ComponentFixture<NeoTreeIcon>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NeoTreeIcon] });
    fixture = TestBed.createComponent(NeoTreeIcon);
  });

  it('renders a decorative, hidden SVG with no accessible name of its own', () => {
    fixture.componentRef.setInput('icon', 'home');
    fixture.detectChanges();

    const svg: SVGElement = fixture.nativeElement.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.hasAttribute('aria-label')).toBe(false);
    expect(svg.hasAttribute('title')).toBe(false);
  });

  it('renders exactly one svg per icon name, switching markup when the input changes', () => {
    fixture.componentRef.setInput('icon', 'folder-open');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('svg').length,
    ).toBe(1);

    fixture.componentRef.setInput('icon', 'close');
    fixture.detectChanges();

    const paths = fixture.nativeElement.querySelectorAll('path');
    expect(paths.length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('svg').length).toBe(1);
  });
});
