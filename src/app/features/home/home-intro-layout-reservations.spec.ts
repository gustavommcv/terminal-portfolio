import { readFileSync } from 'node:fs';

import { HOME_INTRO_LAYOUT_RESERVATIONS } from './home-intro-layout-reservations';

// The reservations are build-time copies used to size the intro before the
// catalog loads. If they drift from the catalogs, the page jumps when the real
// text arrives, so this keeps them identical.
describe('home intro layout reservations', () => {
  for (const language of ['en', 'pt'] as const) {
    it(`match the ${language} catalog`, () => {
      const catalog = JSON.parse(
        readFileSync(`public/i18n/${language}.json`, 'utf8'),
      )['home-page']['presentation-section'];
      const reservation = HOME_INTRO_LAYOUT_RESERVATIONS[language];

      expect(reservation.title).toBe(catalog.title);
      expect(reservation.command).toBe(catalog.command);
      expect(reservation.presentation).toEqual({
        role: catalog.role,
        about: catalog.about,
        contact: catalog.contact,
      });
    });
  }
});
