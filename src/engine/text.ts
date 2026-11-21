/**
 * Every piece of wording the calculation engine produces (working steps, labels, errors).
 * English is the default; the Hindi version lives in src/i18n/engine-hi.ts.
 */
export type Gender = 'male' | 'female';

export interface EngineText {
  monthsShort: string[];
  dayOfBirth: string;
  birthMonth: string;
  birthYear: string;
  day: string;
  month: string;
  year: string;
  moolank: string;
  bhagyank: string;
  yogyatank: string;
  kua: string;
  male: string;
  female: string;
  total: string;
  reduce: string;
  masterKept: (n: number) => string;
  kuaFive: (g: Gender) => string;
  noLetters: string;
  noVowels: string;
  noConsonants: string;
  partsKept: (m: number, d: number, y: number) => string;
  partsSingle: (m: number, d: number, y: number) => string;
  pinnacleFormulas: [string, string, string, string];
  challengeFormulas: [string, string, string, string];
  firstEnd: (talent: number, single: number, end: number) => string;
  secondEnd: (a: number, b: number) => string;
  thirdEnd: (a: number, b: number) => string;
  fourthPeriod: (a: number) => string;
  planet: (n: number) => string;
  planetShort: (n: number) => string;
  dashaStart: (moolank: number) => string;
  dashaRange: (n: number, planet: string, a1: number, a2: number, y1: number, y2: number) => string;
  validFrom: (from: string, to: string) => string;
  loShuDob: string;
  karmicDay: string;
  ofSystem: (label: string, system: string) => string;
  heart: string;
  personality: string;
  namank: string;
  maturity: string;
  nameTotal: string;
  pinnacleN: (n: number) => string;
  errNameEmpty: string;
  errNameScript: string;
  errDobMissing: string;
  errDobInvalid: string;
  errDobFuture: string;
  errGender: string;
}

const PLANETS_EN: Record<number, [string, string]> = {
  1: ['Sun', 'Surya'],
  2: ['Moon', 'Chandra'],
  3: ['Jupiter', 'Guru'],
  4: ['Rahu', 'Rahu'],
  5: ['Mercury', 'Budh'],
  6: ['Venus', 'Shukra'],
  7: ['Ketu', 'Ketu'],
  8: ['Saturn', 'Shani'],
  9: ['Mars', 'Mangal'],
};

export const EN: EngineText = {
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayOfBirth: 'Day of birth',
  birthMonth: 'Birth month',
  birthYear: 'Birth year',
  day: 'Day',
  month: 'Month',
  year: 'Year',
  moolank: 'Moolank',
  bhagyank: 'Bhagyank',
  yogyatank: 'Yogyatank',
  kua: 'Kua',
  male: 'Male',
  female: 'Female',
  total: 'Total',
  reduce: 'Reduce',
  masterKept: (n) => `${n} is a master number, so it is not reduced further.`,
  kuaFive: (g) => `Kua 5 is not used: for ${g === 'male' ? 'men it becomes 2' : 'women it becomes 8'}.`,
  noLetters: 'No letters in the name.',
  noVowels: 'There are no vowels (A, E, I, O, U) in this name.',
  noConsonants: 'There are no consonants in this name.',
  partsKept: (m, d, y) => `Month ${m}, Day ${d}, Year ${y} (each reduced, master numbers kept)`,
  partsSingle: (m, d, y) => `Month ${m}, Day ${d}, Year ${y} (each reduced to one digit)`,
  pinnacleFormulas: ['Month + Day', 'Day + Year', 'Pinnacle 1 + Pinnacle 2', 'Month + Year'],
  challengeFormulas: ['Month − Day', 'Day − Year', 'Challenge 1 − Challenge 2', 'Month − Year'],
  firstEnd: (talent, single, end) =>
    talent === single
      ? `First period ends at age 36 − Yogyatank ${single} = ${end}`
      : `First period ends at age 36 − Yogyatank ${talent} (as ${single}) = ${end}`,
  secondEnd: (a, b) => `Second period: ${a} + 9 = ${b}`,
  thirdEnd: (a, b) => `Third period: ${a} + 9 = ${b}`,
  fourthPeriod: (a) => `Fourth period: from ${a} for the rest of life`,
  planet: (n) => `${PLANETS_EN[n][0]} (${PLANETS_EN[n][1]})`,
  planetShort: (n) => PLANETS_EN[n][0],
  dashaStart: (m) => `Starts at birth with the Moolank ${m}; each number rules for that many years (one full round = 45 years).`,
  dashaRange: (n, planet, a1, a2, y1, y2) => `${n} – ${planet}: age ${a1} to ${a2} (birthday ${y1} to birthday ${y2}).`,
  validFrom: (from, to) => `Valid from ${from} to ${to}`,
  loShuDob: 'Date of birth (zeros ignored)',
  karmicDay: 'Day of birth (Moolank)',
  ofSystem: (label, system) => `${label} (${system})`,
  heart: 'Heart',
  personality: 'Personality',
  namank: 'Namank',
  maturity: 'Maturity',
  nameTotal: 'Name total',
  pinnacleN: (n) => `Pinnacle ${n}`,
  errNameEmpty: 'Please enter the name.',
  errNameScript: 'Please type the name in English letters (A–Z).',
  errDobMissing: 'Please choose the day, month and year of birth.',
  errDobInvalid: 'This date does not exist. Please check the day and month.',
  errDobFuture: 'The date of birth cannot be in the future.',
  errGender: 'Please choose Male or Female.',
};
