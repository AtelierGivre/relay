const { chromium } = require('playwright-core');
const EXEC = 'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'https://relay-inbox-demo.vercel.app';
const OUT = 'C:/Users/aditi/Documents/Qoder/2026-11-16/445cdf8c/.qa';
const pass = (m) => console.log('PASS', m);
const fail = (m) => { console.log('FAIL', m); process.exitCode = 1; };

(async () => {
  await fetch(`${BASE}/api/reset`, { method: 'POST' }).catch(() => {});
  const b = await chromium.launch({ executablePath: EXEC });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(() => localStorage.setItem('relay.onboarded', '1'));
  const page = await ctx.newPage();
  const errs = [];
  const apiHits = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('response', (r) => {
    if (r.url().includes('/api/')) apiHits.push(r.url().replace(BASE, '') + ' ' + r.status());
  });

  await page.goto(`${BASE}/app/eval`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.eval-table tbody tr', { timeout: 20000 });
  await page.waitForTimeout(500);

  const stats = await page.locator('.eval-stat__value').allInnerTexts();
  console.log('eval stats', stats.join(' | '));
  if (stats[0] === '98.0%' && stats[2] === '0') pass('live evaluation reports 98.0% and zero wrong routes');
  else fail(`live eval stats: ${stats.join(' | ')}`);

  const misses = await page.locator('.eval-miss').count();
  if (misses === 1) pass('live evaluation lists the held miss');
  else fail(`live eval misses: ${misses}`);

  const liveApi = apiHits.some((h) => h.includes('/api/evaluate'));
  if (liveApi) pass('evaluation page uses the live API');
  else fail(`no /api/evaluate call: ${apiHits.slice(0, 4).join(', ')}`);

  await page.goto(`${BASE}/app/inbox`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const tabs = await page.locator('.segment-tab').allInnerTexts();
  const countOf = (label) => {
    const tab = tabs.find((t) => t.startsWith(label));
    return tab ? (tab.match(/\d+/) || ['0'])[0] : '0';
  };
  const counts = ['Assistant', 'Client', 'Review', 'Waiting', 'No reply'].map(countOf).join(',');
  console.log('inbox counts', counts);
  if (counts === '9,8,2,3,4') pass('live inbox starts from the seed state');
  else fail(`live inbox counts: ${counts}`);

  const paths = ['/', '/client', '/connect', '/app', '/app/board', '/app/review', '/app/accounts', '/app/lab'];
  for (const path of paths) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) fail(`${path} overflows by ${overflow}px`);
    const h1 = await page.locator('h1').count();
    if (h1 === 0) fail(`${path} has no h1`);
  }
  pass('main routes load without overflow');

  const mob = await ctx.newPage();
  await mob.setViewportSize({ width: 390, height: 844 });
  await mob.goto(`${BASE}/app/eval`, { waitUntil: 'networkidle' });
  await mob.waitForSelector('.eval-table tbody tr');
  await mob.waitForTimeout(400);
  const mOverflow = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (mOverflow <= 0) pass('no overflow on mobile');
  else fail(`mobile overflow: ${mOverflow}px`);

  if (errs.length === 0) pass('no console or page errors');
  else fail(`console errors: ${errs.slice(0, 3).join(' | ')}`);

  await page.goto(`${BASE}/app/eval`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.eval-table tbody tr');
  await page.screenshot({ path: `${OUT}/v01-vercel-eval.png`, fullPage: true });

  await fetch(`${BASE}/api/reset`, { method: 'POST' }).catch(() => {});
  await b.close();
})();
