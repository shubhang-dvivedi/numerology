import {
  type Calc,
  chainText,
  karmicIn,
  masterNote,
  reduce,
  reduceToSingle,
  reductionChain,
  reduceWithSteps,
  sumWithSteps,
} from './reduce';
import {
  type SimpleDate,
  ageOn,
  birthdayInYear,
  compareDates,
  cycleYearOn,
  dayBefore,
  formatDate,
  isValidDate,
  todayDate,
} from './dates';
import { type LetterValue, type NameSystem, SYSTEM_LABEL, nameLetters, normalizeName } from './letters';
import { EN, type EngineText, type Gender } from './text';

export type { Gender } from './text';

export interface Person {
  name: string;
  dob: SimpleDate;
  gender: Gender;
}

// ---------------------------------------------------------------- date-based

/** A date part (day, month or year) reduced the usual way, keeping 11/22/33. */
function datePartLine(label: string, n: number): { value: number; line: string } {
  const chain = reductionChain(n, true);
  return { value: chain.at(-1)!, line: `${label}: ${chain.length > 1 ? chainText(chain) : n}` };
}

/** Day + month + year, each reduced first (keeping master numbers), then the total reduced. */
export function dateSum(date: SimpleDate, labels: { day: string; month: string; year: string }, text: EngineText = EN): Calc {
  const d = datePartLine(labels.day, date.day);
  const m = datePartLine(labels.month, date.month);
  const y = datePartLine(labels.year, date.year);
  const total = sumWithSteps([d.value, m.value, y.value], true, text);
  return { value: total.value, steps: [d.line, m.line, y.line, ...total.steps], karmic: total.karmic };
}

/** Moolank (Birth number): the day of birth reduced to 1–9. */
export function moolank(dob: SimpleDate, text: EngineText = EN): Calc {
  return reduceWithSteps(dob.day, false, text.dayOfBirth, text);
}

/** Yogyatank (Talent number): day + month + year of birth. */
export function yogyatank(dob: SimpleDate, text: EngineText = EN): Calc {
  return dateSum(dob, { day: text.dayOfBirth, month: text.birthMonth, year: text.birthYear }, text);
}

/** Kua number from the birth year and gender. 5 becomes 2 for men and 8 for women. */
export function kua(birthYear: number, gender: Gender, text: EngineText = EN): Calc {
  const yearChain = reductionChain(birthYear, false);
  const x = yearChain.at(-1)!;
  const steps = [`${text.birthYear}: ${chainText(yearChain)}`];
  const raw = gender === 'male' ? 11 - x : x + 4;
  const rawChain = reductionChain(raw, false);
  steps.push(gender === 'male' ? `${text.male}: 11 − ${x} = ${chainText(rawChain)}` : `${text.female}: ${x} + 4 = ${chainText(rawChain)}`);
  let value = rawChain.at(-1)!;
  if (value === 5) {
    value = gender === 'male' ? 2 : 8;
    steps.push(text.kuaFive(gender));
  }
  return { value, steps, karmic: [] };
}

// ---------------------------------------------------------------- name-based

export interface NameNumbers {
  system: NameSystem;
  words: LetterValue[][];
  total: number;
  /** Namank: name total reduced, keeping master numbers. */
  namank: Calc;
  /** Bhagyank (Destiny number): name total reduced to 1–9. */
  bhagyank: Calc;
  /** Heart number: vowels only (A E I O U; Y is not a vowel). */
  heart: Calc;
  /** Personality number: consonants only (Y counts as a consonant). */
  personality: Calc;
  /** Maturity number: Yogyatank + Bhagyank. */
  maturity: Calc;
}

