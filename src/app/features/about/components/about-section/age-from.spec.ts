import { ageFrom } from './age-from';

describe('ageFrom', () => {
  const may2004 = { year: 2004, month: 5 };
  // Date months are 0-based, so new Date(2026, 3, 30) is April 30th.
  const day = (year: number, month: number, date: number) =>
    new Date(year, month - 1, date);

  it('is one less than the year difference before the birth month', () => {
    expect(ageFrom(may2004, day(2026, 4, 30))).toBe(21);
    expect(ageFrom(may2004, day(2026, 1, 1))).toBe(21);
  });

  it('counts the birthday from the first day of the birth month, whatever the day', () => {
    expect(ageFrom(may2004, day(2026, 5, 1))).toBe(22);
    expect(ageFrom(may2004, day(2026, 5, 16))).toBe(22);
    expect(ageFrom(may2004, day(2026, 5, 31))).toBe(22);
  });

  it('stays the same until the next birth month, across the new year', () => {
    expect(ageFrom(may2004, day(2026, 12, 31))).toBe(22);
    expect(ageFrom(may2004, day(2027, 1, 1))).toBe(22);
    expect(ageFrom(may2004, day(2027, 4, 30))).toBe(22);
    expect(ageFrom(may2004, day(2027, 5, 1))).toBe(23);
  });

  it('handles a birth month at the end of the year', () => {
    const december = { year: 2004, month: 12 };

    expect(ageFrom(december, day(2026, 11, 30))).toBe(21);
    expect(ageFrom(december, day(2026, 12, 1))).toBe(22);
  });

  it('is zero in the birth year before the month, and in it after', () => {
    expect(ageFrom(may2004, day(2004, 5, 1))).toBe(0);
    expect(ageFrom(may2004, day(2005, 4, 30))).toBe(0);
    expect(ageFrom(may2004, day(2005, 5, 1))).toBe(1);
  });
});
