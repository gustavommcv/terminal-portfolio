import { TestBed } from '@angular/core/testing';

import { HOME_INTRO_CONFIG } from './home-intro.config';

describe('HOME_INTRO_CONFIG', () => {
  it('uses the deliberately paced default typing interval', () => {
    const config = TestBed.inject(HOME_INTRO_CONFIG);

    expect(config.typingIntervalMs).toBe(120);
  });
});
