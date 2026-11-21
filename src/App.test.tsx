import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const TODAY = { day: 21, month: 11, year: 2026 };

type Details = { name: string; day: string; month: string; year: string; gender: 'Male' | 'Female' };
const RAM: Details = { name: 'Ram Kumar', day: '29', month: '8', year: '1985', gender: 'Male' };

function setup() {
  const user = userEvent.setup();
  render(<App today={TODAY} />);
  return user;
}

async function fillAndCalculate(user: ReturnType<typeof userEvent.setup>, d: Details = RAM) {
  const name = screen.getByLabelText('Full name');
  await user.clear(name);
  await user.type(name, d.name);
  const dob = screen.getByRole('group', { name: 'Date of birth' });
  await user.selectOptions(within(dob).getByLabelText('Day'), d.day);
  await user.selectOptions(within(dob).getByLabelText('Month'), d.month);
  await user.selectOptions(within(dob).getByLabelText('Year'), d.year);
  await user.click(screen.getByLabelText(d.gender));
  await user.click(screen.getByRole('button', { name: 'Calculate' }));
}

const tile = (name: RegExp) => screen.getByRole('button', { name });

describe('entering details', () => {
  it('shows clear errors when nothing is filled in', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'Calculate' }));
    const alerts = screen.getAllByRole('alert').map((a) => a.textContent);
    expect(alerts).toEqual([
      'Please enter the name.',
      'Please choose the day, month and year of birth.',
      'Please choose Male or Female.',
    ]);
    expect(screen.queryByTestId('person-name')).not.toBeInTheDocument();
  });

  it('rejects a date that does not exist', async () => {
    const user = setup();
    await fillAndCalculate(user, { ...RAM, day: '31', month: '2' });
    expect(screen.getByRole('alert')).toHaveTextContent('This date does not exist');
  });

  it('rejects names not typed in English letters', async () => {
    const user = setup();
    await fillAndCalculate(user, { ...RAM, name: 'राम' });
    expect(screen.getByRole('alert')).toHaveTextContent('English letters');
  });
});

