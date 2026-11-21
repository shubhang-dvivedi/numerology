import { createContext, useContext } from 'react';
import { EN, type EngineText } from '../engine/text';
import { GLOSSARY, type GlossaryEntry, type GlossaryKey } from '../content/glossary';
import { GLOSSARY_HI } from '../content/glossary-hi';
import { ENGINE_HI } from './engine-hi';
import { UI, type UiText } from './ui';

export type Lang = 'en' | 'hi';

export interface I18n {
  lang: Lang;
  /** Screen wording. */
  t: UiText;
  /** Wording used inside the calculation working. */
  e: EngineText;
  /** Popup explanations. */
  g: Record<GlossaryKey, GlossaryEntry>;
  /** Format a date as "29 Aug 1985" / "29 अगस्त 1985". */
  date: (d: { day: number; month: number; year: number }) => string;
}

export function i18nFor(lang: Lang): I18n {
  const e = lang === 'hi' ? ENGINE_HI : EN;
  return {
    lang,
    t: UI[lang],
    e,
    g: lang === 'hi' ? GLOSSARY_HI : GLOSSARY,
    date: (d) => `${d.day} ${e.monthsShort[d.month - 1]} ${d.year}`,
  };
}

const I18nContext = createContext<I18n>(i18nFor('en'));
export const I18nProvider = I18nContext.Provider;
export const useI18n = () => useContext(I18nContext);

const LANG_KEY = 'numerology.lang';

export function loadLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'hi' ? 'hi' : 'en';
  } catch {
    return 'en';
  }
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Not saved; the app still works.
  }
}