function lettersTotal(words: LetterValue[][], filter: (l: LetterValue) => boolean, text: EngineText): { lines: string[]; total: number } {
  const lines: string[] = [];
  const wordTotals: number[] = [];
  for (const word of words) {
    const picked = word.filter(filter);
    if (picked.length === 0) continue;
    const sum = picked.reduce((s, l) => s + l.value, 0);
    wordTotals.push(sum);
    const wordText = word.map((l) => l.letter).join('');
    lines.push(`${wordText}: ${picked.map((l) => `${l.letter}(${l.value})`).join(' + ')} = ${sum}`);
  }
  const total = wordTotals.reduce((s, t) => s + t, 0);
  if (wordTotals.length > 1) lines.push(`${text.total}: ${wordTotals.join(' + ')} = ${total}`);
  return { lines, total };
}

function letterCalc(
  words: LetterValue[][],
  filter: (l: LetterValue) => boolean,
  keepMasters: boolean,
  emptyText: string,
  text: EngineText,
): Calc & { total: number } {
  const { lines, total } = lettersTotal(words, filter, text);
  if (total === 0) return { value: 0, steps: [emptyText], karmic: [], total };
  const chain = reductionChain(total, keepMasters);
  const value = chain.at(-1)!;
  const steps = [...lines];
  if (chain.length > 1) steps.push(`${text.reduce}: ${chainText(chain)}`);
  if (keepMasters) steps.push(...masterNote(value, text));
  return { value, steps, karmic: karmicIn(chain), total };
}

export function nameNumbers(name: string, system: NameSystem, talent: Calc, text: EngineText = EN): NameNumbers {
  const words = nameLetters(name, system);
  const all = () => true;
  const namank = letterCalc(words, all, true, text.noLetters, text);
  const bhagyank = letterCalc(words, all, false, text.noLetters, text);
  const heart = letterCalc(words, (l) => l.vowel, true, text.noVowels, text);
  const personality = letterCalc(words, (l) => !l.vowel, true, text.noConsonants, text);
  const maturitySum = sumWithSteps([talent.value, bhagyank.value], true, text);
  const maturity: Calc = {
    value: maturitySum.value,
    steps: [`${text.yogyatank} ${talent.value} + ${text.bhagyank} ${bhagyank.value}`, ...maturitySum.steps],
    // Karmic numbers are only flagged on the core numbers.
    karmic: [],
  };
  const strip = ({ value, steps, karmic }: Calc): Calc => ({ value, steps, karmic });
  return {
    system,
    words,
    total: namank.total,
    namank: strip(namank),
    bhagyank: strip(bhagyank),
    heart: strip(heart),
    personality: strip(personality),
    maturity,
  };
}

// ---------------------------------------------------------------- Lo Shu grid

export const LO_SHU_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export interface LoShu {
  /** How many times each number 1–9 appears. */
  counts: Record<number, number>;
  sources: { label: string; digits: number[] }[];
  missing: number[];
  repeated: number[];
}

export function loShu(dob: SimpleDate, extras: { moolank: number; bhagyank: number; kua: number }, text: EngineText = EN): LoShu {
  const dobDigits = `${dob.day}${dob.month}${dob.year}`.split('').map(Number).filter((d) => d !== 0);
  const sources = [
    { label: text.loShuDob, digits: dobDigits },
    { label: text.moolank, digits: [extras.moolank] },
    { label: text.bhagyank, digits: [extras.bhagyank] },
    { label: text.kua, digits: [extras.kua] },
  ];
  const counts: Record<number, number> = {};
  for (let n = 1; n <= 9; n++) counts[n] = 0;
  for (const s of sources) for (const d of s.digits) if (d >= 1 && d <= 9) counts[d]++;
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return {
    counts,
    sources,
    missing: nums.filter((n) => counts[n] === 0),
    repeated: nums.filter((n) => counts[n] > 1),
  };
}

// ---------------------------------------------------------------- birth force periods

export interface Period {
  index: 1 | 2 | 3 | 4;
  startAge: number;
  /** Exclusive; null for the last period, which runs for the rest of life. */
  endAge: number | null;
  startYear: number;
  endYear: number | null;
  pinnacle: Calc;
  challenge: Calc;
}

