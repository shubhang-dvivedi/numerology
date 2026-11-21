import { describe, expect, it } from 'vitest';
import { chainText, reduce, reduceToSingle, reductionChain, digitSum } from './reduce';
import { ageOn, birthdayInYear, cycleYearOn, dayBefore, isValidDate } from './dates';
import { CHALDEAN, PYTHAGOREAN, normalizeName, nameLetters } from './letters';
import {
  birthForcePeriods,
  computeProfile,
  computeYear,
  currentCycleYear,
  eventNumber,
  kua,
  loShu,
  mahadashaTimeline,
  moolank,
  nameNumbers,
  personalYear,
  universalYear,
  validatePerson,
  yogyatank,
  type Person,
} from './numbers';

// Worked example checked by hand: Ram Kumar, 29/08/1985, male.
const RAM: Person = { name: 'Ram Kumar', dob: { day: 29, month: 8, year: 1985 }, gender: 'male' };

describe('reduction rules', () => {
  it('adds digits', () => {
    expect(digitSum(1985)).toBe(23);
  });

  it('keeps master numbers 11, 22, 33 but nothing above', () => {
    expect(reduce(29)).toBe(11);
    expect(reduce(22)).toBe(22);
    expect(reduce(33)).toBe(33);
    expect(reduce(44)).toBe(8);
    expect(reduce(66)).toBe(3); // 66 → 12 → 3
    expect(reduce(49)).toBe(4); // 49 → 13 → 4
    expect(reduce(7)).toBe(7);
  });

  it('reduceToSingle always ends at 1–9', () => {
    expect(reduceToSingle(29)).toBe(2);
    expect(reduceToSingle(22)).toBe(4);
    expect(reduceToSingle(33)).toBe(6);
    expect(reduceToSingle(9)).toBe(9);
  });

  it('records the chain and describes it', () => {
    expect(reductionChain(29, false)).toEqual([29, 11, 2]);
    expect(chainText([29, 11, 2])).toBe('29 → 2 + 9 = 11 → 1 + 1 = 2');
  });
});

describe('dates', () => {
  it('validates real calendar dates', () => {
    expect(isValidDate({ day: 29, month: 2, year: 2000 })).toBe(true);
    expect(isValidDate({ day: 29, month: 2, year: 1900 })).toBe(false);
    expect(isValidDate({ day: 31, month: 4, year: 2020 })).toBe(false);
  });

  it('computes age on a date', () => {
    expect(ageOn(RAM.dob, { day: 28, month: 8, year: 2026 })).toBe(40);
    expect(ageOn(RAM.dob, { day: 29, month: 8, year: 2026 })).toBe(41);
  });

  it('handles 29 Feb birthdays (celebrated on 1 Mar in other years)', () => {
    const leap = { day: 29, month: 2, year: 2000 };
    expect(birthdayInYear(leap, 2001)).toEqual({ day: 1, month: 3, year: 2001 });
    expect(birthdayInYear(leap, 2004)).toEqual({ day: 29, month: 2, year: 2004 });
    expect(ageOn(leap, { day: 28, month: 2, year: 2001 })).toBe(0);
    expect(ageOn(leap, { day: 1, month: 3, year: 2001 })).toBe(1);
  });

  it('finds the day before, across months and years', () => {
    expect(dayBefore({ day: 1, month: 3, year: 2024 })).toEqual({ day: 29, month: 2, year: 2024 });
    expect(dayBefore({ day: 1, month: 1, year: 2027 })).toEqual({ day: 31, month: 12, year: 2026 });
  });

  it('knows which birthday cycle a date falls in', () => {
    expect(cycleYearOn(RAM.dob, { day: 21, month: 11, year: 2026 })).toBe(2026);
    expect(cycleYearOn(RAM.dob, { day: 1, month: 3, year: 2026 })).toBe(2025);
  });
});

