import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { LanguageService } from '../../../../i18n/language.service';
import { LanguageToggleButton } from './language-toggle-button';

describe('LanguageToggleButton', () => {
  let fixture: ComponentFixture<LanguageToggleButton>;
  let button: HTMLButtonElement;

  async function render(url?: string): Promise<void> {
    TestBed.configureTestingModule({
      imports: [LanguageToggleButton],
      // Any address matches, so the language can be set through the URL.
      providers: [provideRouter([{ path: '**', children: [] }])],
    });
    if (url) {
      await TestBed.inject(Router).navigateByUrl(url);
    }
    fixture = TestBed.createComponent(LanguageToggleButton);
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
  }

  it('shows the language in use as JSON, and offers Portuguese while in English', async () => {
    await render('/');

    expect(button.type).toBe('button');
    expect(button.querySelector('.json-value--en')?.textContent).toBe('en');
    expect(button.querySelector('.json-value--pt')).toBeNull();
    // named in the language it switches to, and marked as being in it
    expect(button.getAttribute('aria-label')).toBe('Mudar idioma para português');
    expect(button.getAttribute('lang')).toBe('pt-BR');
  });

  it('shows pt and offers English while in Portuguese', async () => {
    await render('/?locale=pt');

    expect(button.querySelector('.json-value--pt')?.textContent).toBe('pt');
    expect(button.querySelector('.json-value--en')).toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Switch language to English');
    expect(button.getAttribute('lang')).toBe('en');
  });

  it('asks the language service to switch when it is pressed', async () => {
    await render('/');
    const toggle = vi
      .spyOn(TestBed.inject(LanguageService), 'toggleLanguage')
      .mockResolvedValue(true);

    button.click();

    expect(toggle).toHaveBeenCalledOnce();
  });
});