describe('results', () => {
  it('shows the main numbers', async () => {
    const user = setup();
    await fillAndCalculate(user);
    expect(screen.getByTestId('person-name')).toHaveTextContent('Ram Kumar');
    expect(screen.getByText(/Born 29 Aug 1985 · Male · Age 41/)).toBeInTheDocument();
    const main = within(screen.getByRole('region', { name: 'Main numbers' }));
    expect(main.getByRole('button', { name: /^Moolank \(Birth number\): 2\./ })).toBeInTheDocument();
    expect(main.getByRole('button', { name: /^Bhagyank \(Chaldean\): 4\./ })).toBeInTheDocument();
    expect(main.getByRole('button', { name: /^Bhagyank \(Pythagorean\): 6\./ })).toBeInTheDocument();
    expect(main.getByRole('button', { name: /^Yogyatank \(Talent number\): 6\./ })).toBeInTheDocument();
    expect(main.getByRole('button', { name: /^Kua: 6\./ })).toBeInTheDocument();
  });

  it('uses the female Kua formula', async () => {
    const user = setup();
    await fillAndCalculate(user, { ...RAM, gender: 'Female' });
    expect(tile(/^Kua: 9\./)).toBeInTheDocument();
  });

  it('opens a popup with the rule and the working, and closes it', async () => {
    const user = setup();
    await fillAndCalculate(user);
    await user.click(tile(/^Moolank \(Birth number\)/));
    const dialog = screen.getByRole('dialog', { name: 'Moolank' });
    expect(within(dialog).getByText('Birth number · Root number')).toBeInTheDocument();
    expect(within(dialog).getByText('Day of birth, reduced to 1–9.')).toBeInTheDocument();
    expect(within(dialog).getByText('Working for Ram Kumar')).toBeInTheDocument();
    expect(within(dialog).getByText('Day of birth: 29 → 2 + 9 = 11 → 1 + 1 = 2')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(tile(/^Kua:/));
    expect(screen.getByRole('dialog', { name: 'Kua number' })).toHaveTextContent('Male: 11 − 5 = 6');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('every ⓘ button opens an explanation', async () => {
    const user = setup();
    await fillAndCalculate(user);
    const infoButtons = screen.getAllByRole('button', { name: /^What is / });
    expect(infoButtons.length).toBeGreaterThan(15);
    for (const btn of infoButtons) {
      await user.click(btn);
      const dialog = screen.getByRole('dialog');
      expect(dialog.textContent!.length).toBeGreaterThan(20);
      await user.click(within(dialog).getByRole('button', { name: 'Close' }));
    }
  });

  it('shows name numbers in both systems with master and karmic badges', async () => {
    const user = setup();
    await fillAndCalculate(user);
    const namankP = tile(/^Namank \(Pythagorean\): 33\./);
    expect(within(namankP).getByText('Master')).toBeInTheDocument();
    expect(tile(/^Namank \(Chaldean\): 22\./)).toBeInTheDocument();
    const persC = tile(/^Personality \(Chaldean\): 5\./);
    expect(within(persC).getByText('Karmic 14')).toBeInTheDocument();
    expect(tile(/^Heart number \(Chaldean\): 8\./)).toBeInTheDocument();
    expect(tile(/^Maturity \(Pythagorean\): 3\./)).toBeInTheDocument();

    await user.click(persC);
    expect(screen.getByRole('dialog')).toHaveTextContent('RAM: R(2) + M(4) = 6');
  });

  it('lists karmic and master numbers', async () => {
    const user = setup();
    await fillAndCalculate(user);
    const section = screen.getByRole('region', { name: 'Karmic & master numbers' });
    expect(section).toHaveTextContent('Personality (Chaldean): 14');
    expect(section).toHaveTextContent('Namank (Chaldean): 22');
    expect(section).toHaveTextContent('Namank (Pythagorean): 33');
  });

  it('switches the Lo Shu grid between Chaldean and Pythagorean Bhagyank', async () => {
    const user = setup();
    await fillAndCalculate(user);
    expect(screen.getByTestId('loshu-missing')).toHaveTextContent('3, 7');
    expect(screen.getByRole('cell', { name: '9: 2 times' })).toHaveTextContent('99');
    await user.click(screen.getByRole('button', { name: 'Pythagorean' }));
    expect(screen.getByTestId('loshu-missing')).toHaveTextContent('3, 4, 7');
    expect(screen.getByRole('cell', { name: '4: missing' })).toBeInTheDocument();
  });

  it('shows birth force periods with pinnacles and challenges', async () => {
    const user = setup();
    await fillAndCalculate(user);
    const section = screen.getByRole('region', { name: 'Birth force periods' });
    const rows = within(section).getAllByRole('row').slice(1);
    expect(rows.map((r) => r.textContent)).toEqual([
      '10–301985–201516',
      '230–392015–202473',
      '3Now39–482024–203383',
      '448+2033 onward43',
    ]);
  });

  it('shows the Mahadasha timeline with the current one marked', async () => {
    const user = setup();
    await fillAndCalculate(user);
    const section = screen.getByRole('region', { name: 'Mahadasha' });
    const now = within(section).getByText('Now').closest('tr')!;
    expect(now).toHaveTextContent('9Mars (Mangal)Now35–442020–2029');
  });

  it('keeps Antardasha blank', async () => {
    const user = setup();
    await fillAndCalculate(user);
    expect(screen.getByRole('region', { name: 'Antardasha' })).toHaveTextContent('blank for now');
  });
});

describe('year view', () => {
  it('starts on the current birthday year and steps through years', async () => {
    const user = setup();
    await fillAndCalculate(user);
    const section = screen.getByRole('region', { name: 'Year view' });
    const yearSelect = within(section).getByLabelText('Year') as HTMLSelectElement;
    expect(yearSelect.value).toBe('2026');
    expect(within(section).getByTestId('year-range')).toHaveTextContent('29 Aug 2026 to 28 Aug 2027');
    expect(within(section).getByRole('button', { name: /^Personal year: 2\./ })).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: /^Current year \(Year 2026\): 1\./ })).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: /^Age: 41\./ })).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: /^Mahadasha: Mars \(Mangal\)\./ })).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: /^Pinnacle \(Period 3\): 8\./ })).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: /^Challenge \(Period 3\): 3\./ })).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: /^Birth force period: Age 39–48\./ })).toBeInTheDocument();
    expect(within(section).getByLabelText('Antardasha: not added yet')).toBeInTheDocument();

    await user.click(within(section).getByRole('button', { name: 'Next year' }));
    expect(yearSelect.value).toBe('2027');
    expect(within(section).getByRole('button', { name: /^Personal year: 3\./ })).toBeInTheDocument();

    await user.selectOptions(yearSelect, '2029');
    expect(within(section).getByRole('button', { name: /^Mahadasha: Sun \(Surya\)\./ })).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: /^Age: 44\./ })).toBeInTheDocument();

    await user.click(within(section).getByRole('button', { name: 'Back to this year' }));
    expect(yearSelect.value).toBe('2026');
  });

  it('lists the next 20 years and opens a year from the table', async () => {
    const user = setup();
    await fillAndCalculate(user);
    const table = screen.getByRole('table', { name: 'Next 20 years' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(20);
    expect(rows[0]).toHaveTextContent(/^2026412/);
    expect(rows[19]).toHaveTextContent(/^204560/);
    await user.click(within(table).getByRole('button', { name: 'Open year 2030' }));
    expect((screen.getAllByLabelText('Year').find((el) => el.classList.contains('year-select')) as HTMLSelectElement).value).toBe('2030');
  });

  it('does not go before the birth year', async () => {
    const user = setup();
    await fillAndCalculate(user);
    const section = screen.getByRole('region', { name: 'Year view' });
    await user.selectOptions(within(section).getByLabelText('Year'), '1985');
    expect(within(section).getByRole('button', { name: 'Previous year' })).toBeDisabled();
  });
});

