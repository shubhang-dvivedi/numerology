import { useCallback, useEffect, useMemo, useState } from 'react';
import { ageOn, todayDate, type SimpleDate } from './engine/dates';
import { computeProfile, computeYear, currentCycleYear, type Person, type Profile } from './engine/numbers';
import type { GlossaryKey } from './content/glossary';
import { I18nProvider, i18nFor, loadLang, saveLang, useI18n, type Lang } from './i18n';
import { loadPeople, removePerson, savePerson, type SavedPerson } from './storage';
import { shareText } from './share';
import { GlossaryBody, InfoModal, InfoProvider, Modal, type InfoRequest } from './components/Info';
import { PersonForm } from './components/PersonForm';
import { KarmicMasterSection, LoShuSection, MainNumbers, NameSection } from './components/CoreSections';
import { YearSection } from './components/YearSection';
import { AntardashaSection, MahadashaSection, PeriodsSection } from './components/LifeSections';
import { EventSection } from './components/EventSection';

const RESULTS_STATE = 'results';

export default function App({ today = todayDate() }: { today?: SimpleDate }) {
  const [lang, setLang] = useState<Lang>(loadLang);
  const i18n = useMemo(() => i18nFor(lang), [lang]);
  const { t, g } = i18n;
  const [person, setPerson] = useState<Person | null>(null);
  const [formInitial, setFormInitial] = useState<Person | undefined>();
  const [formKey, setFormKey] = useState(0);
  const [saved, setSaved] = useState<SavedPerson[]>(loadPeople);
  const [year, setYear] = useState(today.year);
  const [info, setInfo] = useState<InfoRequest | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const profile = useMemo(() => (person ? computeProfile(person, i18n.e) : null), [person, i18n]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.appTitle;
  }, [lang, t]);

  // The phone's Back button returns from the results to the form.
  useEffect(() => {
    const onPop = () => {
      if (window.history.state?.view !== RESULTS_STATE) setPerson(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const toggleLang = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    saveLang(next);
  };

  const showResults = (p: Person) => {
    setPerson(p);
    setYear(currentCycleYear(p.dob, today));
    setSaved(savePerson(p));
    if (window.history.state?.view !== RESULTS_STATE) window.history.pushState({ view: RESULTS_STATE }, '');
    window.scrollTo(0, 0);
  };

  const backToForm = (initial?: Person) => {
    setFormInitial(initial);
    setFormKey((k) => k + 1);
    setPerson(null);
    if (window.history.state?.view === RESULTS_STATE) window.history.replaceState(null, '');
    window.scrollTo(0, 0);
  };

  const closeInfo = useCallback(() => setInfo(null), []);
  const closeGlossary = useCallback(() => setGlossaryOpen(false), []);

  return (
    <I18nProvider value={i18n}>
      <InfoProvider value={setInfo}>
        <header className="app-header">
          <div className="app-header-inner">
            <h1>{t.appTitle}</h1>
            <div className="header-actions">
              <button type="button" className="btn btn-light btn-lang" lang={lang === 'en' ? 'hi' : 'en'} aria-label={t.langButtonLabel} onClick={toggleLang}>
                {t.langButton}
              </button>
              <button type="button" className="btn btn-light" onClick={() => setGlossaryOpen(true)}>
                {t.allFormulas}
              </button>
            </div>
          </div>
        </header>

        <main className="app-main">
          {profile ? (
            <Results
              profile={profile}
              today={today}
              year={year}
              onYearChange={setYear}
              onNew={() => backToForm()}
              onEdit={() => backToForm(profile.person)}
            />
          ) : (
            <PersonForm
              key={formKey}
              initial={formInitial}
              today={today}
              saved={saved}
              onSubmit={showResults}
              onOpenSaved={showResults}
              onDeleteSaved={(id) => setSaved(removePerson(id))}
            />
          )}
        </main>

        {info && <InfoModal request={info} onClose={closeInfo} />}
        {glossaryOpen && (
          <Modal title={t.glossaryTitle} onClose={closeGlossary}>
            <p className="rule-note">{t.reductionRule}</p>
            {(Object.keys(g) as GlossaryKey[]).map((key) => (
              <details key={key} className="glossary-item">
                <summary>{g[key].title}</summary>
                <GlossaryBody term={key} />
              </details>
            ))}
          </Modal>
        )}
      </InfoProvider>
    </I18nProvider>
  );
}

const NAV_IDS = [
  ['main', 'main'],
  ['year', 'year'],
  ['name-numbers', 'name'],
  ['lo-shu', 'loShu'],
  ['karmic', 'karmic'],
  ['periods', 'periods'],
  ['mahadasha', 'mahadasha'],
  ['event', 'event'],
] as const;

interface ResultsProps {
  profile: Profile;
  today: SimpleDate;
  year: number;
  onYearChange: (y: number) => void;
  onNew: () => void;
  onEdit: () => void;
}

function Results({ profile, today, year, onYearChange, onNew, onEdit }: ResultsProps) {
  const i18n = useI18n();
  const { t, date } = i18n;
  const { person } = profile;
  const ageToday = ageOn(person.dob, today);
  const currentYear = currentCycleYear(person.dob, today);

  const share = async () => {
    const text = shareText(profile, computeYear(profile, year), i18n);
    if (navigator.share) {
      try {
        await navigator.share({ title: person.name, text });
      } catch {
        // Cancelled by the user.
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    }
  };

  return (
    <div className="results">
      <section className="card summary" aria-label={t.personRegion}>
        <div className="summary-text">
          <h2 data-testid="person-name">{person.name}</h2>
          <p>{t.born(date(person.dob), person.gender === 'male' ? t.male : t.female, ageToday)}</p>
        </div>
        <div className="summary-actions no-print">
          <button type="button" className="btn" onClick={onNew}>
            {t.newPerson}
          </button>
          <button type="button" className="btn" onClick={onEdit}>
            {t.editDetails}
          </button>
          <button type="button" className="btn" onClick={share}>
            {t.share}
          </button>
          <button type="button" className="btn" onClick={() => window.print()}>
            {t.print}
          </button>
        </div>
      </section>

      <nav className="section-nav no-print" aria-label={t.jumpTo}>
        {NAV_IDS.map(([id, key]) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              // Scroll without changing the URL hash: a hash change would add a history entry
              // and the phone's Back button would then behave unexpectedly.
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {t.nav[key]}
          </a>
        ))}
      </nav>

      <div className="sections">
        <MainNumbers profile={profile} />
        <YearSection profile={profile} year={year} currentYear={currentYear} onYearChange={onYearChange} />
        {/*
          Two independent columns on wide screens so a short card never leaves a gap beside a tall one.
          On phones the columns dissolve (display: contents) and CSS `order` restores the reading order.
        */}
        <div className="cols">
          <div className="col">
            <NameSection profile={profile} />
            <KarmicMasterSection profile={profile} />
            <MahadashaSection profile={profile} ageToday={ageToday} />
          </div>
          <div className="col">
            <LoShuSection profile={profile} />
            <PeriodsSection profile={profile} ageToday={ageToday} />
            <AntardashaSection />
            <EventSection profile={profile} today={today} />
          </div>
        </div>
      </div>
    </div>
  );
}
