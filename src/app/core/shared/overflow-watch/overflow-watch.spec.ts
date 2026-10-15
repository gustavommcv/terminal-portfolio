import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OverflowWatch } from './overflow-watch';

@Component({
  imports: [OverflowWatch],
  template: `
    <div appOverflowWatch #watch="appOverflowWatch" class="row">
      <span class="first">one</span>
      <span class="second">two</span>
    </div>
    <p class="state">{{ watch.overflowing() }}</p>
  `,
})
class Host {}

describe('OverflowWatch', () => {
  let fixture: ComponentFixture<Host>;
  let observers: MockResizeObserver[];

  class MockResizeObserver {
    readonly observed: Element[] = [];
    disconnected = false;

    constructor(readonly callback: ResizeObserverCallback) {
      observers.push(this);
    }

    observe(element: Element): void {
      this.observed.push(element);
    }
    unobserve(): void {}
    disconnect(): void {
      this.disconnected = true;
    }
    fire(): void {
      this.callback([], this as unknown as ResizeObserver);
    }
  }

  function row(): HTMLElement {
    return fixture.nativeElement.querySelector('.row');
  }

  function stubWidths(scrollWidth: number, clientWidth: number): void {
    Object.defineProperty(row(), 'scrollWidth', { value: scrollWidth, configurable: true });
    Object.defineProperty(row(), 'clientWidth', { value: clientWidth, configurable: true });
  }

  function reported(): string {
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.state').textContent.trim();
  }

  beforeEach(async () => {
    observers = [];
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('reports no overflow until something has been measured', () => {
    expect(reported()).toBe('false');
  });

  it('watches the element and each of its children', () => {
    expect(observers).toHaveLength(1);
    expect(observers[0].observed).toEqual([
      row(),
      fixture.nativeElement.querySelector('.first'),
      fixture.nativeElement.querySelector('.second'),
    ]);
  });

  it('reports an overflow when the content is wider than the element', () => {
    stubWidths(1200, 800);
    observers[0].fire();

    expect(reported()).toBe('true');
  });

  it('stops reporting it once everything fits again', () => {
    stubWidths(1200, 800);
    observers[0].fire();
    stubWidths(800, 800);
    observers[0].fire();

    expect(reported()).toBe('false');
  });

  it('measures nothing, and does not fail, where ResizeObserver does not exist', async () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const bare = TestBed.createComponent(Host);

    bare.detectChanges();
    await bare.whenStable();

    expect(bare.nativeElement.querySelector('.state').textContent.trim()).toBe('false');
  });

  it('stops observing when the host is destroyed', () => {
    expect(observers[0].disconnected).toBe(false);

    fixture.destroy();

    expect(observers[0].disconnected).toBe(true);
  });
});
