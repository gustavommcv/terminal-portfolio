import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { LanguagePreference } from './language-preference.service';

function browserLanguages(languages: readonly string[]): void {
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(languages);
}

describe('LanguagePreference', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function setup(): LanguagePreference {
    return TestBed.inject(LanguagePreference);
  }

  it('detects Portuguese from any Portuguese variant', () => {
    browserLanguages(['pt-BR', 'en']);
    expect(setup().detect()).toBe('pt');

    browserLanguages(['pt-PT']);
    expect(setup().detect()).toBe('pt');
  });

  it('uses the first supported language in the browser list, skipping unsupported ones', () => {
    browserLanguages(['es-ES', 'pt-BR', 'en-US']);
    expect(setup().detect()).toBe('pt');

    browserLanguages(['de-DE', 'en-GB', 'pt-BR']);
    expect(setup().detect()).toBe('en');
  });

  it('falls back to English when nothing in the list is supported', () => {
    browserLanguages(['ja-JP', 'fr-FR']);
    expect(setup().detect()).toBe('en');

    browserLanguages([]);
    expect(setup().detect()).toBe('en');
  });

  it('prefers a remembered choice over what the browser suggests', () => {
    browserLanguages(['pt-BR']);
    const preference = setup();

    expect(preference.preferred()).toBe('pt');

    preference.remember('en');

    expect(preference.stored()).toBe('en');
    expect(preference.preferred()).toBe('en');
  });

  it('ignores a corrupted stored value', () => {
    localStorage.setItem('locale', 'klingon');
    browserLanguages(['en-US']);

    const preference = setup();

    expect(preference.stored()).toBeNull();
    expect(preference.preferred()).toBe('en');
  });

  it('keeps working when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    browserLanguages(['pt-BR']);

    const preference = setup();

    expect(() => preference.remember('en')).not.toThrow();
    expect(preference.stored()).toBeNull();
    expect(preference.preferred()).toBe('pt');
  });

  describe('while prerendering on the server', () => {
    // There is no navigator and no storage there, so every page is English.
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });
    });

    it('knows nothing remembered, even if the browser global has something', () => {
      localStorage.setItem('locale', 'pt');

      expect(setup().stored()).toBeNull();
    });

    it('does not write the choice anywhere', () => {
      setup().remember('pt');

      expect(localStorage.getItem('locale')).toBeNull();
    });

    it('prefers English, whatever the browser global lists', () => {
      browserLanguages(['pt-BR']);

      expect(setup().detect()).toBe('en');
      expect(setup().preferred()).toBe('en');
    });
  });

});
