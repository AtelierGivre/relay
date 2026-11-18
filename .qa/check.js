const { chromium } = require('playwright-core');

const EXEC = 'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'http://localhost:5173';
const OUT = 'C:/Users/aditi/Documents/Qoder/2026-11-16/445cdf8c/.qa';

(async () => {
  await fetch('http://127.0.0.1:4000/api/reset', { method: 'POST' });
  const browser = await chromium.launch({ executablePath: EXEC });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

  async function shot(name, url, wait = 900) {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(wait);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log(`shot ${name} @ ${url}`);
  }

  await shot('c01-overview', '/app');
  await shot('c02-inbox', '/app/inbox');
  await shot('c03-thread', '/app/inbox/t-a1');
  await shot('c04-board', '/app/board');
  await shot('c05-review', '/app/review');
  await shot('c06-client', '/client');
  await shot('c07-client-thread', '/client/thread/t-a1');
  await shot('c08-accounts', '/app/accounts');
  await shot('c09-landing', '/');
  await shot('c10-connect', '/connect');

  console.log('\nErrors:', errors.length ? errors : 'none');
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
