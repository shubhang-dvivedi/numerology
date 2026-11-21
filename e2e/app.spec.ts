import { expect, test, type Page } from '@playwright/test';

const SHOTS = process.env.SCREENSHOT_DIR;

async function openApp(page: Page) {
  await page.clock.setFixedTime(new Date('2026-11-21T10:00:00'));
  await page.goto('/');
}

async function enterRam(page: Page) {
  await page.getByLabel('Full name').fill('Ram Kumar');
  const dob = page.getByRole('group', { name: 'Date of birth' });
  await dob.getByLabel('Day').selectOption('29');
  await dob.getByLabel('Month').selectOption('8');
  await dob.getByLabel('Year').selectOption('1985');
  await page.getByText('Male', { exact: true }).click();
  await page.getByRole('button', { name: 'Calculate' }).click();
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

test('full flow: enter details, read numbers, open a formula popup', async ({ page }, info) => {
  await openApp(page);
  await expectNoHorizontalScroll(page);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${info.project.name}-1-form.png`, fullPage: true });

  await enterRam(page);
  await expect(page.getByTestId('person-name')).toHaveText('Ram Kumar');
  const main = page.getByRole('region', { name: 'Main numbers' });
  await expect(main.getByRole('button', { name: /^Moolank \(Birth number\): 2\./ })).toBeVisible();
  await expect(main.getByRole('button', { name: /^Bhagyank \(Chaldean\): 4\./ })).toBeVisible();
  await expect(main.getByRole('button', { name: /^Bhagyank \(Pythagorean\): 6\./ })).toBeVisible();
  await expect(main.getByRole('button', { name: /^Yogyatank \(Talent number\): 6\./ })).toBeVisible();
  await expect(main.getByRole('button', { name: /^Kua: 6\./ })).toBeVisible();
  await expectNoHorizontalScroll(page);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${info.project.name}-2-results.png`, fullPage: true });

  await main.getByRole('button', { name: /^Yogyatank/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Yogyatank' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('11 + 8 + 5 = 24 → 2 + 4 = 6');
  // The popup must fit on screen and its Close button must be reachable.
  const box = (await dialog.boundingBox())!;
  const vp = page.viewportSize()!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height + 1);
  expect(box.width).toBeLessThanOrEqual(vp.width);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${info.project.name}-3-popup.png` });
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).toBeHidden();
});

test('buttons are large enough to tap', async ({ page }) => {
  await openApp(page);
  const calc = await page.getByRole('button', { name: 'Calculate' }).boundingBox();
  expect(calc!.height).toBeGreaterThanOrEqual(48);
  await enterRam(page);
  for (const name of ['← New person', 'Edit details', 'Share', 'Print / PDF', 'Next year', 'Previous year']) {
    const b = await page.getByRole('button', { name, exact: true }).boundingBox();
    expect(b!.height, name).toBeGreaterThanOrEqual(44);
  }
});

test('year view steps through years', async ({ page }) => {
  await openApp(page);
  await enterRam(page);
  const year = page.getByRole('region', { name: 'Year view' });
  await expect(year.getByTestId('year-range')).toHaveText('29 Aug 2026 to 28 Aug 2027');
  await expect(year.getByRole('button', { name: /^Personal year: 2\./ })).toBeVisible();
  await year.getByRole('button', { name: 'Next year' }).click();
  await year.getByRole('button', { name: 'Next year' }).click();
  await year.getByRole('button', { name: 'Next year' }).click();
  await expect(year.getByLabel('Year', { exact: true })).toHaveValue('2029');
  await expect(year.getByRole('button', { name: /^Mahadasha: Sun \(Surya\)\./ })).toBeVisible();
  await year.getByRole('button', { name: 'Back to this year' }).click();
  await expect(year.getByLabel('Year', { exact: true })).toHaveValue('2026');
});

test('section links jump to sections', async ({ page }) => {
  await openApp(page);
  await enterRam(page);
  await page.getByRole('navigation', { name: 'Jump to section' }).getByRole('link', { name: 'Mahadasha' }).click();
  await expect(page.getByRole('heading', { name: 'Mahadasha', exact: true })).toBeInViewport();
  // Still on the results page, and Back still goes to the form in one step.
  await expect(page.getByTestId('person-name')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Calculate' })).toBeVisible();
});

test('saved people survive a page reload', async ({ page }) => {
  await openApp(page);
  await enterRam(page);
  await page.reload();
  const saved = page.getByRole('region', { name: 'Saved people' });
  await expect(saved).toContainText('Ram Kumar');
  await saved.getByRole('button', { name: /^Ram Kumar/ }).click();
  await expect(page.getByTestId('person-name')).toHaveText('Ram Kumar');
});

test('phone back button returns to the form', async ({ page }) => {
  await openApp(page);
  await enterRam(page);
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Calculate' })).toBeVisible();
});

test('print view hides buttons', async ({ page }) => {
  await openApp(page);
  await enterRam(page);
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('button', { name: 'Share' })).toBeHidden();
  await expect(page.getByRole('region', { name: 'Main numbers' })).toBeVisible();
});

test('installable: manifest and icons are served', async ({ page, request }) => {
  await openApp(page);
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const manifest = await (await request.get(href!)).json();
  expect(manifest.name).toBe('Numerology Calculator');
  for (const icon of manifest.icons) {
    expect((await request.get(icon.src)).status(), icon.src).toBe(200);
  }
  expect((await request.get('apple-touch-icon.png')).status()).toBe(200);
});

test('works offline after the first visit', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Service-worker offline mode is only simulated reliably in Chromium');
  await openApp(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload(); // let the service worker take control
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Calculate' })).toBeVisible();
  await enterRam(page);
  await expect(page.getByTestId('person-name')).toHaveText('Ram Kumar');
  await context.setOffline(false);
});

test('laptop layout has no empty gaps between cards', async ({ page }, info) => {
  test.skip(info.project.name !== 'laptop-chrome', 'Two-column layout only on wide screens');
  await openApp(page);
  await enterRam(page);
  const gaps = await page.evaluate(() =>
    [...document.querySelectorAll('.col')].flatMap((col) => {
      const cards = [...col.children].map((c) => c.getBoundingClientRect());
      return cards.slice(1).map((r, i) => Math.round(r.top - cards[i].bottom));
    }),
  );
  expect(gaps.length).toBeGreaterThan(3);
  for (const g of gaps) expect(g).toBe(16);
});

test('20-year table scrolls inside its own box', async ({ page }) => {
  await openApp(page);
  await enterRam(page);
  const table = page.getByRole('table', { name: 'Next 20 years' });
  await expect(table.getByRole('row')).toHaveCount(21);
  const box = page.locator('.table-years');
  const { scrollH, clientH } = await box.evaluate((el) => ({ scrollH: el.scrollHeight, clientH: el.clientHeight }));
  expect(scrollH).toBeGreaterThan(clientH);
});

test('print has no scroll boxes and includes all 20 years', async ({ page, browserName }, info) => {
  // Printing lays the page out at paper width, so check at laptop width (phone screens are narrower than A4).
  test.skip(info.project.name !== 'laptop-chrome', 'Print layout uses paper width, checked on the laptop project');
  await page.setViewportSize({ width: 794, height: 1123 }); // A4 at 96 dpi
  await openApp(page);
  await enterRam(page);
  await page.emulateMedia({ media: 'print' });
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('.table-scroll')]
      .filter((el) => el.offsetParent !== null)
      .filter((el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)
      .map((el) => el.className),
  );
  expect(clipped).toEqual([]);
  await expect(page.getByRole('table', { name: 'Next 20 years' }).getByRole('row')).toHaveCount(21);
  // Both Lo Shu grids are printed.
  await expect(page.locator('.loshu-block')).toHaveCount(2);
  for (const block of await page.locator('.loshu-block').all()) await expect(block).toBeVisible();
  if (SHOTS && browserName === 'chromium' && info.project.name === 'laptop-chrome') {
    await page.pdf({ path: `${SHOTS}/print.pdf`, format: 'A4', printBackground: true });
  }
});

test('Hindi button translates the site and is remembered', async ({ page }, info) => {
  await openApp(page);
  await page.getByRole('button', { name: /Switch to Hindi/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('अंक ज्योतिष कैलकुलेटर');
  await page.reload();
  await expect(page.getByRole('button', { name: 'गणना करें' })).toBeVisible();
  await page.getByLabel('पूरा नाम').fill('Ram Kumar');
  const dob = page.getByRole('group', { name: 'जन्म तिथि' });
  await dob.getByLabel('दिन').selectOption('29');
  await dob.getByLabel('महीना').selectOption('8');
  await dob.getByLabel('वर्ष').selectOption('1985');
  await page.getByText('पुरुष', { exact: true }).click();
  await page.getByRole('button', { name: 'गणना करें' }).click();
  await expect(page.getByRole('region', { name: 'मुख्य अंक' }).getByRole('button', { name: /^मूलांक \(जन्म अंक\): 2\./ })).toBeVisible();
  await expectNoHorizontalScroll(page);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${info.project.name}-4-hindi.png`, fullPage: true });
  await page.getByRole('region', { name: 'मुख्य अंक' }).getByRole('button', { name: /^योग्यतांक/ }).click();
  await expect(page.getByRole('dialog', { name: 'योग्यतांक' })).toContainText('जन्म वर्ष: 1985 → 1 + 9 + 8 + 5 = 23 → 2 + 3 = 5');
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${info.project.name}-5-hindi-popup.png` });
});
