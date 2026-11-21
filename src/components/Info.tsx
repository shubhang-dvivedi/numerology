import { createContext, useContext, useEffect, useId, useRef, type ReactNode } from 'react';
import type { GlossaryKey } from '../content/glossary';
import { isMaster, type Calc } from '../engine/reduce';
import { useI18n } from '../i18n';

export interface InfoRequest {
  term: GlossaryKey;
  /** Optional working for this person. */
  calc?: Calc;
  /** Optional heading for the working, e.g. "Chaldean". */
  context?: string;
  /** Person's name, shown above the working. */
  name?: string;
}

const InfoContext = createContext<(r: InfoRequest) => void>(() => {});
export const InfoProvider = InfoContext.Provider;
export const useInfo = () => useContext(InfoContext);

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const { t } = useI18n();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button ref={closeRef} type="button" className="icon-btn" aria-label={t.closePopup} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Badges({ calc, value }: { calc?: Calc; value?: number }) {
  const { t } = useI18n();
  const v = value ?? calc?.value;
  const karmic = calc?.karmic ?? [];
  if (!(v !== undefined && isMaster(v)) && karmic.length === 0) return null;
  return (
    <span className="badges">
      {v !== undefined && isMaster(v) && <span className="badge badge-master">{t.master}</span>}
      {karmic.map((k) => (
        <span key={k} className="badge badge-karmic">
          {t.karmicBadge(k)}
        </span>
      ))}
    </span>
  );
}

export function GlossaryBody({ term }: { term: GlossaryKey }) {
  const { t, g } = useI18n();
  const entry = g[term];
  return (
    <>
      {entry.aka && <p className="aka">{entry.aka}</p>}
      <p>{entry.meaning}</p>
      {entry.formula.length > 0 && (
        <>
          <h3>{t.howCalculated}</h3>
          <ul className="formula">
            {entry.formula.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export function InfoModal({ request, onClose }: { request: InfoRequest; onClose: () => void }) {
  const { t, g } = useI18n();
  const entry = g[request.term];
  const { calc } = request;
  return (
    <Modal title={entry.title} onClose={onClose}>
      <GlossaryBody term={request.term} />
      {calc && (
        <div className="working">
          <h3>
            {request.name ? t.workingFor(request.name) : t.howCalculated}
            {request.context ? ` · ${request.context}` : ''}
          </h3>
          <ol className="steps">
            {calc.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <p className="working-result">
            {t.result} <strong>{calc.value}</strong> <Badges calc={calc} />
          </p>
        </div>
      )}
      {entry.formula.length > 0 && <p className="rule-note">{t.reductionRule}</p>}
    </Modal>
  );
}

/** Small round ⓘ button that opens the explanation for a term. */
export function InfoButton({ term, label }: { term: GlossaryKey; label?: string }) {
  const openInfo = useInfo();
  const { t, g } = useI18n();
  return (
    <button type="button" className="info-btn" aria-label={t.whatIs(label ?? g[term].title)} onClick={() => openInfo({ term })}>
      i
    </button>
  );
}

export function SectionTitle({ id, title, term }: { id?: string; title: string; term?: GlossaryKey }) {
  return (
    <div className="section-title">
      <h2 id={id}>{title}</h2>
      {term && <InfoButton term={term} label={title} />}
    </div>
  );
}
