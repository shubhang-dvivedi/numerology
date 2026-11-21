import { EN, type EngineText } from './text';

/**
 * Digit-reduction rules used by every calculation.
 *
 * - "reduce" keeps the master numbers 11, 22 and 33 (nothing above 33 is a master).
 * - "reduceToSingle" always goes down to 1–9 (used for Moolank, Bhagyank, Kua, challenges).
 * - Karmic numbers are 13, 14, 16 and 19 when they appear while reducing.
 */

export const MASTER_NUMBERS = [11, 22, 33] as const;
export const KARMIC_NUMBERS = [13, 14, 16, 19] as const;

/** Result of a calculation together with the working shown to the user. */
export interface Calc {
  value: number;
  /** Human-readable working, one line per step. */
  steps: string[];
  /** Karmic numbers (13/14/16/19) seen while reducing this number. */
  karmic: number[];
}

export const isMaster = (n: number): boolean => (MASTER_NUMBERS as readonly number[]).includes(n);
export const isKarmic = (n: number): boolean => (KARMIC_NUMBERS as readonly number[]).includes(n);

export const digitsOf = (n: number): number[] => String(Math.abs(n)).split('').map(Number);
export const digitSum = (n: number): number => digitsOf(n).reduce((s, d) => s + d, 0);

/** Every value from `n` down to its final reduced value, e.g. 29 → [29, 11, 2]. */
export function reductionChain(n: number, keepMasters = true): number[] {
  const chain = [n];
  let current = n;
  while (current > 9 && !(keepMasters && isMaster(current))) {
    current = digitSum(current);
    chain.push(current);
  }
  return chain;
}

export const reduce = (n: number): number => reductionChain(n, true).at(-1)!;
export const reduceToSingle = (n: number): number => reductionChain(n, false).at(-1)!;

/** "29 → 2 + 9 = 11 → 1 + 1 = 2" */
export function chainText(chain: number[]): string {
  let text = String(chain[0]);
  for (let i = 1; i < chain.length; i++) {
    text += ` → ${digitsOf(chain[i - 1]).join(' + ')} = ${chain[i]}`;
  }
  return text;
}

export const karmicIn = (chain: number[]): number[] => [...new Set(chain.filter(isKarmic))];

/** A note to append when the final value is a master number that was kept. */
export const masterNote = (value: number, text: EngineText = EN): string[] =>
  isMaster(value) ? [text.masterKept(value)] : [];

/**
 * Reduce a single number and describe the working.
 * `label` is a prefix such as "Day of birth".
 */
export function reduceWithSteps(n: number, keepMasters: boolean, label?: string, text: EngineText = EN): Calc {
  const chain = reductionChain(n, keepMasters);
  const value = chain.at(-1)!;
  const line = chain.length > 1 ? chainText(chain) : String(n);
  return {
    value,
    steps: [label ? `${label}: ${line}` : line, ...(keepMasters ? masterNote(value, text) : [])],
    karmic: karmicIn(chain),
  };
}

/**
 * Add several already-reduced parts, then reduce the total.
 * Produces e.g. ["11 + 8 + 5 = 24 → 2 + 4 = 6"].
 */
export function sumWithSteps(parts: number[], keepMasters: boolean, text: EngineText = EN): Calc {
  const total = parts.reduce((s, p) => s + p, 0);
  const chain = reductionChain(total, keepMasters);
  const value = chain.at(-1)!;
  const sumText = parts.length > 1 ? `${parts.join(' + ')} = ${chainText(chain)}` : chainText(chain);
  return {
    value,
    steps: [sumText, ...(keepMasters ? masterNote(value, text) : [])],
    karmic: karmicIn(chain),
  };
}
