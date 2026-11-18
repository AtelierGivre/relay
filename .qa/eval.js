const { chromium } = require('playwright-core');
const EXEC = 'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'http://localhost:5173';
const OUT = 'C:/Users/aditi/Documents/Qoder/2026-11-16/445cdf8c/.qa';
const pass = (m) => console.log('PASS', m);
const fail = (m) => { console.log('FAIL', m); process.exitCode = 1; };

(async () => {
  const b = await chromium.launch({ executablePath: EXEC });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

  await page.goto(`${BASE}/app/eval`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.eval-table tbody tr', { timeout: 10000 });
  await page.waitForTimeout(500);

  const title = (await page.locator('.page-title').innerText()).trim();
  if (/measure the router/i.test(title)) pass(`page title: ${title}`);
  else fail(`unexpected title: ${title}`);

  const stats = await page.locator('.eval-stat__value').allInnerTexts();
  console.log('stats', stats.join(' | '));
  if (stats[0] === '98.0%' && stats[2] === '0') pass('stat strip shows 98.0% and zero wrong routes');
  else fail(`stat strip unexpected: ${stats.join(' | ')}`);

  const gate = (await page.locator('.eval-gate__state').innerText()).trim();
  if (gate.toLowerCase() === 'passing') pass('release gate passes');
  else fail(`gate state: ${gate}`);

  const rows = await page.locator('.eval-table tbody tr').count();
  if (rows === 4) pass('per-route table has four rows');
  else fail(`per-route rows: ${rows}`);

  const diag = await page.locator('.eval-cell.is-hit').count();
  if (diag === 4) pass('matrix has four correct cells');
  else fail(`matrix diagonal cells: ${diag}`);

  const misses = await page.locator('.eval-miss').count();
  if (misses === 1) pass('the remaining miss is listed');
  else fail(`misses listed: ${misses}`);

  const navActive = await page.locator('.rail__link.is-active').innerText();
  if (/evaluation/i.test(navActive)) pass('sidebar marks Evaluation active');
  else fail(`sidebar active label: ${navActive}`);

  await page.screenshot({ path: `${OUT}/e01-eval.png`, fullPage: true });

  // Move the evidence floor to the top: everything should go to review.
  const floor = page.locator('#eval-floor');
  await floor.evaluate((el) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, '8');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(600);
  const tunedTag = await page.locator('.eval-tag').count();
  const stats2 = await page.locator('.eval-stat__value').allInnerTexts();
  console.log('tuned stats', stats2.join(' | '));
  if (tunedTag === 0 && stats2[1] !== stats[1]) pass('slider re-runs the suite');
  else fail(`tuned tag ${tunedTag}, review rate ${stats2[1]} (was ${stats[1]})`);
  await page.screenshot({ path: `${OUT}/e02-eval-tuned.png`, fullPage: true });

  await page.locator('.eval-policy .btn').click();
  await page.waitForTimeout(600);
  if ((await page.locator('.eval-tag').count()) === 1) pass('reset returns to defaults');
  else fail('reset did not restore the defaults tag');

  // Mobile pass.
  const mob = await ctx.newPage();
  await mob.setViewportSize({ width: 390, height: 844 });
  await mob.goto(`${BASE}/app/eval`, { waitUntil: 'networkidle' });
  await mob.waitForSelector('.eval-table tbody tr');
  await mob.waitForTimeout(400);
  const overflow = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow <= 0) pass('no horizontal overflow at 390px');
  else fail(`horizontal overflow: ${overflow}px`);
  const tabs = await mob.locator('.mobile-tab').count();
  if (tabs === 6) pass('mobile nav has six tabs');
  else fail(`mobile tabs: ${tabs}`);
  await mob.screenshot({ path: `${OUT}/e03-eval-mobile.png`, fullPage: true });

  if (errs.length === 0) pass('no console or page errors');
  else fail(`console errors: ${errs.slice(0, 3).join(' | ')}`);

  await b.close();
})();