describe('event number', () => {
  it('calculates for any date and shows the person on that date', async () => {
    const user = setup();
    await fillAndCalculate(user);
    const section = screen.getByRole('region', { name: 'Event number' });
    // Defaults to today: 21 + 11 + 2026 → 3 + 11 + 1 = 15 → 6
    expect(within(section).getByRole('button', { name: /^Event number: 6\./ })).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: /^Personal year then: 2\./ })).toBeInTheDocument();

    const date = within(section).getByRole('group', { name: 'Event date' });
    await user.selectOptions(within(date).getByLabelText('Day'), '15');
    await user.selectOptions(within(date).getByLabelText('Month'), '8');
    await user.selectOptions(within(date).getByLabelText('Year'), '1947');
    expect(within(section).getByRole('button', { name: /^Event number: 8\./ })).toBeInTheDocument();
    expect(within(section).queryByRole('button', { name: /Personal year then/ })).not.toBeInTheDocument();

    await user.selectOptions(within(date).getByLabelText('Day'), '31');
    await user.selectOptions(within(date).getByLabelText('Month'), '2');
    expect(within(section).getByRole('alert')).toHaveTextContent('does not exist');
  });
});

describe('saved people', () => {
  it('saves after calculating, reopens, and can be removed', async () => {
    const user = setup();
    await fillAndCalculate(user);
    await user.click(screen.getByRole('button', { name: '← New person' }));

    const saved = screen.getByRole('region', { name: 'Saved people' });
    expect(saved).toHaveTextContent('Ram Kumar');
    expect(saved).toHaveTextContent('29 Aug 1985 · Male');
    expect((screen.getByLabelText('Full name') as HTMLInputElement).value).toBe('');

    await user.click(within(saved).getByRole('button', { name: /^Ram Kumar/ }));
    expect(screen.getByTestId('person-name')).toHaveTextContent('Ram Kumar');

    await user.click(screen.getByRole('button', { name: '← New person' }));
    await user.click(screen.getByRole('button', { name: 'Remove Ram Kumar' }));
    await user.click(screen.getByRole('button', { name: 'No' }));
    await user.click(screen.getByRole('button', { name: 'Remove Ram Kumar' }));
    await user.click(screen.getByRole('button', { name: 'Yes, remove' }));
    expect(screen.queryByRole('region', { name: 'Saved people' })).not.toBeInTheDocument();
  });

  it('keeps saved people after a reload and does not duplicate them', async () => {
    const user = setup();
    await fillAndCalculate(user);
    await user.click(screen.getByRole('button', { name: '← New person' }));
    await fillAndCalculate(user);
    await user.click(screen.getByRole('button', { name: '← New person' }));
    expect(within(screen.getByRole('region', { name: 'Saved people' })).getAllByRole('listitem')).toHaveLength(1);
  });

  it('searches when there are many people', async () => {
    const people = Array.from({ length: 7 }, (_, i) => ({
      id: `p${i}`, name: `Person ${i}`, dob: { day: 1, month: 1, year: 1990 }, gender: 'female', savedAt: i,
    }));
    localStorage.setItem('numerology.people.v1', JSON.stringify(people));
    const user = setup();
    await user.type(screen.getByLabelText('Search saved people'), 'Person 3');
    expect(within(screen.getByRole('region', { name: 'Saved people' })).getAllByRole('listitem')).toHaveLength(1);
  });

  it('survives corrupted storage', () => {
    localStorage.setItem('numerology.people.v1', '{not json');
    setup();
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeInTheDocument();
  });
});

