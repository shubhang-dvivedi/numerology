import type { Profile, YearView } from './engine/numbers';
import type { I18n } from './i18n';

/** Plain-text summary suitable for WhatsApp, in the current language. */
export function shareText(p: Profile, y: YearView, { t, date }: I18n): string {
  const c = p.names.chaldean;
  const py = p.names.pythagorean;
  const both = (a: number, b: number) => `${a} (Chaldean) / ${b} (Pythagorean)`;
  const lines = [
    `*${p.person.name}*`,
    `${t.shareDob}: ${date(p.person.dob)} · ${p.person.gender === 'male' ? t.male : t.female}`,
    '',
    `${t.moolank}: ${p.moolank.value}`,
    `${t.bhagyank}: ${both(c.bhagyank.value, py.bhagyank.value)}`,
    `${t.yogyatank}: ${p.yogyatank.value}`,
    `${t.kua}: ${p.kua.value}`,
    `${t.namank}: ${both(c.namank.value, py.namank.value)}`,
    `${t.heart}: ${both(c.heart.value, py.heart.value)}`,
    `${t.personality}: ${both(c.personality.value, py.personality.value)}`,
    `${t.maturity}: ${both(c.maturity.value, py.maturity.value)}`,
    `${t.shareLoShuMissing('Chaldean')}: ${p.loShu.chaldean.missing.join(', ') || t.none}`,
    `${t.shareLoShuMissing('Pythagorean')}: ${p.loShu.pythagorean.missing.join(', ') || t.none}`,
  ];
  if (p.karmic.length) lines.push(`${t.shareKarmic}: ${p.karmic.map((k) => `${k.label} ${k.numbers.join(', ')}`).join('; ')}`);
  if (p.masters.length) lines.push(`${t.shareMaster}: ${p.masters.map((m) => `${m.label} ${m.value}`).join('; ')}`);
  lines.push(
    '',
    `*${t.shareYear(y.year)}* (${t.yearRange(date(y.from), date(y.to))})`,
    `${t.age}: ${y.age}`,
    `${t.personalYear}: ${y.personalYear.value}`,
    `${t.currentYear}: ${y.universalYear.value}`,
    `${t.mahadasha}: ${y.mahadasha.number} ${y.mahadasha.planet} (${y.mahadasha.startYear}–${y.mahadasha.endYear})`,
    `${t.pinnacle}: ${y.period.pinnacle.value} · ${t.challenge}: ${y.period.challenge.value} (${t.periodSub(y.period.index)})`,
  );
  return lines.join('\n');
}
