import type { GlossaryKey } from '../content/glossary';
import type { Calc } from '../engine/reduce';
import { useI18n } from '../i18n';
import { Badges, useInfo } from './Info';

interface Props {
  term: GlossaryKey;
  label: string;
  sub?: string;
  calc: Calc;
  /** Text to show under the number (e.g. a planet name). */
  display?: string;
  context?: string;
  name?: string;
  big?: boolean;
}

/** A tappable number card. Tapping it opens the rule and this person's working. */
export function NumberTile({ term, label, sub, calc, display, context, name, big }: Props) {
  const openInfo = useInfo();
  const { t } = useI18n();
  return (
    <button
      type="button"
      className={`tile${big ? ' tile-big' : ''}`}
      aria-label={`${label}${sub ? ` (${sub})` : ''}: ${display ?? calc.value}. ${t.showHow}`}
      onClick={() => openInfo({ term, calc, context, name })}
    >
      <span className="tile-label">{label}</span>
      {sub && <span className="tile-sub">{sub}</span>}
      <span className="tile-value">{calc.value}</span>
      {display && <span className="tile-display">{display}</span>}
      <Badges calc={calc} />
      <span className="tile-info" aria-hidden="true">
        i
      </span>
    </button>
  );
}