describe('letter tables', () => {
  it('Chaldean has no 9 and the expected values', () => {
    expect(Object.values(CHALDEAN)).not.toContain(9);
    expect(Object.keys(CHALDEAN)).toHaveLength(26);
    expect([CHALDEAN.F, CHALDEAN.O, CHALDEAN.U, CHALDEAN.Y, CHALDEAN.Z]).toEqual([8, 7, 6, 1, 7]);
  });

  it('Pythagorean runs A–I = 1–9 and repeats', () => {
    expect([PYTHAGOREAN.A, PYTHAGOREAN.I, PYTHAGOREAN.J, PYTHAGOREAN.R, PYTHAGOREAN.S, PYTHAGOREAN.Z]).toEqual([1, 9, 1, 9, 1, 8]);
  });

  it('normalizes names: accents, punctuation, extra spaces', () => {
    expect(normalizeName('  rám   kumar-jI. ')).toBe('RAM KUMARJI');
    expect(normalizeName('राम')).toBe('');
  });

  it('Y is not a vowel', () => {
    const [word] = nameLetters('AY', 'chaldean');
    expect(word.map((l) => l.vowel)).toEqual([true, false]);
  });
});

describe('date-based numbers', () => {
  it('Moolank is the day reduced to 1–9', () => {
    expect(moolank(RAM.dob).value).toBe(2);
    expect(moolank({ day: 9, month: 1, year: 2000 }).value).toBe(9);
    expect(moolank({ day: 22, month: 1, year: 2000 }).value).toBe(4); // never a master number
  });

  it('Moolank flags karmic days 13, 14, 16, 19', () => {
    expect(moolank({ day: 19, month: 1, year: 2000 }).karmic).toEqual([19]);
    expect(moolank({ day: 13, month: 1, year: 2000 }).value).toBe(4);
    expect(moolank({ day: 12, month: 1, year: 2000 }).karmic).toEqual([]);
  });

  it('Yogyatank = reduced day + month + year, keeping master numbers', () => {
    // 29 → 11, 8, 1985 → 23 → 5;  11 + 8 + 5 = 24 → 6
    const y = yogyatank(RAM.dob);
    expect(y.value).toBe(6);
    expect(y.steps.at(-1)).toBe('11 + 8 + 5 = 24 → 2 + 4 = 6');
  });

  it('Yogyatank can be a master number', () => {
    // 2 + 11 + (1996 → 25 → 7) = 20 → 2 ... pick one that lands on 11: 1 + 1 + (1980 → 18 → 9) = 11
    expect(yogyatank({ day: 1, month: 1, year: 1980 }).value).toBe(11);
  });

  it('Kua matches standard tables for men and women, before and after 2000', () => {
    expect(kua(1985, 'male').value).toBe(6);
    expect(kua(1985, 'female').value).toBe(9);
    expect(kua(1990, 'male').value).toBe(1); // 11 − 1 = 10 → 1
    expect(kua(1993, 'male').value).toBe(7); // 1993 → 22 → 4; 11 − 4 = 7
    expect(kua(1980, 'female').value).toBe(4); // 9 + 4 = 13 → 4
    expect(kua(2000, 'male').value).toBe(9);
    expect(kua(2000, 'female').value).toBe(6);
    expect(kua(2003, 'male').value).toBe(6);
    expect(kua(2003, 'female').value).toBe(9);
    expect(kua(2008, 'male').value).toBe(1);
  });

  it('Kua 5 becomes 2 for men and 8 for women', () => {
    expect(kua(1986, 'male').value).toBe(2); // 1986 → 24 → 6; 11 − 6 = 5 → 2
    expect(kua(1990, 'female').value).toBe(8); // 1 + 4 = 5 → 8
    expect(kua(1986, 'male').steps.at(-1)).toMatch(/becomes 2/);
  });
});