export function birthForcePeriods(dob: SimpleDate, talent: Calc, text: EngineText = EN): { periods: Period[]; firstEndSteps: string[] } {
  const M = reduce(dob.month);
  const D = reduce(dob.day);
  const Y = reduce(dob.year);
  const p1 = sumWithSteps([M, D], true, text);
  const p2 = sumWithSteps([D, Y], true, text);
  const p3 = sumWithSteps([p1.value, p2.value], true, text);
  const p4 = sumWithSteps([M, Y], true, text);

  const m = reduceToSingle(dob.month);
  const d = reduceToSingle(dob.day);
  const y = reduceToSingle(dob.year);
  const c1 = Math.abs(m - d);
  const c2 = Math.abs(d - y);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(m - y);

  const talentSingle = reduceToSingle(talent.value);
  const end1 = 36 - talentSingle;
  const firstEndSteps = [
    text.firstEnd(talent.value, talentSingle, end1),
    text.secondEnd(end1, end1 + 9),
    text.thirdEnd(end1 + 9, end1 + 18),
    text.fourthPeriod(end1 + 18),
  ];

  const parts = text.partsKept(M, D, Y);
  const singles = text.partsSingle(m, d, y);
  // Karmic numbers are only flagged on the core numbers, not on pinnacles.
  const pin = (label: string, c: Calc): Calc => ({ ...c, steps: [parts, `${label}: ${c.steps[0]}`, ...c.steps.slice(1)], karmic: [] });
  const chal = (label: string, formula: string, value: number): Calc => ({
    value,
    steps: [singles, `${label} = ${formula} = ${value}`],
    karmic: [],
  });

  const [pf1, pf2, pf3, pf4] = text.pinnacleFormulas;
  const [cf1, cf2, cf3, cf4] = text.challengeFormulas;
  const bounds = [0, end1, end1 + 9, end1 + 18, null] as const;
  const pinnacles = [pin(pf1, p1), pin(pf2, p2), pin(pf3, p3), pin(pf4, p4)];
  const challenges = [
    chal(cf1, `|${m} − ${d}|`, c1),
    chal(cf2, `|${d} − ${y}|`, c2),
    chal(cf3, `|${c1} − ${c2}|`, c3),
    chal(cf4, `|${m} − ${y}|`, c4),
  ];

  const periods = pinnacles.map((pinnacle, i): Period => {
    const startAge = bounds[i]!;
    const endAge = bounds[i + 1];
    return {
      index: (i + 1) as Period['index'],
      startAge,
      endAge,
      startYear: dob.year + startAge,
      endYear: endAge === null ? null : dob.year + endAge,
      pinnacle,
      challenge: challenges[i],
    };
  });
  return { periods, firstEndSteps };
}

export function periodAtAge(periods: Period[], age: number): Period {
  return periods.find((p) => age >= p.startAge && (p.endAge === null || age < p.endAge)) ?? periods[0];
}

// ---------------------------------------------------------------- Mahadasha

export interface Dasha {
  number: number;
  planet: string;
  planetShort: string;
  startAge: number;
  /** Exclusive. */
  endAge: number;
  startYear: number;
  endYear: number;
}

/**
 * Mahadasha periods starting from birth with the Moolank's planet.
 * Each number rules for as many years as its value (Sun 1, Moon 2 … Mars 9),
 * then the next number follows (9 → 1). One full round is 45 years.
 */
export function mahadashaTimeline(startNumber: number, birthYear: number, untilAge = 120, text: EngineText = EN): Dasha[] {
  const list: Dasha[] = [];
  let age = 0;
  let n = startNumber;
  while (age < untilAge) {
    list.push({
      number: n,
      planet: text.planet(n),
      planetShort: text.planetShort(n),
      startAge: age,
      endAge: age + n,
      startYear: birthYear + age,
      endYear: birthYear + age + n,
    });
    age += n;
    n = n === 9 ? 1 : n + 1;
  }
  return list;
}

