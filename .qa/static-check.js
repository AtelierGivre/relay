const { chromium } = require('playwright-core');
const EXEC = 'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'http://localhost:4173';
const OUT = 'C:/Users/aditi/Documents/Qoder/2026-11-16/445cdf8c/.qa';
const pass = (m) => console.log('PASS', m);
const fail = (m) => { console.log('FAIL', m); process.exitCode = 1; };

(async () => {
  const b = await chromium.launch({ executablePath: EXEC });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(() => localStorage.setItem('relay.onboarded', '1'));
  const page = await ctx.newPage();
  const errs = [];
  const apiCalls = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('request', (r) => {
    if (/:4000|localhost:4000/.test(r.url())) apiCalls.push(r.url());
  });

  await page.goto(`${BASE}/app/eval`, { waitUntil: 'networkidle' });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.eval-table tbody tr', { timeout: 10000 });
  await page.waitForTimeout(400);

  const stats = await page.locator('.eval-stat__value').allInnerTexts();
  console.log('eval stats', stats.join(' | '));
  if (stats[0] === '98.0%' && stats[2] === '0') pass('static eval shows 98.0% with zero wrong routes');
  else fail(`static eval stats: ${stats.join(' | ')}`);

  const misses = await page.locator('.eval-miss').count();
  if (misses === 1) pass('static eval lists one held miss');
  else fail(`static eval misses: ${misses}`);

  await page.goto(`${BASE}/app/inbox`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const tabs = await page.locator('.segment-tab').allInnerTexts();
  const countOf = (label) => {
    const tab = tabs.find((t) => t.startsWith(label));
    return tab ? (tab.match(/\d+/) || ['0'])[0] : '0';
  };
  const counts = ['Assistant', 'Client', 'Review', 'Waiting', 'No reply'].map(countOf).join(',');
  console.log('inbox tabs', tabs.join(' | '));
  if (counts === '9,8,2,3,4') pass('seeded inbox counts unchanged');
  else fail(`seeded counts: ${counts}`);

  if (apiCalls.length === 0) pass('no requests to the API server');
  else fail(`unexpected API calls: ${apiCalls.slice(0, 3).join(' | ')}`);
  if (errs.length === 0) pass('no console or page errors');
  else fail(`console errors: ${errs.slice(0, 3).join(' | ')}`);

  await page.screenshot({ path: `${OUT}/e04-static-inbox.png`, fullPage: true });
  await b.close();
})();
