export type NameSystem = 'chaldean' | 'pythagorean';

export const SYSTEM_LABEL: Record<NameSystem, string> = {
  chaldean: 'Chaldean',
  pythagorean: 'Pythagorean',
};

/** Chaldean values. There is no 9 in this system. */
export const CHALDEAN: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

/** Pythagorean values: A–I = 1–9, J–R = 1–9, S–Z = 1–8. */
export const PYTHAGOREAN: Record<string, number> = Object.fromEntries(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch, i) => [ch, (i % 9) + 1]),
);

export const LETTER_VALUES: Record<NameSystem, Record<string, number>> = {
  chaldean: CHALDEAN,
  pythagorean: PYTHAGOREAN,
};

/** Y is NOT treated as a vowel. */
export const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

/** Upper-case, remove accents, keep only A–Z and single spaces between words. */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface LetterValue {
  letter: string;
  value: number;
  vowel: boolean;
}

/** Letter-by-letter values grouped by word. */
export function nameLetters(name: string, system: NameSystem): LetterValue[][] {
  const table = LETTER_VALUES[system];
  const normalized = normalizeName(name);
  if (!normalized) return [];
  return normalized.split(' ').map((word) =>
    word.split('').map((letter) => ({ letter, value: table[letter], vowel: VOWELS.has(letter) })),
  );
}