export function dashaAtAge(timeline: Dasha[], age: number): Dasha {
  return timeline.find((d) => age >= d.startAge && age < d.endAge) ?? timeline.at(-1)!;
}

export function dashaCalc(d: Dasha, moolankValue: number, text: EngineText = EN): Calc {
  return {
    value: d.number,
    steps: [text.dashaStart(moolankValue), text.dashaRange(d.number, d.planet, d.startAge, d.endAge, d.startYear, d.endYear)],
    karmic: [],
  };
}

// ---------------------------------------------------------------- full profile

export interface KarmicHit {
  label: string;
  numbers: number[];
}

export interface MasterHit {
  label: string;
  value: number;
}

export interface Profile {
  person: Person;
  text: EngineText;
  moolank: Calc;
  yogyatank: Calc;
  kua: Calc;
  names: Record<NameSystem, NameNumbers>;
  loShu: Record<NameSystem, LoShu>;
  periods: Period[];
  periodSteps: string[];
  mahadasha: Dasha[];
  karmic: KarmicHit[];
  masters: MasterHit[];
}

export const SYSTEMS: NameSystem[] = ['chaldean', 'pythagorean'];

export function computeProfile(person: Person, text: EngineText = EN): Profile {
  const { dob } = person;
  const m = moolank(dob, text);
  const talent = yogyatank(dob, text);
  const k = kua(dob.year, person.gender, text);
  const names = {
    chaldean: nameNumbers(person.name, 'chaldean', talent, text),
    pythagorean: nameNumbers(person.name, 'pythagorean', talent, text),
  };
  const grids = {
    chaldean: loShu(dob, { moolank: m.value, bhagyank: names.chaldean.bhagyank.value, kua: k.value }, text),
    pythagorean: loShu(dob, { moolank: m.value, bhagyank: names.pythagorean.bhagyank.value, kua: k.value }, text),
  };
  const { periods, firstEndSteps } = birthForcePeriods(dob, talent, text);
  const of = (label: string, s: NameSystem) => text.ofSystem(label, SYSTEM_LABEL[s]);

  const karmicSources: [string, Calc][] = [
    [text.karmicDay, m],
    [text.yogyatank, talent],
    ...SYSTEMS.flatMap((s): [string, Calc][] => [
      [of(text.nameTotal, s), names[s].namank],
      [of(text.heart, s), names[s].heart],
      [of(text.personality, s), names[s].personality],
    ]),
  ];
  const karmic = karmicSources
    .filter(([, c]) => c.karmic.length > 0)
    .map(([label, c]) => ({ label, numbers: c.karmic }));

  const masterSources: [string, number][] = [
    [text.yogyatank, talent.value],
    ...SYSTEMS.flatMap((s): [string, number][] => [
      [of(text.namank, s), names[s].namank.value],
      [of(text.heart, s), names[s].heart.value],
      [of(text.personality, s), names[s].personality.value],
      [of(text.maturity, s), names[s].maturity.value],
    ]),
    ...periods.map((p): [string, number] => [text.pinnacleN(p.index), p.pinnacle.value]),
  ];
  const masters = masterSources
    .filter(([, v]) => v === 11 || v === 22 || v === 33)
    .map(([label, value]) => ({ label, value }));

  return {
    person: { ...person, name: person.name.trim() },
    text,
    moolank: m,
    yogyatank: talent,
    kua: k,
    names,
    loShu: grids,
    periods,
    periodSteps: firstEndSteps,
    mahadasha: mahadashaTimeline(m.value, dob.year, 120, text),
    karmic,
    masters,
  };
}

// ---------------------------------------------------------------- year-based

export interface YearView {
  year: number;
  /** Age reached on the birthday in this year. */
  age: number;
  /** The birthday in this year and the day before the next one. */
  from: SimpleDate;
  to: SimpleDate;
  universalYear: Calc;
  personalYear: Calc;
  mahadasha: Dasha;
  mahadashaCalc: Calc;
  period: Period;
}

