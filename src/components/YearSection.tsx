import { computeYear, type Profile } from '../engine/numbers';
import type { Calc } from '../engine/reduce';
import { useI18n } from '../i18n';
import { InfoButton, SectionTitle, useInfo } from './Info';
import { NumberTile } from './NumberTile';

interface Props {
  profile: Profile;
  year: number;
  currentYear: number;
  onYearChange: (y: number) => void;
}

export const MAX_AGE = 120;
/** How many years the year table lists (it scrolls inside its own box). */
export const TABLE_YEARS = 20;

export function YearSection({ profile, year, currentYear, onYearChange }: Props) {
  const { t, date } = useI18n();
  const name = profile.person.name;
  const birthYear = profile.person.dob.year;
  const lastYear = birthYear + MAX_AGE;
  const y = computeYear(profile, year);
  const ageCalc: Calc = { value: y.age, steps: t.ageSteps(year, birthYear, y.age, date(y.from)), karmic: [] };
  const periodCalc: Calc = {
    value: y.period.index,
    steps: [...profile.periodSteps, t.ageFalls(y.age, y.period.index)],
    karmic: [],
  };

  const years: number[] = [];
  for (let v = birthYear; v <= lastYear; v++) years.push(v);

  return (
    <section className="card" aria-labelledby="sec-year" id="year">
      <SectionTitle id="sec-year" title={t.yearView} term="year" />
      <div className="year-stepper">
        <button type="button" className="btn step-btn" aria-label={t.prevYear} disabled={year <= birthYear} onClick={() => onYearChange(year - 1)}>
          ◀
        </button>
        <select aria-label={t.year} className="year-select" value={year} onChange={(e) => onYearChange(Number(e.target.value))}>
          {years.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <button type="button" className="btn step-btn" aria-label={t.nextYear} disabled={year >= lastYear} onClick={() => onYearChange(year + 1)}>
          ▶
        </button>
        {year !== currentYear && (
          <button type="button" className="btn" onClick={() => onYearChange(currentYear)}>
            {t.backToThisYear}
          </button>
        )}
      </div>
      <p className="year-range" data-testid="year-range">
        {t.yearRange(date(y.from), date(y.to))}
      </p>

      <div className="tiles">
        <NumberTile term="age" label={t.age} calc={ageCalc} name={name} />
        <NumberTile term="personalYear" label={t.personalYear} calc={y.personalYear} name={name} />
        <NumberTile term="universalYear" label={t.currentYear} sub={t.yearSub(year)} calc={y.universalYear} />
        <NumberTile term="mahadasha" label={t.mahadasha} calc={y.mahadashaCalc} display={y.mahadasha.planet} name={name} />
        <NumberTile term="pinnacle" label={t.pinnacle} sub={t.periodSub(y.period.index)} calc={y.period.pinnacle} name={name} />
        <NumberTile term="challenge" label={t.challenge} sub={t.periodSub(y.period.index)} calc={y.period.challenge} name={name} />
        <NumberTile term="birthForce" label={t.birthForcePeriod} calc={periodCalc} display={t.ageRange(y.period.startAge, y.period.endAge)} name={name} />
        <div className="tile tile-empty" aria-label={t.antardashaTileLabel}>
          <span className="tile-label">
            {t.antardasha} <InfoButton term="antardasha" label={t.antardasha} />
          </span>
          <span className="tile-value">—</span>
          <span className="tile-display">{t.notAdded}</span>
        </div>
      </div>

      <h3 className="sub-title">{t.nextYears(TABLE_YEARS)}</h3>
      <p className="muted small no-print">{t.tapRow}</p>
      <YearTable profile={profile} startYear={year} lastYear={lastYear} selected={year} onPick={onYearChange} />
    </section>
  );
}

function YearTable({ profile, startYear, lastYear, selected, onPick }: { profile: Profile; startYear: number; lastYear: number; selected: number; onPick: (y: number) => void }) {
  const openInfo = useInfo();
  const { t } = useI18n();
  const rows = [];
  for (let v = startYear; v < startYear + TABLE_YEARS && v <= lastYear; v++) rows.push(computeYear(profile, v));
  return (
    <div className="table-scroll table-years" tabIndex={0} aria-label={t.nextYears(TABLE_YEARS)} role="region">
      <table className="num-table year-table" aria-label={t.nextYears(TABLE_YEARS)}>
        <thead>
          <tr>
            <th scope="col">{t.year}</th>
            <th scope="col">{t.age}</th>
            <th scope="col">
              {t.personalYear} <InfoButton term="personalYear" label={t.personalYear} />
            </th>
            <th scope="col">
              {t.currentYear} <InfoButton term="universalYear" label={t.currentYear} />
            </th>
            <th scope="col">
              {t.mahadasha} <InfoButton term="mahadasha" label={t.mahadasha} />
            </th>
            <th scope="col">
              {t.pinnacle} <InfoButton term="pinnacle" label={t.pinnacle} />
            </th>
            <th scope="col">
              {t.challenge} <InfoButton term="challenge" label={t.challenge} />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.year} className={r.year === selected ? 'row-selected' : undefined}>
              <th scope="row">
                <button type="button" className="link-btn" aria-label={t.openYear(r.year)} onClick={() => onPick(r.year)}>
                  {r.year}
                </button>
              </th>
              <td>{r.age}</td>
              <td>
                <button
                  type="button"
                  className="cell-btn"
                  aria-label={t.personalYearOf(r.year, r.personalYear.value)}
                  onClick={() => openInfo({ term: 'personalYear', calc: r.personalYear, name: profile.person.name })}
                >
                  {r.personalYear.value}
                </button>
              </td>
              <td>{r.universalYear.value}</td>
              <td>
                {r.mahadasha.number} <span className="muted small">{r.mahadasha.planetShort}</span>
              </td>
              <td>{r.period.pinnacle.value}</td>
              <td>{r.period.challenge.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
