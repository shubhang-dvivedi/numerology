# Numerology Calculator

A website that works offline and can be installed on a phone. It calculates Moolank, Bhagyank, Yogyatank, Kua,
the name numbers (Chaldean and Pythagorean), the Lo Shu grid, birth force periods with pinnacles and challenges,
Mahadasha, Personal year, Current (universal) year and Event number. Every number opens a popup with
the rule and the working for that person.

There is no server: all calculations run in the browser. Saved people stay on the device (browser storage).

## Run locally

Use Node 20+ (`nvm use 20`).

```bash
npm install
npm run dev          # http://localhost:5173
```

## Tests

```bash
npm test             # calculation engine + UI tests (Vitest)
npx playwright install chromium webkit   # first time only
npm run build && npm run test:e2e        # browser tests: laptop Chrome, Android phone, iPhone Safari
npm run test:all     # everything
```

## Where things are

| Path | What |
|---|---|
| `src/engine/` | All formulas (pure TypeScript, no UI). `numbers.ts` is the main file. |
| `src/engine/engine.test.ts` | Hand-checked examples for every formula |
| `src/content/glossary.ts` | Text shown in the ⓘ popups |
| `src/components/` | Screens and sections |
| `e2e/` | Playwright browser tests |

To change a formula, edit `src/engine/numbers.ts`. Then update the matching example in
`engine.test.ts` and the popup text in `glossary.ts`.

## Live site and deploying

Live at **https://shubhang-dvivedi.github.io/numerology/** (GitHub Pages).

Every push to `main` runs `.github/workflows/deploy.yml`. It runs the unit/UI tests, builds, runs the
browser tests, and deploys only if they all pass. Watch it with `gh run watch`.

The app updates itself on phones the next time it is opened online. On the phone, open the link and
choose **Add to Home Screen** (Safari: Share → Add to Home Screen; Chrome: ⋮ → Add to Home screen).

## Language

The **हिंदी / English** button in the header switches all text, including popups and working.
The choice is remembered. Screen text is in `src/i18n/ui.ts`, working-step text is in
`src/engine/text.ts` (English) and `src/i18n/engine-hi.ts` (Hindi), and popup text is in
`src/content/glossary.ts` and `glossary-hi.ts`.
