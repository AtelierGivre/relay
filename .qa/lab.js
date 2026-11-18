const { chromium } = require('playwright-core');
const EXEC = 'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'http://localhost:5173';
const OUT = 'C:/Users/aditi/Documents/Qoder/2026-11-16/445cdf8c/.qa';
const pass = (m) => console.log('PASS', m);
const fail = (m) => { console.log('FAIL', m); process.exitCode = 1; };

(async () => {
  await fetch('http://127.0.0.1:4000/api/reset', { method: 'POST' });
  const b = await chromium.launch({ executablePath: EXEC });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

  await page.goto(`${BASE}/app/lab`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const verdict = () => page.locator('.lab-verdict__label').innerText();
  const initial = await verdict();
  if (initial === 'Client to reply') pass(`lab default preset routes to client (${initial})`);
  else fail(`lab default verdict is ${initial}`);
  const ledgerRows = await page.locator('.lab-ledger__row').count();
  if (ledgerRows >= 3) pass(`evidence ledger shows ${ledgerRows} rows`);
  else fail(`ledger rows ${ledgerRows}`);
  await page.screenshot({ path: `${OUT}/l01-lab.png`, fullPage: true });

  await page.locator('.lab-preset').filter({ hasText: 'A newsletter' }).click();
  await page.waitForTimeout(400);
  if ((await verdict()) === 'No reply needed') pass('newsletter preset files as no reply');
  else fail(`newsletter verdict ${await verdict()}`);

  await page.locator('.lab-preset').filter({ hasText: 'A scheduling request' }).click();
  await page.waitForTimeout(400);
  if ((await verdict()) === 'Assistant to reply') pass('scheduling preset routes to assistant');
  else fail(`scheduling verdict ${await verdict()}`);

  await page.locator('#lab-floor').evaluate((el) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, '7.2');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(500);
  if ((await verdict()) === 'Needs review') pass('raising the floor sends this to review');
  else fail(`after floor change verdict ${await verdict()}`);
  const impactRows = await page.locator('.lab-impact__row').count();
  if (impactRows > 0) pass(`impact preview lists ${impactRows} conversations`);
  else fail('impact preview empty after policy change');
  await page.screenshot({ path: `${OUT}/l02-lab-tuned.png`, fullPage: true });

  await page.goto(`${BASE}/app/inbox`, { waitUntil: 'networkidle' });
  await page.locator('.thread-row').first().click();
  await page.waitForTimeout(600);
  const evidence = await page.locator('.ai-ledger__row').count();
  if (evidence > 0) pass(`thread shows ${evidence} evidence rows`);
  else fail('thread evidence ledger missing');
  const policyText = await page.locator('.ai-card__policy').innerText();
  if (/Review below/.test(policyText)) pass('thread shows the policy thresholds');
  else fail(`policy line: ${policyText}`);
  await page.screenshot({ path: `${OUT}/l03-thread-evidence.png`, fullPage: true });

  const subject = await page.locator('.detail__subject').innerText();
  await page.locator('.ai-card__lab').click();
  await page.waitForTimeout(600);
  const labSubject = await page.locator('.lab-field').filter({ hasText: 'Subject' }).locator('input').inputValue();
  if (subject.trim().startsWith(labSubject.trim().slice(0, 18))) pass('Test in lab prefills the conversation');
  else fail(`lab prefill mismatch: ${labSubject} vs ${subject}`);

  const mobile = await b.newContext({ viewport: { width: 390, height: 844 } });
  const mpage = await mobile.newPage();
  await mpage.goto(`${BASE}/app/lab`, { waitUntil: 'networkidle' });
  await mpage.waitForTimeout(500);
  const overflow = await mpage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow <= 0) pass('lab has no horizontal overflow at 390px');
  else fail(`lab overflows by ${overflow}px`);
  const tab = mpage.locator('.mobile-tab').filter({ hasText: 'Lab' });
  if (await tab.count()) pass('lab tab available on mobile');
  else fail('lab tab missing on mobile');
  await mpage.screenshot({ path: `${OUT}/l04-lab-mobile.png`, fullPage: true });

  if (errs.length === 0) pass('no console errors');
  else fail(`console errors: ${errs.slice(0, 3).join(' | ')}`);

  await b.close();
})();