/** Universal ("current") year number: the digits of the calendar year reduced. */
export function universalYear(year: number, text: EngineText = EN): Calc {
  return { ...reduceWithSteps(year, true, `${text.year} ${year}`, text), karmic: [] };
}

/** Personal year starting on the birthday in `year`: day + month of birth + that year. */
export function personalYear(dob: SimpleDate, year: number, text: EngineText = EN): Calc {
  const sum = dateSum({ day: dob.day, month: dob.month, year }, { day: text.dayOfBirth, month: text.birthMonth, year: text.year }, text);
  return { ...sum, karmic: [] };
}

/** Everything that depends on the chosen year. The year runs from the birthday in `year` to the next birthday. */
export function computeYear(profile: Profile, year: number): YearView {
  const { text } = profile;
  const { dob } = profile.person;
  const age = year - dob.year;
  const from = birthdayInYear(dob, year);
  const to = dayBefore(birthdayInYear(dob, year + 1));
  const py = personalYear(dob, year, text);
  const dasha = dashaAtAge(profile.mahadasha, age);
  return {
    year,
    age,
    from,
    to,
    universalYear: universalYear(year, text),
    personalYear: { ...py, steps: [text.validFrom(formatDate(from, text.monthsShort), formatDate(to, text.monthsShort)), ...py.steps] },
    mahadasha: dasha,
    mahadashaCalc: dashaCalc(dasha, profile.moolank.value, text),
    period: periodAtAge(profile.periods, age),
  };
}

/** The year whose birthday started the person's current cycle (so the current personal year shows first). */
export function currentCycleYear(dob: SimpleDate, on: SimpleDate = todayDate()): number {
  return Math.max(dob.year, cycleYearOn(dob, on));
}

// ---------------------------------------------------------------- event number

export interface EventResult {
  date: SimpleDate;
  eventNumber: Calc;
  /** Present only when the event is on or after the date of birth. */
  forPerson?: { age: number; personalYear: Calc; mahadasha: Dasha };
}

export function eventNumber(date: SimpleDate, profile?: Profile, text: EngineText = profile?.text ?? EN): EventResult {
  const sum = dateSum(date, { day: text.day, month: text.month, year: text.year }, text);
  const result: EventResult = { date, eventNumber: { ...sum, karmic: [] } };
  if (profile && compareDates(date, profile.person.dob) >= 0) {
    const { dob } = profile.person;
    const age = ageOn(dob, date);
    result.forPerson = {
      age,
      personalYear: personalYear(dob, cycleYearOn(dob, date), text),
      mahadasha: dashaAtAge(profile.mahadasha, age),
    };
  }
  return result;
}

// ---------------------------------------------------------------- validation

export interface PersonInput {
  name: string;
  day: string;
  month: string;
  year: string;
  gender: Gender | '';
}

export type PersonErrors = Partial<Record<'name' | 'dob' | 'gender', string>>;

export function validatePerson(
  input: PersonInput,
  today: SimpleDate = todayDate(),
  text: EngineText = EN,
): { person?: Person; errors: PersonErrors } {
  const errors: PersonErrors = {};
  if (!input.name.trim()) errors.name = text.errNameEmpty;
  else if (!normalizeName(input.name)) errors.name = text.errNameScript;

  const dob = { day: Number(input.day), month: Number(input.month), year: Number(input.year) };
  if (!input.day || !input.month || !input.year) errors.dob = text.errDobMissing;
  else if (!isValidDate(dob)) errors.dob = text.errDobInvalid;
  else if (compareDates(dob, today) > 0) errors.dob = text.errDobFuture;

  if (!input.gender) errors.gender = text.errGender;

  if (Object.keys(errors).length > 0) return { errors };
  return { person: { name: input.name.trim(), dob, gender: input.gender as Gender }, errors };
}
