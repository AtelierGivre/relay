const { chromium } = require('playwright-core');
const fs = require('fs');

const EXEC = 'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'http://localhost:5173';
const OUT = 'C:/Users/aditi/Documents/Qoder/2026-11-16/445cdf8c/.qa';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXEC });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

  async function shot(name, url, { full = false, wait = 700, before } = {}) {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(wait);
    if (before) await before();
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
    console.log(`shot ${name} @ ${url}`);
  }

  await shot('01-landing', '/', { full: true });
  await shot('02-app-overview', '/app');
  await shot('03-app-inbox', '/app/inbox');
  await shot('04-app-board', '/app/board');
  await shot('05-app-review', '/app/review');
  await shot('06-app-accounts', '/app/accounts');
  await shot('07-client-home', '/client');
  await shot('08-client-thread', '/client/thread/t-a1');
  await shot('09-connect', '/connect');
  await shot('10-connect-provider', '/connect', {
    before: async () => {
      const toggle = page.locator('.connect-toggle button').first();
      if (await toggle.count()) {
        await page.locator('.connect-card .btn--primary').click();
        await page.waitForTimeout(400);
      }
    },
  });
  await shot('11-connect-consent', '/connect', {
    before: async () => {
      await page.locator('.connect-card .btn--primary').click();
      await page.waitForTimeout(300);
      await page.locator('.provider-grid').click();
      await page.locator('.connect-actions .btn--primary').click();
      await page.waitForTimeout(400);
    },
  });
  await shot('12-connect-sync', '/connect', {
    before: async () => {
      await page.locator('.connect-card .btn--primary').click();
      await page.waitForTimeout(300);
      await page.locator('.provider-grid').click();
      await page.locator('.connect-actions .btn--primary').click();
      await page.waitForTimeout(300);
      await page.locator('.consent__actions .btn--primary').click();
      await page.waitForTimeout(1600);
    },
  });
  await shot('13-connect-done', '/connect', {
    before: async () => {
      await page.locator('.connect-card .btn--primary').click();
      await page.waitForTimeout(300);
      await page.locator('.provider-grid').click();
      await page.locator('.connect-actions .btn--primary').click();
      await page.waitForTimeout(300);
      await page.locator('.consent__actions .btn--primary').click();
      await page.waitForTimeout(5200);
    },
  });

  // Mobile
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const m = await mctx.newPage();
  const mobileErrors = [];
  m.on('console', (msg) => {
    if (msg.type() === 'error') mobileErrors.push(`[console] ${msg.text()}`);
  });
  m.on('pageerror', (err) => mobileErrors.push(`[pageerror] ${err.message}`));
  async function mshot(name, url, { full = false, wait = 700 } = {}) {
    await m.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    await m.waitForTimeout(wait);
    await m.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
    console.log(`shot ${name} @ ${url}`);
  }
  await mshot('m01-landing', '/', { full: true });
  await mshot('m02-overview', '/app');
  await mshot('m03-inbox', '/app/inbox');
  await mshot('m04-thread', '/app/inbox/t-a1');
  await mshot('m05-client', '/client');
  await mshot('m06-client-thread', '/client/thread/t-a1');
  await mshot('m07-connect', '/connect');

  console.log('\nDesktop errors:', errors.length ? errors : 'none');
  console.log('Mobile errors:', mobileErrors.length ? mobileErrors : 'none');
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