describe('name-based numbers', () => {
  const talent = yogyatank(RAM.dob);

  it('Chaldean: RAM KUMAR', () => {
    const n = nameNumbers(RAM.name, 'chaldean', talent);
    // R2 A1 M4 = 7; K2 U6 M4 A1 R2 = 15; total 22
    expect(n.total).toBe(22);
    expect(n.namank.value).toBe(22);
    expect(n.bhagyank.value).toBe(4);
    expect(n.heart.value).toBe(8); // A1 U6 A1
    expect(n.personality.value).toBe(5); // R2 M4 K2 M4 R2 = 14 → 5
    expect(n.personality.karmic).toEqual([14]);
    expect(n.maturity.value).toBe(1); // 6 + 4 = 10 → 1
    expect(n.namank.steps).toEqual([
      'RAM: R(2) + A(1) + M(4) = 7',
      'KUMAR: K(2) + U(6) + M(4) + A(1) + R(2) = 15',
      'Total: 7 + 15 = 22',
      '22 is a master number, so it is not reduced further.',
    ]);
  });

  it('Pythagorean: RAM KUMAR', () => {
    const n = nameNumbers(RAM.name, 'pythagorean', talent);
    // R9 A1 M4 = 14; K2 U3 M4 A1 R9 = 19; total 33
    expect(n.total).toBe(33);
    expect(n.namank.value).toBe(33);
    expect(n.bhagyank.value).toBe(6);
    expect(n.heart.value).toBe(5); // A1 U3 A1
    expect(n.personality.value).toBe(1); // 9 + 4 + 2 + 4 + 9 = 28 → 10 → 1
    expect(n.maturity.value).toBe(3); // 6 + 6 = 12 → 3
  });

  it('karmic name totals are flagged through the chain (49 → 13 → 4)', () => {
    // Pythagorean "ZZZZZZZ" would be big; use letters that total 49: I(9)×5 + D(4) = 49
    const n = nameNumbers('IIIIID', 'pythagorean', talent);
    expect(n.total).toBe(49);
    expect(n.namank.value).toBe(4);
    expect(n.namank.karmic).toEqual([13]);
  });

  it('a name with no vowels gives heart 0 with an explanation', () => {
    const n = nameNumbers('Brynn', 'chaldean', talent);
    expect(n.heart.value).toBe(0);
    expect(n.heart.steps[0]).toMatch(/no vowels/);
    // B2 R2 Y1 N5 N5 = 15 → 6
    expect(n.personality.value).toBe(6);
  });
});

describe('Lo Shu grid', () => {
  it('uses DOB digits without zeros plus Moolank, Bhagyank and Kua', () => {
    const grid = loShu(RAM.dob, { moolank: 2, bhagyank: 4, kua: 6 });
    // 2,9,8,1,9,8,5 + 2,4,6
    expect(grid.counts).toEqual({ 1: 1, 2: 2, 3: 0, 4: 1, 5: 1, 6: 1, 7: 0, 8: 2, 9: 2 });
    expect(grid.missing).toEqual([3, 7]);
    expect(grid.repeated).toEqual([2, 8, 9]);
  });

  it('ignores zeros in day, month and year', () => {
    const grid = loShu({ day: 10, month: 10, year: 2000 }, { moolank: 1, bhagyank: 1, kua: 1 });
    expect(grid.sources[0].digits).toEqual([1, 1, 2]);
    expect(grid.counts[1]).toBe(5);
  });
});

describe('birth force periods, pinnacles and challenges', () => {
  const { periods, firstEndSteps } = birthForcePeriods(RAM.dob, yogyatank(RAM.dob));

  it('period ages: 36 − Yogyatank, then +9, +9', () => {
    expect(periods.map((p) => [p.startAge, p.endAge])).toEqual([[0, 30], [30, 39], [39, 48], [48, null]]);
    expect(periods.map((p) => p.startYear)).toEqual([1985, 2015, 2024, 2033]);
    expect(firstEndSteps[0]).toBe('First period ends at age 36 − Yogyatank 6 = 30');
  });

  it('pinnacles', () => {
    // M 8, D 11, Y 5: 8+11=19→10→1, 11+5=16→7, 1+7=8, 8+5=13→4
    expect(periods.map((p) => p.pinnacle.value)).toEqual([1, 7, 8, 4]);
  });

  it('does not flag karmic numbers on pinnacles (8 + 11 = 19 is not shown as karmic)', () => {
    expect(periods[0].pinnacle.karmic).toEqual([]);
  });

  it('challenges', () => {
    // m 8, d 2, y 5: |8−2|=6, |2−5|=3, |6−3|=3, |8−5|=3
    expect(periods.map((p) => p.challenge.value)).toEqual([6, 3, 3, 3]);
  });

  it('a master Yogyatank uses its single digit for the age (11 → 2 → 34)', () => {
    const dob = { day: 1, month: 1, year: 1980 };
    const r = birthForcePeriods(dob, yogyatank(dob));
    expect(r.periods[0].endAge).toBe(34);
  });

  it('challenges can be 0', () => {
    const dob = { day: 8, month: 8, year: 1988 }; // m 8, d 8
    expect(birthForcePeriods(dob, yogyatank(dob)).periods[0].challenge.value).toBe(0);
  });
});

