import type { Person } from './engine/numbers';

/** People saved on this device only (browser localStorage). Nothing is sent anywhere. */
export interface SavedPerson extends Person {
  id: string;
  savedAt: number;
}

const KEY = 'numerology.people.v1';
const MAX = 200;

export const personId = (p: Person): string =>
  [p.name.trim().toLowerCase().replace(/\s+/g, ' '), p.dob.day, p.dob.month, p.dob.year, p.gender].join('|');

export function loadPeople(): SavedPerson[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as SavedPerson[]) : [];
    return Array.isArray(list) ? list.sort((a, b) => b.savedAt - a.savedAt) : [];
  } catch {
    return [];
  }
}

function write(list: SavedPerson[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // Storage full or blocked (e.g. private browsing). The app still works without saving.
  }
}

/** Save (or move to the top if already saved). Returns the new list, newest first. */
export function savePerson(person: Person, now = Date.now()): SavedPerson[] {
  const id = personId(person);
  const list = [{ ...person, name: person.name.trim(), id, savedAt: now }, ...loadPeople().filter((p) => p.id !== id)];
  write(list);
  return list;
}

export function removePerson(id: string): SavedPerson[] {
  const list = loadPeople().filter((p) => p.id !== id);
  write(list);
  return list;
}
