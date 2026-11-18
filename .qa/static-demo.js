const { chromium } = require('playwright-core');
const EXEC = 'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'http://localhost:4173';
const OUT = 'C:/Users/aditi/Documents/Qoder/2026-11-16/445cdf8c/.qa';
const pass = (m) => console.log('PASS', m);
const fail = (m) => { console.log('FAIL', m); process.exitCode = 1; };

(async () => {
  const b = await chromium.launch({ executablePath: EXEC });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  const apiCalls = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('request', (r) => { if (r.url().includes('/api/')) apiCalls.push(r.url()); });

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const title = (await page.locator('.hero__title').innerText()).replace(/\s+/g, ' ').trim();
  if (/right person/i.test(title)) pass(`landing renders: ${title}`);
  else fail(`landing title wrong: ${title}`);
  await page.screenshot({ path: `${OUT}/s01-landing.png` });

  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  if (await page.locator('.rail').isVisible()) pass('app shell renders');
  else fail('app shell missing');
  await page.screenshot({ path: `${OUT}/s02-overview.png` });

  await page.goto(`${BASE}/app/board`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const card = page.locator('.board-card').first();
  const subject = (await card.locator('.board-card__subject').innerText()).trim();
  const colBefore = (await card.locator('xpath=ancestor::section[contains(@class,"board-col")]').getAttribute('class')).match(/board-col--(\w+)/)[1];
  await card.locator('.board-card__move').click();
  await page.waitForTimeout(300);
  await page.locator('.move-option').filter({ hasText: 'Client to reply' }).click();
  await page.waitForTimeout(500);
  const moved = page.locator('.board-card').filter({ hasText: subject }).first();
  const colAfter = (await moved.locator('xpath=ancestor::section[contains(@class,"board-col")]').getAttribute('class')).match(/board-col--(\w+)/)[1];
  if (colAfter === 'client') pass('board move works in static build');
  else fail(`board move failed, now ${colAfter} (was ${colBefore})`);

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const persisted = page.locator('.board-card').filter({ hasText: subject }).first();
  const colReload = (await persisted.locator('xpath=ancestor::section[contains(@class,"board-col")]').getAttribute('class')).match(/board-col--(\w+)/)[1];
  if (colReload === 'client') pass('state persists across reload');
  else fail(`state did not persist, now ${colReload}`);

  await page.goto(`${BASE}/app/inbox`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.locator('.thread-row').first().click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /Draft reply/i }).click();
  await page.waitForTimeout(900);
  const draft = await page.locator('.composer__textarea').inputValue();
  if (draft.length > 40) pass('draft generation works');
  else fail(`draft too short: "${draft}"`);
  await page.screenshot({ path: `${OUT}/s03-thread-draft.png` });

  await page.locator('.searchbox').click();
  await page.waitForTimeout(300);
  await page.locator('.ask-bar__input').fill('what needs the client');
  await page.locator('.ask-bar__input').press('Enter');
  await page.waitForTimeout(1400);
  const answer = await page.locator('.ask-answer__text').innerText().catch(() => '');
  if (answer.length > 20) pass('Ask Relay answers');
  else fail(`ask returned nothing: "${answer}"`);
  await page.screenshot({ path: `${OUT}/s04-ask.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  await page.locator('.demo-trigger').click();
  await page.waitForTimeout(300);
  await page.locator('.simulate__list button').filter({ hasText: 'scheduling request' }).click();
  await page.waitForTimeout(900);
  if (/\/app\/inbox\/t-sim-/.test(page.url())) pass('simulate routes a new email');
  else fail(`simulate did not navigate: ${page.url()}`);

  await page.goto(`${BASE}/client`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  if (await page.locator('.client-shell, .client-home, h1').first().isVisible()) pass('client view renders');
  else fail('client view missing');
  await page.screenshot({ path: `${OUT}/s05-client.png` });

  await page.goto(`${BASE}/app/accounts`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  if (await page.locator('.acct-card').first().isVisible()) pass('accounts render');
  else fail('accounts missing');

  await page.goto(`${BASE}/app/lab`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const verdict = await page.locator('.lab-verdict__label').innerText().catch(() => '');
  const scores = await page.locator('.lab-score').count();
  if (verdict && scores === 3) pass(`routing lab runs in the browser: ${verdict.trim()}`);
  else fail(`lab did not render: verdict "${verdict}", ${scores} score rows`);
  await page.locator('#lab-floor').fill('8');
  await page.waitForTimeout(400);
  const forced = await page.locator('.lab-verdict__label').innerText().catch(() => '');
  if (/review/i.test(forced)) pass('lab policy slider moves the route to review');
  else fail(`floor change did not force review: ${forced}`);
  await page.screenshot({ path: `${OUT}/s06-lab.png` });

  if (apiCalls.length === 0) pass('no API requests, runs fully in browser');
  else fail(`unexpected API calls: ${apiCalls.slice(0, 3).join(', ')}`);

  if (errs.length === 0) pass('no console errors');
  else fail(`console errors: ${errs.slice(0, 3).join(' | ')}`);

  await b.close();
})();