describe('Mahadasha', () => {
  it('starts at the Moolank and each number rules for its own years', () => {
    const t = mahadashaTimeline(2, 1985);
    expect(t.slice(0, 10).map((d) => [d.number, d.startAge, d.endAge])).toEqual([
      [2, 0, 2], [3, 2, 5], [4, 5, 9], [5, 9, 14], [6, 14, 20],
      [7, 20, 27], [8, 27, 35], [9, 35, 44], [1, 44, 45], [2, 45, 47],
    ]);
    expect(t[7].planet).toBe('Mars (Mangal)');
    expect(t[7].startYear).toBe(2020);
    expect(t[7].endYear).toBe(2029);
  });

  it('repeats every 45 years and covers a full life', () => {
    const t = mahadashaTimeline(9, 2000);
    expect(t[0]).toMatchObject({ number: 9, startAge: 0, endAge: 9 });
    expect(t.find((d) => d.startAge === 45)?.number).toBe(9);
    expect(t.at(-1)!.endAge).toBeGreaterThanOrEqual(120);
  });
});

describe('year-based numbers', () => {
  const profile = computeProfile(RAM);

  it('universal year', () => {
    expect(universalYear(2026).value).toBe(1);
    expect(universalYear(2029).value).toBe(4); // 13 → 4
    expect(universalYear(2029).karmic).toEqual([]); // karmic only flagged on core numbers
  });

  it('personal year = reduced day + month + year', () => {
    // 11 + 8 + (2026 → 10 → 1) = 20 → 2
    expect(personalYear(RAM.dob, 2026).value).toBe(2);
    // 11 + 8 + (2027 → 11) = 30 → 3
    expect(personalYear(RAM.dob, 2027).value).toBe(3);
  });

  it('computeYear gives the birthday-to-birthday view', () => {
    const y = computeYear(profile, 2026);
    expect(y.age).toBe(41);
    expect(y.from).toEqual({ day: 29, month: 8, year: 2026 });
    expect(y.to).toEqual({ day: 28, month: 8, year: 2027 });
    expect(y.personalYear.value).toBe(2);
    expect(y.personalYear.steps[0]).toBe('Valid from 29 Aug 2026 to 28 Aug 2027');
    expect(y.universalYear.value).toBe(1);
    expect(y.mahadasha.number).toBe(9);
    expect(y.period.index).toBe(3);
    expect(y.period.pinnacle.value).toBe(8);
  });

  it('switches Mahadasha exactly at the boundary age', () => {
    expect(computeYear(profile, 2028).mahadasha.number).toBe(9); // age 43
    expect(computeYear(profile, 2029).mahadasha.number).toBe(1); // age 44
  });

  it('current cycle year depends on whether the birthday has passed', () => {
    expect(currentCycleYear(RAM.dob, { day: 21, month: 11, year: 2026 })).toBe(2026);
    expect(currentCycleYear(RAM.dob, { day: 1, month: 6, year: 2026 })).toBe(2025);
    // A baby born this year before their first birthday cycle completes stays on the birth year.
    expect(currentCycleYear({ day: 1, month: 12, year: 2026 }, { day: 21, month: 11, year: 2026 })).toBe(2026);
  });
});

describe('event number', () => {
  it('reduces the event date like any other date', () => {
    // 15 → 6, 8, 1947 → 21 → 3; 6 + 8 + 3 = 17 → 8
    expect(eventNumber({ day: 15, month: 8, year: 1947 }).eventNumber.value).toBe(8);
  });

  it('adds the person\'s age, personal year and Mahadasha on that date', () => {
    const profile = computeProfile(RAM);
    const r = eventNumber({ day: 1, month: 1, year: 2027 }, profile);
    expect(r.forPerson?.age).toBe(41);
    expect(r.forPerson?.personalYear.value).toBe(2); // cycle that began 29 Aug 2026
    expect(r.forPerson?.mahadasha.number).toBe(9);
  });

  it('skips person details for dates before birth', () => {
    const profile = computeProfile(RAM);
    expect(eventNumber({ day: 1, month: 1, year: 1980 }, profile).forPerson).toBeUndefined();
  });
});