describe('navigation and sharing', () => {
  it('edit details pre-fills the form', async () => {
    const user = setup();
    await fillAndCalculate(user);
    await user.click(screen.getByRole('button', { name: 'Edit details' }));
    expect((screen.getByLabelText('Full name') as HTMLInputElement).value).toBe('Ram Kumar');
    expect(screen.getByLabelText('Male')).toBeChecked();
    const dob = screen.getByRole('group', { name: 'Date of birth' });
    expect((within(dob).getByLabelText('Day') as HTMLSelectElement).value).toBe('29');
  });

  it('section links scroll without changing the address or leaving the results', async () => {
    const spy = vi.spyOn(Element.prototype, 'scrollIntoView');
    const user = setup();
    await fillAndCalculate(user);
    await user.click(screen.getByRole('link', { name: 'Mahadasha' }));
    expect(spy).toHaveBeenCalled();
    expect(window.location.hash).toBe('');
    expect(screen.getByTestId('person-name')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('the Back button returns to the form', async () => {
    const user = setup();
    await fillAndCalculate(user);
    window.history.replaceState(null, '');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(await screen.findByRole('button', { name: 'Calculate' })).toBeInTheDocument();
  });

  it('shares a text summary', async () => {
    const shareFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: shareFn, configurable: true });
    const user = setup();
    await fillAndCalculate(user);
    await user.click(screen.getByRole('button', { name: 'Share' }));
    expect(shareFn).toHaveBeenCalledTimes(1);
    const { text } = shareFn.mock.calls[0][0];
    expect(text).toContain('Moolank: 2');
    expect(text).toContain('Bhagyank: 4 (Chaldean) / 6 (Pythagorean)');
    expect(text).toContain('Personal year: 2');
    delete (navigator as { share?: unknown }).share;
  });

  it('falls back to WhatsApp when the device cannot share', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const user = setup();
    await fillAndCalculate(user);
    await user.click(screen.getByRole('button', { name: 'Share' }));
    expect(open.mock.calls[0][0]).toMatch(/^https:\/\/wa\.me\/\?text=/);
    open.mockRestore();
  });

  it('shows all formulas from the header', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: 'All formulas' }));
    const dialog = screen.getByRole('dialog', { name: 'All terms and formulas' });
    for (const t of ['Moolank', 'Bhagyank', 'Yogyatank', 'Mahadasha', 'Pinnacle number', 'Event number']) {
      expect(within(dialog).getByText(t, { selector: 'summary' })).toBeInTheDocument();
    }
  });
});

