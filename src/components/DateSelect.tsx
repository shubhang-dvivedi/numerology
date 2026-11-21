import { useI18n } from '../i18n';

export interface DateParts {
  day: string;
  month: string;
  year: string;
}

interface Props {
  legend: string;
  value: DateParts;
  onChange: (v: DateParts) => void;
  yearFrom: number;
  yearTo: number;
  /** Show years newest first (best for birth dates). */
  descending?: boolean;
  error?: string;
  idPrefix: string;
}

/** Three large dropdowns (Day / Month / Year): easier on a phone than a calendar picker. */
export function DateSelect({ legend, value, onChange, yearFrom, yearTo, descending, error, idPrefix }: Props) {
  const { t } = useI18n();
  const years: number[] = [];
  for (let y = yearFrom; y <= yearTo; y++) years.push(y);
  if (descending) years.reverse();
  const errorId = `${idPrefix}-error`;
  const common = { 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? errorId : undefined };

  return (
    <fieldset className="field date-select">
      <legend>{legend}</legend>
      <div className="date-row">
        <label className="date-part">
          <span>{t.day}</span>
          <select {...common} value={value.day} onChange={(e) => onChange({ ...value, day: e.target.value })}>
            <option value="">--</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="date-part date-month">
          <span>{t.month}</span>
          <select {...common} value={value.month} onChange={(e) => onChange({ ...value, month: e.target.value })}>
            <option value="">--</option>
            {t.months.map((m, i) => (
              <option key={m} value={i + 1}>
                {i + 1} – {m}
              </option>
            ))}
          </select>
        </label>
        <label className="date-part">
          <span>{t.year}</span>
          <select {...common} value={value.year} onChange={(e) => onChange({ ...value, year: e.target.value })}>
            <option value="">----</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p className="error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
