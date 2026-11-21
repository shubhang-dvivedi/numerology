import { useState } from 'react';
import { SYSTEM_LABEL, type NameSystem } from '../engine/letters';
import { LO_SHU_LAYOUT, SYSTEMS, type NameNumbers, type Profile } from '../engine/numbers';
import type { Calc } from '../engine/reduce';
import type { GlossaryKey } from '../content/glossary';
import { useI18n } from '../i18n';
import type { UiText } from '../i18n/ui';
import { Badges, InfoButton, SectionTitle, useInfo } from './Info';
import { NumberTile } from './NumberTile';

export function MainNumbers({ profile }: { profile: Profile }) {
  const { t } = useI18n();
  const name = profile.person.name;
  const { chaldean, pythagorean } = profile.names;
  return (
    <section className="card" aria-labelledby="sec-main" id="main">
      <SectionTitle id="sec-main" title={t.mainNumbers} />
      <div className="tiles">
        <NumberTile big term="moolank" label={t.moolank} sub={t.moolankSub} calc={profile.moolank} name={name} />
        <NumberTile big term="bhagyank" label={t.bhagyank} sub="Chaldean" calc={chaldean.bhagyank} context="Chaldean" name={name} />
        <NumberTile big term="bhagyank" label={t.bhagyank} sub="Pythagorean" calc={pythagorean.bhagyank} context="Pythagorean" name={name} />
        <NumberTile big term="yogyatank" label={t.yogyatank} sub={t.yogyatankSub} calc={profile.yogyatank} name={name} />
        <NumberTile big term="kua" label={t.kua} calc={profile.kua} name={name} />
      </div>
      <p className="hint">{t.tapHint}</p>
    </section>
  );
}

type NameKey = keyof Pick<NameNumbers, 'namank' | 'bhagyank' | 'heart' | 'personality' | 'maturity'>;
const nameRows = (t: UiText): { key: NameKey; term: GlossaryKey; label: string; sub?: string }[] => [
  { key: 'namank', term: 'namank', label: t.namank, sub: t.namankSub },
  { key: 'bhagyank', term: 'bhagyank', label: t.bhagyank, sub: t.bhagyankSub },
  { key: 'heart', term: 'heart', label: t.heart },
  { key: 'personality', term: 'personality', label: t.personality },
  { key: 'maturity', term: 'maturity', label: t.maturity },
];

function CalcCell({ term, calc, label, context, name }: { term: GlossaryKey; calc: Calc; label: string; context: string; name: string }) {
  const openInfo = useInfo();
  const { t } = useI18n();
  return (
    <td>
      <button
        type="button"
        className="cell-btn"
        aria-label={`${label} (${context}): ${calc.value}. ${t.showHow}`}
        onClick={() => openInfo({ term, calc, context, name })}
      >
        <span className="cell-value">{calc.value}</span>
        <Badges calc={calc} />
      </button>
    </td>
  );
}

