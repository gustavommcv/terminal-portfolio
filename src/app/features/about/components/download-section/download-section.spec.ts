import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { LanguageService } from '../../../../services/language.service';
import { DownloadSection } from './download-section';

describe('DownloadSection', () => {
  let component: DownloadSection;
  let fixture: ComponentFixture<DownloadSection>;
  let capturedCallback: ResizeObserverCallback | undefined;

  beforeEach(async () => {
    capturedCallback = undefined;

    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        capturedCallback = callback;
      }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    TestBed.configureTestingModule({
      imports: [DownloadSection],
      providers: [
        {
          provide: LanguageService,
          useValue: { currentLocale: signal<'en' | 'pt'>('pt') },
        },
      ],
    });

    fixture = TestBed.createComponent(DownloadSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds a download from the current signal locale', () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    component.downloadCV('pdf');

    expect(clickSpy).toHaveBeenCalledOnce();
    const link = clickSpy.mock.instances[0] as HTMLAnchorElement;
    expect(link.download).toBe('cv-pt.pdf');
    expect(link.getAttribute('href')).toBe('cv/cv-pt.pdf');
    expect(document.body.contains(link)).toBe(false);
  });

  function stubContainerWidths(scrollWidth: number, clientWidth: number): void {
    const container: HTMLElement = fixture.nativeElement.querySelector(
      '.download-section__container',
    );
    Object.defineProperty(container, 'scrollWidth', {
      value: scrollWidth,
      configurable: true,
    });
    Object.defineProperty(container, 'clientWidth', {
      value: clientWidth,
      configurable: true,
    });
  }

  it('shows the swipe hint once the container overflows', () => {
    stubContainerWidths(1200, 800);
    capturedCallback?.([], {} as ResizeObserver);
    fixture.detectChanges();

    expect(component.hasOverflow()).toBe(true);
    expect(
      fixture.nativeElement.querySelector('.download-section__warning--2'),
    ).not.toBeNull();
  });

  it('hides the swipe hint when everything fits', () => {
    stubContainerWidths(800, 800);
    capturedCallback?.([], {} as ResizeObserver);
    fixture.detectChanges();

    expect(component.hasOverflow()).toBe(false);
    expect(
      fixture.nativeElement.querySelector('.download-section__warning--2'),
    ).toBeNull();
  });
});