describe('Hindi', () => {
  it('switches the whole site to Hindi with one button and remembers it', async () => {
    const user = setup();
    await user.click(screen.getByRole('button', { name: /Switch to Hindi/ }));
    expect(document.documentElement.lang).toBe('hi');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('अंक ज्योतिष कैलकुलेटर');
    expect(screen.getByLabelText('पूरा नाम')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'गणना करें' })).toBeInTheDocument();
    expect(localStorage.getItem('numerology.lang')).toBe('hi');

    // Errors are in Hindi too.
    await user.click(screen.getByRole('button', { name: 'गणना करें' }));
    expect(screen.getAllByRole('alert').map((a) => a.textContent)).toEqual([
      'कृपया नाम लिखें।',
      'कृपया जन्म का दिन, महीना और वर्ष चुनें।',
      'कृपया पुरुष या महिला चुनें।',
    ]);
  });

  it('shows results, working and popups in Hindi; proper names stay in English', async () => {
    localStorage.setItem('numerology.lang', 'hi');
    const user = userEvent.setup();
    render(<App today={TODAY} />);
    await user.type(screen.getByLabelText('पूरा नाम'), 'Ram Kumar');
    const dob = screen.getByRole('group', { name: 'जन्म तिथि' });
    await user.selectOptions(within(dob).getByLabelText('दिन'), '29');
    await user.selectOptions(within(dob).getByLabelText('महीना'), '8');
    await user.selectOptions(within(dob).getByLabelText('वर्ष'), '1985');
    await user.click(screen.getByLabelText('पुरुष'));
    await user.click(screen.getByRole('button', { name: 'गणना करें' }));

    expect(screen.getByTestId('person-name')).toHaveTextContent('Ram Kumar');
    expect(screen.getByText('जन्म 29 अगस्त 1985 · पुरुष · आयु 41')).toBeInTheDocument();
    const main = within(screen.getByRole('region', { name: 'मुख्य अंक' }));
    expect(main.getByRole('button', { name: /^मूलांक \(जन्म अंक\): 2\./ })).toBeInTheDocument();
    expect(main.getByRole('button', { name: /^भाग्यांक \(Chaldean\): 4\./ })).toBeInTheDocument();

    await user.click(main.getByRole('button', { name: /^मूलांक/ }));
    const dialog = screen.getByRole('dialog', { name: 'मूलांक' });
    expect(dialog).toHaveTextContent('जन्म का दिन: 29 → 2 + 9 = 11 → 1 + 1 = 2');
    expect(dialog).toHaveTextContent('Ram Kumar की गणना');
    await user.click(within(dialog).getByRole('button', { name: 'बंद करें' }));

    const year = screen.getByRole('region', { name: 'वर्ष अनुसार अंक' });
    expect(within(year).getByTestId('year-range')).toHaveTextContent('29 अगस्त 2026 से 28 अगस्त 2027 तक');
    expect(within(year).getByRole('button', { name: /^महादशा: मंगल\./ })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'कार्मिक और मास्टर अंक' })).toHaveTextContent('व्यक्तित्व अंक (Chaldean): 14');
    expect(screen.getByRole('region', { name: 'अंतर्दशा' })).toHaveTextContent('यह सेक्शन अभी खाली है');
  });

  it('switching language keeps the person open and re-labels the working', async () => {
    const user = setup();
    await fillAndCalculate(user);
    await user.click(screen.getByRole('button', { name: /Switch to Hindi/ }));
    expect(screen.getByTestId('person-name')).toHaveTextContent('Ram Kumar');
    await user.click(screen.getByRole('button', { name: /^योग्यतांक/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('जन्म वर्ष: 1985 → 1 + 9 + 8 + 5 = 23 → 2 + 3 = 5');
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: /Switch to English/ }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Numerology Calculator');
  });

  it('every Hindi info button opens a Hindi explanation', async () => {
    const user = setup();
    await fillAndCalculate(user);
    await user.click(screen.getByRole('button', { name: /Switch to Hindi/ }));
    const buttons = screen.getAllByRole('button', { name: / क्या है\?$/ });
    expect(buttons.length).toBeGreaterThan(15);
    for (const btn of buttons) {
      await user.click(btn);
      const dialog = screen.getByRole('dialog');
      expect(dialog.textContent).toMatch(/[\u0900-\u097F]/);
      await user.click(within(dialog).getByRole('button', { name: 'बंद करें' }));
    }
  });
});
