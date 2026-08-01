import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { LanguageService } from '../../../../services/language.service';
import { DownloadSection } from './download-section';

describe('DownloadSection', () => {
  let component: DownloadSection;
  let fixture: ComponentFixture<DownloadSection>;

  beforeEach(() => {
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
});