export function NameSection({ profile }: { profile: Profile }) {
  const { t } = useI18n();
  const name = profile.person.name;
  return (
    <section className="card" aria-labelledby="sec-name" id="name-numbers">
      <SectionTitle id="sec-name" title={t.nameNumbers} term="systems" />
      <div className="table-scroll">
        <table className="num-table name-table">
          <thead>
            <tr>
              <th scope="col">{t.colNumber}</th>
              <th scope="col">Chaldean</th>
              <th scope="col">Pythagorean</th>
            </tr>
          </thead>
          <tbody>
            {nameRows(t).map((row) => (
              <tr key={row.key}>
                <th scope="row">
                  <span className="row-label">
                    {row.label}
                    <InfoButton term={row.term} label={row.label} />
                  </span>
                  {row.sub && <span className="row-sub">{row.sub}</span>}
                </th>
                {SYSTEMS.map((s) => (
                  <CalcCell key={s} term={row.term} calc={profile.names[s][row.key]} label={row.label} context={SYSTEM_LABEL[s]} name={name} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="letters">
        <summary>{t.showLetters}</summary>
        {SYSTEMS.map((s) => (
          <div key={s} className="letters-system">
            <h3>
              {SYSTEM_LABEL[s]} · {t.total} {profile.names[s].total}
            </h3>
            <div className="letter-words">
              {profile.names[s].words.map((word, wi) => (
                <div className="letter-word" key={wi}>
                  {word.map((l, li) => (
                    <span key={li} className={`letter${l.vowel ? ' letter-vowel' : ''}`}>
                      <b>{l.letter}</b>
                      <small>{l.value}</small>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="muted">{t.vowelsNote}</p>
      </details>
    </section>
  );
}

export function LoShuSection({ profile }: { profile: Profile }) {
  const { t } = useI18n();
  const [system, setSystem] = useState<NameSystem>('chaldean');
  return (
    <section className="card" aria-labelledby="sec-loshu" id="lo-shu">
      <SectionTitle id="sec-loshu" title={t.loShu} term="loShu" />
      <div className="segmented no-print" role="group" aria-label={t.loShuGroup}>
        {SYSTEMS.map((s) => (
          <button key={s} type="button" aria-pressed={system === s} className={system === s ? 'on' : ''} onClick={() => setSystem(s)}>
            {SYSTEM_LABEL[s]}
          </button>
        ))}
      </div>
      {/* Both grids are rendered; the other one is hidden on screen but printed (paper has no toggle). */}
      <div className="loshu-blocks">
        {SYSTEMS.map((s) => (
          <div key={s} className="loshu-block" hidden={s !== system}>
            <h3 className="loshu-caption">
              {t.bhagyank}: {SYSTEM_LABEL[s]}
            </h3>
            <LoShuGrid profile={profile} system={s} selected={s === system} />
          </div>
        ))}
      </div>
    </section>
  );
}

function LoShuGrid({ profile, system, selected }: { profile: Profile; system: NameSystem; selected: boolean }) {
  const { t } = useI18n();
  const grid = profile.loShu[system];
  return (
    <>
      <div className="loshu" role="table" aria-label={`${t.loShu} (${SYSTEM_LABEL[system]})`}>
        {LO_SHU_LAYOUT.map((row, ri) => (
          <div role="row" className="loshu-row" key={ri}>
            {row.map((n) => {
              const count = grid.counts[n];
              return (
                <div
                  role="cell"
                  key={n}
                  className={`loshu-cell${count === 0 ? ' loshu-missing' : ''}`}
                  aria-label={count === 0 ? t.cellMissing(n) : t.cellCount(n, count)}
                >
                  {count === 0 ? <span className="loshu-ghost">{n}</span> : String(n).repeat(count)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <dl className="facts">
        <div>
          <dt>{t.missing}</dt>
          <dd data-testid={selected ? 'loshu-missing' : undefined}>{grid.missing.join(', ') || t.none}</dd>
        </div>
        <div>
          <dt>{t.repeated}</dt>
          <dd>{grid.repeated.map((n) => `${n} (×${grid.counts[n]})`).join(', ') || t.none}</dd>
        </div>
      </dl>
      <p className="muted small">
        {t.digitsUsed} {grid.sources.map((src) => `${src.label} ${src.digits.join(' ')}`).join(' · ')}
      </p>
    </>
  );
}

export function KarmicMasterSection({ profile }: { profile: Profile }) {
  const { t } = useI18n();
  return (
    <section className="card" aria-labelledby="sec-km" id="karmic">
      <SectionTitle id="sec-km" title={t.karmicMaster} />
      <div className="km">
        <div>
          <h3 className="sub-title">
            {t.karmicNumbers} <InfoButton term="karmic" label={t.karmicNumbers} />
          </h3>
          {profile.karmic.length === 0 ? (
            <p className="muted">{t.noKarmic}</p>
          ) : (
            <ul className="plain-list">
              {profile.karmic.map((k) => (
                <li key={k.label}>
                  {k.label}:{' '}
                  {k.numbers.map((n) => (
                    <span key={n} className="badge badge-karmic">
                      {n}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="sub-title">
            {t.masterNumbers} <InfoButton term="master" label={t.masterNumbers} />
          </h3>
          {profile.masters.length === 0 ? (
            <p className="muted">{t.noMaster}</p>
          ) : (
            <ul className="plain-list">
              {profile.masters.map((m) => (
                <li key={m.label}>
                  {m.label}: <span className="badge badge-master">{m.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
