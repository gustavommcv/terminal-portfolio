/** A birth known only to the month: the year, and the month from 1 (January) to 12. */
export interface BirthMonth {
  year: number;
  month: number;
}

/**
 * Age in whole years. The day of the birth is not kept anywhere in the site, so
 * the birthday counts from the first day of the birth month: the age goes up at
 * most a month before the actual birthday.
 */
export function ageFrom(birth: BirthMonth, today: Date): number {
  const years = today.getFullYear() - birth.year;

  return today.getMonth() + 1 >= birth.month ? years : years - 1;
}
