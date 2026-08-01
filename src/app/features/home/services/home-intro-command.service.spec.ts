import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  LanguageCatalogState,
  LanguageService,
} from '../../../services/language.service';
import { HOME_INTRO_LAYOUT_RESERVATIONS } from '../home-intro-layout-reservations';
import { HomeIntroCommandService } from './home-intro-command.service';

describe('HomeIntroCommandService', () => {
  function setup(initial: LanguageCatalogState): {
    state: ReturnType<typeof signal<LanguageCatalogState>>;
    command: HomeIntroCommandService;
  } {
    const state = signal<LanguageCatalogState>(initial);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LanguageService,
          useValue: {
            catalogState: state.asReadonly(),
            currentLocale: () => state().language,
          },
        },
      ],
    });

    return { state, command: TestBed.inject(HomeIntroCommandService) };
  }

  it('never exposes a translation key while a delayed catalog is loading', () => {
    const { command } = setup({ status: 'loading', language: 'en' });

    expect(command.state()).toEqual({ status: 'waiting' });
    expect(JSON.stringify(command.state())).not.toContain(
      'home-page.presentation-section.command',
    );
    expect(command.layoutReservation()).toBe(
      HOME_INTRO_LAYOUT_RESERVATIONS.en,
    );
  });

  it('selects the complete layout reservation before either catalog resolves', () => {
    const { state, command } = setup({ status: 'loading', language: 'en' });

    expect(command.layoutReservation()).toBe(
      HOME_INTRO_LAYOUT_RESERVATIONS.en,
    );

    state.set({ status: 'loading', language: 'pt' });

    expect(command.layoutReservation()).toBe(
      HOME_INTRO_LAYOUT_RESERVATIONS.pt,
    );
    expect(JSON.stringify(command.layoutReservation())).not.toContain(
      'home-page.presentation-section',
    );
  });

  it.each([
    ['en' as const, 'whoami'],
    ['pt' as const, 'quem-sou-eu'],
  ])('resolves the %s command directly from its loaded catalog', (language, value) => {
    const { command } = setup({
      status: 'ready',
      language,
      translations: {
        'home-page': { 'presentation-section': { command: value } },
      },
    });

    expect(command.state()).toEqual({
      status: 'ready',
      language,
      command: value,
    });
  });

  it('reacts to the latest complete catalog without retaining a stale language', () => {
    const { state, command } = setup({ status: 'loading', language: 'en' });

    state.set({
      status: 'ready',
      language: 'pt',
      translations: {
        'home-page': {
          'presentation-section': { command: 'quem-sou-eu' },
        },
      },
    });

    expect(command.state()).toMatchObject({
      status: 'ready',
      language: 'pt',
      command: 'quem-sou-eu',
    });
  });

  it.each([
    {
      state: { status: 'failed' as const, language: 'en' as const },
      reason: 'catalog-load-failed',
    },
    {
      state: {
        status: 'ready' as const,
        language: 'en' as const,
        translations: {},
      },
      reason: 'missing-command',
    },
  ])('marks the command unavailable for $reason', ({ state, reason }) => {
    const { command } = setup(state);

    expect(command.state()).toEqual({
      status: 'unavailable',
      language: 'en',
      reason,
    });
  });
});
