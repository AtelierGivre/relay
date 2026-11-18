const { chromium } = require('playwright-core');
const EXEC = 'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'http://localhost:5173';
const OUT = 'C:/Users/aditi/Documents/Qoder/2026-11-16/445cdf8c/.qa';
const pass = (m) => console.log('PASS', m);
const fail = (m) => { console.log('FAIL', m); process.exitCode = 1; };

(async () => {
  await fetch('http://127.0.0.1:4000/api/reset', { method: 'POST' });
  const b = await chromium.launch({ executablePath: EXEC });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

  await page.goto(`${BASE}/app/board`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/r01-board.png` });

  const firstCard = page.locator('.board-card').first();
  const subject = (await firstCard.locator('.board-card__subject').innerText()).trim();
  const colBefore = (await firstCard.locator('xpath=ancestor::section[contains(@class,"board-col")]').getAttribute('class')).match(/board-col--(\w+)/)[1];
  await firstCard.locator('.board-card__move').click();
  await page.waitForTimeout(300);
  if (await page.locator('.move-options').isVisible()) pass('move menu opens'); else fail('move menu did not open');
  await page.screenshot({ path: `${OUT}/r02-move-modal.png` });
  const option = page.locator('.move-option').filter({ hasText: 'Client to reply' });
  await option.click();
  await page.waitForTimeout(700);
  const moved = page.locator('.board-card').filter({ hasText: subject }).first();
  const colAfter = (await moved.locator('xpath=ancestor::section[contains(@class,"board-col")]').getAttribute('class')).match(/board-col--(\w+)/)[1];
  if (colAfter === 'client') pass('move menu reclassifies'); else fail(`move did not apply, now ${colAfter}`);
  if (colBefore === 'assistant') pass('card started in assistant'); else console.log('note: started in', colBefore);

  await page.goto(`${BASE}/app/accounts`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const warn = page.locator('.acct-card__warn').first();
  if (await warn.count()) {
    await page.screenshot({ path: `${OUT}/r03-accounts.png` });
    await warn.locator('.acct-card__renew').click();
    await page.waitForTimeout(800);
    const left = await page.locator('.acct-card__warn').count();
    if (left === 0) pass('renew clears expiring warning'); else fail('warning still visible');
  } else console.log('note: no expiring account found');

  // keyboard path on board card
  await page.goto(`${BASE}/app/board`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.locator('.board-card').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  if (page.url().includes('/app/inbox/')) pass('board card opens with Enter'); else fail('Enter did not open card');

  // mobile move modal
  await fetch('http://127.0.0.1:4000/api/reset', { method: 'POST' });
  const mctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const mp = await mctx.newPage();
  mp.on('pageerror', (e) => errs.push(e.message));
  await mp.goto(`${BASE}/app/board`, { waitUntil: 'networkidle' });
  await mp.waitForTimeout(600);
  await mp.locator('.board-card__move').first().click();
  await mp.waitForTimeout(300);
  const box = await mp.locator('.modal').boundingBox();
  if (box && box.x >= 0 && box.x + box.width <= 390) pass('move modal fits phone'); else fail('move modal overflows phone');
  await mp.screenshot({ path: `${OUT}/r04-mobile-move.png` });
  await mctx.close();

  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
