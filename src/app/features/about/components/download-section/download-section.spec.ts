import { existsSync } from 'node:fs';

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { LanguageService } from '../../../../core/i18n/language.service';
import { DownloadSection } from './download-section';

describe('DownloadSection', () => {
  let component: DownloadSection;
  let fixture: ComponentFixture<DownloadSection>;
  let capturedCallback: ResizeObserverCallback | undefined;
  let locale: ReturnType<typeof signal<'en' | 'pt'>>;

  beforeEach(async () => {
    locale = signal<'en' | 'pt'>('pt');
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
          useValue: { currentLocale: locale },
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

  const links = (): HTMLAnchorElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.download-section__button'));

  it('offers the CV in each format as a download link, in the language of the page', () => {
    expect(links().map((link) => [link.getAttribute('href'), link.getAttribute('download')])).toEqual([
      ['cv/cv-pt.docx', 'cv-pt.docx'],
      ['cv/cv-pt.odt', 'cv-pt.odt'],
      ['cv/cv-pt.pdf', 'cv-pt.pdf'],
    ]);
  });

  it('points the links at the other language when the page changes language', () => {
    locale.set('en');
    fixture.detectChanges();

    expect(links().map((link) => link.getAttribute('href'))).toEqual([
      'cv/cv-en.docx',
      'cv/cv-en.odt',
      'cv/cv-en.pdf',
    ]);
  });

  it('only links to files that exist', () => {
    for (const language of ['en', 'pt'] as const) {
      locale.set(language);
      fixture.detectChanges();

      for (const link of links()) {
        expect(existsSync(`public/${link.getAttribute('href')}`), `${language}: ${link.getAttribute('href')}`).toBe(true);
      }
    }
  });

  it('names each download link after its format, not just "Download"', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('.download-section__button'),
    ).map((button) => (button as HTMLElement).getAttribute('aria-label'));

    expect(labels).toEqual([
      'Download CV as DOCX',
      'Download CV as ODT',
      'Download CV as PDF',
    ]);
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
