import { useState, type FormEvent } from 'react';
import type { SimpleDate } from '../engine/dates';
import { validatePerson, type Person, type PersonInput } from '../engine/numbers';
import { useI18n } from '../i18n';
import type { SavedPerson } from '../storage';
import { DateSelect } from './DateSelect';

interface Props {
  initial?: Person;
  today: SimpleDate;
  saved: SavedPerson[];
  onSubmit: (p: Person) => void;
  onOpenSaved: (p: SavedPerson) => void;
  onDeleteSaved: (id: string) => void;
}

const toInput = (p?: Person): PersonInput =>
  p
    ? { name: p.name, day: String(p.dob.day), month: String(p.dob.month), year: String(p.dob.year), gender: p.gender }
    : { name: '', day: '', month: '', year: '', gender: '' };

export function PersonForm({ initial, today, saved, onSubmit, onOpenSaved, onDeleteSaved }: Props) {
  const { t, e } = useI18n();
  const [input, setInput] = useState<PersonInput>(() => toInput(initial));
  const [attempted, setAttempted] = useState(false);
  // Errors are worked out on every render once Calculate was pressed, so they follow the language
  // and disappear as soon as the field is fixed.
  const errors = attempted ? validatePerson(input, today, e).errors : {};

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    setAttempted(true);
    const result = validatePerson(input, today, e);
    if (result.person) onSubmit(result.person);
  };

  return (
    <div className="form-page">
      <form className="card person-form" onSubmit={submit} noValidate aria-label={t.enterDetails}>
        <h2>{t.enterDetails}</h2>

        <div className="field">
          <label htmlFor="name">{t.fullName}</label>
          <input
            id="name"
            type="text"
            autoComplete="off"
            autoCapitalize="words"
            spellCheck={false}
            placeholder={t.namePlaceholder}
            value={input.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'name-error' : 'name-hint'}
            onChange={(ev) => setInput({ ...input, name: ev.target.value })}
          />
          {errors.name ? (
            <p className="error" id="name-error" role="alert">
              {errors.name}
            </p>
          ) : (
            <p className="muted small field-hint" id="name-hint">
              {t.nameHint}
            </p>
          )}
        </div>

        <DateSelect
          idPrefix="dob"
          legend={t.dob}
          value={input}
          onChange={(d) => setInput({ ...input, ...d })}
          yearFrom={1900}
          yearTo={today.year}
          descending
          error={errors.dob}
        />

        <fieldset className="field">
          <legend>{t.gender}</legend>
          <div className="choice-row">
            {(['male', 'female'] as const).map((g) => (
              <label key={g} className={`choice${input.gender === g ? ' choice-on' : ''}`}>
                <input type="radio" name="gender" value={g} checked={input.gender === g} onChange={() => setInput({ ...input, gender: g })} />
                {g === 'male' ? t.male : t.female}
              </label>
            ))}
          </div>
          {errors.gender && (
            <p className="error" role="alert">
              {errors.gender}
            </p>
          )}
        </fieldset>

        <button type="submit" className="btn btn-primary btn-block btn-large">
          {t.calculate}
        </button>
      </form>

      <SavedPeople saved={saved} onOpen={onOpenSaved} onDelete={onDeleteSaved} />
    </div>
  );
}

function SavedPeople({ saved, onOpen, onDelete }: { saved: SavedPerson[]; onOpen: (p: SavedPerson) => void; onDelete: (id: string) => void }) {
  const { t, date } = useI18n();
  const [query, setQuery] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  if (saved.length === 0) return null;
  const q = query.trim().toLowerCase();
  const shown = q ? saved.filter((p) => p.name.toLowerCase().includes(q)) : saved;

  return (
    <section className="card saved" aria-labelledby="saved-title">
      <h2 id="saved-title">{t.savedPeople}</h2>
      <p className="muted">{t.savedNote}</p>
      {saved.length > 5 && (
        <input
          type="search"
          className="search"
          placeholder={t.searchPlaceholder}
          aria-label={t.searchLabel}
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
        />
      )}
      <ul className="saved-list">
        {shown.map((p) => (
          <li key={p.id}>
            {confirmId === p.id ? (
              <div className="saved-confirm">
                <span>{t.removeConfirm(p.name)}</span>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    onDelete(p.id);
                    setConfirmId(null);
                  }}
                >
                  {t.yesRemove}
                </button>
                <button type="button" className="btn" onClick={() => setConfirmId(null)}>
                  {t.no}
                </button>
              </div>
            ) : (
              <>
                <button type="button" className="saved-open" onClick={() => onOpen(p)}>
                  <strong>{p.name}</strong>
                  <span>
                    {date(p.dob)} · {p.gender === 'male' ? t.male : t.female}
                  </span>
                </button>
                <button type="button" className="icon-btn" aria-label={t.removeLabel(p.name)} onClick={() => setConfirmId(p.id)}>
                  🗑
                </button>
              </>
            )}
          </li>
        ))}
        {shown.length === 0 && <li className="muted">{t.noMatch(query)}</li>}
      </ul>
    </section>
  );
}