describe('full profile', () => {
  const p = computeProfile(RAM);

  it('collects the headline numbers', () => {
    expect(p.moolank.value).toBe(2);
    expect(p.yogyatank.value).toBe(6);
    expect(p.kua.value).toBe(6);
    expect(p.names.chaldean.bhagyank.value).toBe(4);
    expect(p.names.pythagorean.bhagyank.value).toBe(6);
  });

  it('builds a Lo Shu grid per name system', () => {
    expect(p.loShu.chaldean.missing).toEqual([3, 7]);
    // Pythagorean Bhagyank 6: 2,9,8,1,9,8,5 + 2,6,6
    expect(p.loShu.pythagorean.missing).toEqual([3, 4, 7]);
  });

  it('lists karmic and master numbers', () => {
    expect(p.karmic).toEqual([{ label: 'Personality (Chaldean)', numbers: [14] }]);
    expect(p.masters).toEqual([
      { label: 'Namank (Chaldean)', value: 22 },
      { label: 'Namank (Pythagorean)', value: 33 },
    ]);
  });
});

describe('validation', () => {
  const today = { day: 21, month: 11, year: 2026 };
  const ok = { name: 'Ram', day: '29', month: '8', year: '1985', gender: 'male' as const };

  it('accepts a complete entry', () => {
    const r = validatePerson(ok, today);
    expect(r.errors).toEqual({});
    expect(r.person?.dob).toEqual({ day: 29, month: 8, year: 1985 });
  });

  it('rejects missing or non-English names', () => {
    expect(validatePerson({ ...ok, name: '  ' }, today).errors.name).toMatch(/enter the name/);
    expect(validatePerson({ ...ok, name: 'राम' }, today).errors.name).toMatch(/English letters/);
  });

  it('rejects impossible and future dates', () => {
    expect(validatePerson({ ...ok, day: '31', month: '2' }, today).errors.dob).toMatch(/does not exist/);
    expect(validatePerson({ ...ok, day: '22', month: '11', year: '2026' }, today).errors.dob).toMatch(/future/);
    expect(validatePerson({ ...ok, day: '' }, today).errors.dob).toMatch(/choose/);
  });

  it('requires gender', () => {
    expect(validatePerson({ ...ok, gender: '' }, today).errors.gender).toBeDefined();
  });
});

describe('language never changes the maths', () => {
  it('English and Hindi wording give identical numbers', async () => {
    const { ENGINE_HI } = await import('../i18n/engine-hi');
    const people: Person[] = [
      RAM,
      { name: 'Sita Devi', dob: { day: 13, month: 11, year: 1993 }, gender: 'female' },
      { name: 'Brynn', dob: { day: 29, month: 2, year: 2000 }, gender: 'male' },
    ];
    const numbersOnly = (p: Person, text?: typeof ENGINE_HI) => {
      const prof = computeProfile(p, text);
      const v = (c: { value: number; karmic: number[] }) => [c.value, c.karmic];
      return JSON.stringify({
        core: [prof.moolank, prof.yogyatank, prof.kua].map(v),
        names: Object.values(prof.names).map((n) => [n.total, ...[n.namank, n.bhagyank, n.heart, n.personality, n.maturity].map(v)]),
        loShu: Object.values(prof.loShu).map((g) => g.counts),
        periods: prof.periods.map((x) => [x.startAge, x.endAge, x.pinnacle.value, x.challenge.value]),
        maha: prof.mahadasha.map((d) => [d.number, d.startAge]),
        years: Array.from({ length: 50 }, (_, i) => {
          const y = computeYear(prof, p.dob.year + i);
          return [y.age, y.personalYear.value, y.universalYear.value, y.mahadasha.number, y.period.index];
        }),
        karmic: prof.karmic.map((k) => k.numbers),
        masters: prof.masters.map((m) => m.value),
      });
    };
    for (const p of people) expect(numbersOnly(p, ENGINE_HI)).toBe(numbersOnly(p));
  });

  it('Hindi working uses Hindi words', async () => {
    const { ENGINE_HI } = await import('../i18n/engine-hi');
    const prof = computeProfile(RAM, ENGINE_HI);
    expect(prof.moolank.steps[0]).toBe('जन्म का दिन: 29 → 2 + 9 = 11 → 1 + 1 = 2');
    expect(prof.mahadasha[7].planet).toBe('मंगल');
    expect(prof.kua.steps[1]).toBe('पुरुष: 11 − 5 = 6');
  });
});
