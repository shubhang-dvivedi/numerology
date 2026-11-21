import { useState } from 'react';
import { isValidDate, type SimpleDate } from '../engine/dates';
import { eventNumber, type Profile } from '../engine/numbers';
import { useI18n } from '../i18n';
import { DateSelect, type DateParts } from './DateSelect';
import { SectionTitle } from './Info';
import { NumberTile } from './NumberTile';

export function EventSection({ profile, today }: { profile: Profile; today: SimpleDate }) {
  const { t } = useI18n();
  const [date, setDate] = useState<DateParts>({ day: String(today.day), month: String(today.month), year: String(today.year) });
  const parsed = { day: Number(date.day), month: Number(date.month), year: Number(date.year) };
  const complete = Boolean(date.day && date.month && date.year);
  const valid = complete && isValidDate(parsed);
  const result = valid ? eventNumber(parsed, profile) : undefined;
  const name = profile.person.name;
  const then = result?.forPerson;

  return (
    <section className="card" aria-labelledby="sec-event" id="event">
      <SectionTitle id="sec-event" title={t.eventNumber} term="event" />
      <DateSelect
        idPrefix="event"
        legend={t.eventDate}
        value={date}
        onChange={setDate}
        yearFrom={1900}
        yearTo={today.year + 50}
        error={complete && !valid ? t.dateInvalid : undefined}
      />
      {result && (
        <div className="tiles">
          <NumberTile term="event" label={t.eventNumber} calc={result.eventNumber} />
          {then && (
            <>
              <NumberTile term="age" label={t.ageOnDate} calc={{ value: then.age, steps: [t.ageOnDateStep(then.age)], karmic: [] }} name={name} />
              <NumberTile term="personalYear" label={t.personalYearThen} calc={then.personalYear} name={name} />
              <NumberTile
                term="mahadasha"
                label={t.mahadashaThen}
                calc={{ value: then.mahadasha.number, steps: [t.mahadashaThenStep(then.mahadasha.planet, then.mahadasha.startAge, then.mahadasha.endAge)], karmic: [] }}
                display={then.mahadasha.planet}
                name={name}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
}
