/** Short English explanations shown in the ⓘ popups. The Hindi version is in glossary-hi.ts. */
export interface GlossaryEntry {
  title: string;
  aka?: string;
  meaning: string;
  formula: string[];
}

export const GLOSSARY = {
  moolank: {
    title: 'Moolank',
    aka: 'Birth number · Root number',
    meaning: 'Comes from the day of the month the person was born.',
    formula: ['Day of birth, reduced to 1–9.', 'Example: born on the 29th → 2 + 9 = 11 → 1 + 1 = 2.'],
  },
  bhagyank: {
    title: 'Bhagyank',
    aka: 'Destiny number',
    meaning: 'Comes from the name. Shown separately for the Chaldean and Pythagorean letter values.',
    formula: [
      'Give every letter of the name its number and add them all.',
      'Reduce the total to 1–9.',
      'Example (Chaldean): RAM = 2 + 1 + 4 = 7.',
    ],
  },
  yogyatank: {
    title: 'Yogyatank',
    aka: 'Talent number',
    meaning: 'Comes from the full date of birth.',
    formula: [
      'Reduce the day, the month and the year separately (keep 11, 22, 33).',
      'Add the three and reduce again (keep 11, 22, 33).',
      'Example: 29-08-1985 → 11 + 8 + 5 = 24 → 6.',
    ],
  },
  namank: {
    title: 'Namank',
    aka: 'Name number',
    meaning: 'The total of the name. Same total as Bhagyank, but 11, 22 and 33 are kept.',
    formula: ['Add the value of every letter in the name.', 'Reduce, stopping at 11, 22 or 33.'],
  },
  heart: {
    title: 'Heart number',
    aka: 'Soul urge',
    meaning: 'Uses only the vowels of the name.',
    formula: ['Add the values of A, E, I, O, U in the name (Y is NOT a vowel).', 'Reduce (keep 11, 22, 33).'],
  },
  personality: {
    title: 'Personality number',
    meaning: 'Uses only the consonants of the name.',
    formula: ['Add the values of all letters except A, E, I, O, U (Y counts here).', 'Reduce (keep 11, 22, 33).'],
  },
  maturity: {
    title: 'Maturity number',
    meaning: 'Combines the date of birth and the name.',
    formula: ['Yogyatank + Bhagyank.', 'Reduce (keep 11, 22, 33).'],
  },
  kua: {
    title: 'Kua number',
    meaning: 'Comes from the birth year and gender.',
    formula: [
      'Add the digits of the birth year and reduce to 1–9.',
      'Male: 11 − that number. Female: that number + 4. Reduce to 1–9.',
      'If the answer is 5: men get 2, women get 8.',
      'Example: 1985 → 23 → 5. Male 11 − 5 = 6. Female 5 + 4 = 9.',
    ],
  },
  loShu: {
    title: 'Lo Shu grid',
    meaning: 'A 3 × 3 grid (4 9 2 / 3 5 7 / 8 1 6) showing which numbers are present, repeated or missing.',
    formula: [
      'Put in every digit of the date of birth (zeros are ignored).',
      'Also add the Moolank, Bhagyank and Kua.',
      'Bhagyank differs between Chaldean and Pythagorean, so there is a grid for each.',
    ],
  },
  karmic: {
    title: 'Karmic numbers',
    meaning: '13, 14, 16 and 19. Shown when one of them comes up while reducing a number.',
    formula: [
      'Checked in: day of birth, Yogyatank, name total, Heart and Personality.',
      'Example: name total 49 → 4 + 9 = 13 → 4. Karmic 13 is shown.',
    ],
  },
  master: {
    title: 'Master numbers',
    meaning: '11, 22 and 33. They are not reduced further (nothing above 33 is a master number).',
    formula: ['Moolank and Bhagyank are always 1–9, so they are never master numbers.'],
  },
  year: {
    title: 'Year',
    meaning: 'The year you are looking at. Each year runs from the birthday to the day before the next birthday.',
    formula: ['Use ◀ and ▶ to move between years.'],
  },
  age: {
    title: 'Age',
    meaning: 'The age the person turns on their birthday in the chosen year.',
    formula: ['Chosen year − birth year.'],
  },
  universalYear: {
    title: 'Current year number',
    aka: 'Universal year',
    meaning: 'The number of the calendar year itself. It is the same for everyone.',
    formula: ['Add the digits of the year and reduce (keep 11, 22, 33).', 'Example: 2026 → 2 + 0 + 2 + 6 = 10 → 1.'],
  },
  personalYear: {
    title: 'Personal year',
    meaning: 'The number for the person for one year. It starts on the birthday.',
    formula: [
      'Reduce the day of birth, the birth month and the chosen year separately (keep 11, 22, 33).',
      'Add the three and reduce again.',
      'Example: 29 Aug, year 2026 → 11 + 8 + 1 = 20 → 2.',
    ],
  },
  birthForce: {
    title: 'Birth force periods',
    meaning: 'Life is split into four periods. Each period has its own Pinnacle and Challenge.',
    formula: [
      'Period 1 ends at age 36 − Yogyatank (11/22/33 are used as 2/4/6 here).',
      'Period 2 ends 9 years later. Period 3 ends 9 years after that.',
      'Period 4 runs for the rest of life.',
    ],
  },
  pinnacle: {
    title: 'Pinnacle number',
    meaning: 'One for each birth force period.',
    formula: [
      'Reduce month, day and year of birth separately (keep 11, 22, 33).',
      'Pinnacle 1 = Month + Day.  Pinnacle 2 = Day + Year.',
      'Pinnacle 3 = Pinnacle 1 + Pinnacle 2.  Pinnacle 4 = Month + Year.',
      'Reduce each (keep 11, 22, 33).',
    ],
  },
  challenge: {
    title: 'Challenge number',
    meaning: 'One for each birth force period. It can be 0.',
    formula: [
      'Reduce month, day and year of birth to 1–9.',
      'Challenge 1 = Month − Day.  Challenge 2 = Day − Year.',
      'Challenge 3 = Challenge 1 − Challenge 2.  Challenge 4 = Month − Year.',
      'Always take the difference as a positive number.',
    ],
  },
  mahadasha: {
    title: 'Mahadasha',
    meaning: 'The planet period running at a given age.',
    formula: [
      'Starts at birth with the Moolank\'s planet.',
      'Each number rules for that many years: Sun 1, Moon 2, Jupiter 3, Rahu 4, Mercury 5, Venus 6, Ketu 7, Saturn 8, Mars 9.',
      'Then the next number follows (after 9 comes 1). One full round = 45 years.',
    ],
  },
  antardasha: {
    title: 'Antardasha',
    meaning: 'Not added yet. This section is kept blank for now.',
    formula: [],
  },
  event: {
    title: 'Event number',
    meaning: 'The number of any date, such as a wedding, shop opening or move.',
    formula: [
      'Reduce the day, month and year separately (keep 11, 22, 33).',
      'Add the three and reduce again.',
      'Also shows the person\'s age, Personal year and Mahadasha on that date.',
    ],
  },
  systems: {
    title: 'Chaldean and Pythagorean',
    meaning: 'Two ways of giving numbers to letters. Every name number is shown in both.',
    formula: [
      'Chaldean: A I J Q Y = 1, B K R = 2, C G L S = 3, D M T = 4, E H N X = 5, U V W = 6, O Z = 7, F P = 8 (no 9).',
      'Pythagorean: A–I = 1–9, J–R = 1–9, S–Z = 1–8.',
    ],
  },
} satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof GLOSSARY;
