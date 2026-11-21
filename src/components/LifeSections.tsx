import { dashaAtAge, periodAtAge, type Profile } from '../engine/numbers';
import { useI18n } from '../i18n';
import { Badges, InfoButton, SectionTitle, useInfo } from './Info';

export function PeriodsSection({ profile, ageToday }: { profile: Profile; ageToday: number }) {
  const openInfo = useInfo();
  const { t } = useI18n();
  const name = profile.person.name;
  const current = periodAtAge(profile.periods, ageToday);
  return (
    <section className="card" aria-labelledby="sec-periods" id="periods">
      <SectionTitle id="sec-periods" title={t.birthForcePeriods} term="birthForce" />
      <div className="table-scroll">
        <table className="num-table">
          <thead>
            <tr>
              <th scope="col">{t.colPeriod}</th>
              <th scope="col">{t.colAge}</th>
              <th scope="col">{t.colYears}</th>
              <th scope="col">
                {t.pinnacle} <InfoButton term="pinnacle" label={t.pinnacle} />
              </th>
              <th scope="col">
                {t.challenge} <InfoButton term="challenge" label={t.challenge} />
              </th>
            </tr>
          </thead>
          <tbody>
            {profile.periods.map((p) => (
              <tr key={p.index} className={p.index === current.index ? 'row-selected' : undefined}>
                <th scope="row">
                  {p.index}
                  {p.index === current.index && <span className="now-tag">{t.now}</span>}
                </th>
                <td>{p.endAge === null ? `${p.startAge}+` : `${p.startAge}–${p.endAge}`}</td>
                <td>{p.endYear === null ? t.onward(p.startYear) : `${p.startYear}–${p.endYear}`}</td>
                <td>
                  <button
                    type="button"
                    className="cell-btn"
                    aria-label={`${t.pinnacleN(p.index)}: ${p.pinnacle.value}. ${t.showHow}`}
                    onClick={() => openInfo({ term: 'pinnacle', calc: p.pinnacle, context: t.pinnacleN(p.index), name })}
                  >
                    <span className="cell-value">{p.pinnacle.value}</span>
                    <Badges calc={p.pinnacle} />
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="cell-btn"
                    aria-label={`${t.challengeN(p.index)}: ${p.challenge.value}. ${t.showHow}`}
                    onClick={() => openInfo({ term: 'challenge', calc: p.challenge, context: t.challengeN(p.index), name })}
                  >
                    <span className="cell-value">{p.challenge.value}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">{profile.periodSteps[0]}.</p>
    </section>
  );
}

export function MahadashaSection({ profile, ageToday }: { profile: Profile; ageToday: number }) {
  const { t } = useI18n();
  const current = dashaAtAge(profile.mahadasha, ageToday);
  const rows = profile.mahadasha.filter((d) => d.startAge < 100);
  return (
    <section className="card" aria-labelledby="sec-maha" id="mahadasha">
      <SectionTitle id="sec-maha" title={t.mahadasha} term="mahadasha" />
      <div className="table-scroll table-tall">
        <table className="num-table">
          <thead>
            <tr>
              <th scope="col">{t.colNo}</th>
              <th scope="col">{t.colPlanet}</th>
              <th scope="col">{t.colAge}</th>
              <th scope="col">{t.colYears}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.startAge} className={d === current ? 'row-selected' : undefined}>
                <th scope="row">{d.number}</th>
                <td>
                  {d.planet}
                  {d === current && <span className="now-tag">{t.now}</span>}
                </td>
                <td>
                  {d.startAge}–{d.endAge}
                </td>
                <td>
                  {d.startYear}–{d.endYear}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">{t.mahaNote(profile.moolank.value)}</p>
    </section>
  );
}

export function AntardashaSection() {
  const { t } = useI18n();
  return (
    <section className="card" aria-labelledby="sec-antar" id="antardasha">
      <SectionTitle id="sec-antar" title={t.antardasha} term="antardasha" />
      <p className="muted">{t.antardashaBlank}</p>
    </section>
  );
}
