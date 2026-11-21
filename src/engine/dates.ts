/** Plain calendar date with no time zone, so calculations never shift by a day. */
export interface SimpleDate {
  day: number;
  month: number;
  year: number;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export function daysInMonth(month: number, year: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function isValidDate(d: SimpleDate): boolean {
  return (
    Number.isInteger(d.day) && Number.isInteger(d.month) && Number.isInteger(d.year) &&
    d.year >= 1 && d.month >= 1 && d.month <= 12 &&
    d.day >= 1 && d.day <= daysInMonth(d.month, d.year)
  );
}

/** Negative if a < b, 0 if equal, positive if a > b. */
export function compareDates(a: SimpleDate, b: SimpleDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export function todayDate(now = new Date()): SimpleDate {
  return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
}

/** Has the birthday already come in `on.year` (on or before `on`)? 29 Feb counts from 1 March in other years. */
export function birthdayReached(dob: SimpleDate, on: SimpleDate): boolean {
  return on.month > dob.month || (on.month === dob.month && on.day >= dob.day);
}

/** Completed years of age on a given date. */
export function ageOn(dob: SimpleDate, on: SimpleDate): number {
  return on.year - dob.year - (birthdayReached(dob, on) ? 0 : 1);
}

/** The birthday as celebrated in a given year (29 Feb becomes 1 Mar in non-leap years). */
export function birthdayInYear(dob: SimpleDate, year: number): SimpleDate {
  if (dob.month === 2 && dob.day === 29 && !isLeapYear(year)) return { day: 1, month: 3, year };
  return { day: dob.day, month: dob.month, year };
}

export function dayBefore(d: SimpleDate): SimpleDate {
  if (d.day > 1) return { ...d, day: d.day - 1 };
  if (d.month > 1) return { day: daysInMonth(d.month - 1, d.year), month: d.month - 1, year: d.year };
  return { day: 31, month: 12, year: d.year - 1 };
}

/** The year whose birthday started the person's current birthday-to-birthday cycle. */
export function cycleYearOn(dob: SimpleDate, on: SimpleDate): number {
  return birthdayReached(dob, on) ? on.year : on.year - 1;
}

export function formatDate(d: SimpleDate, monthsShort: string[] = MONTH_NAMES.map((m) => m.slice(0, 3))): string {
  return `${d.day} ${monthsShort[d.month - 1]} ${d.year}`;
}
