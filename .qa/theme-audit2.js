const { chromium } = require('playwright-core');
const EXEC =
  'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'http://localhost:5173';
const OUT = 'C:/Users/aditi/Documents/Qoder/2026-11-16/445cdf8c/.qa';

(async () => {
  await fetch('http://127.0.0.1:4000/api/reset', { method: 'POST' });
  const browser = await chromium.launch({ executablePath: EXEC });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  const shot = async (name, full = false) => {
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
    console.log('shot', name);
  };
  const go = async (url) => {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
  };

  await go('/app');
  await shot('tb-overview', true);
  await go('/app/inbox/t-a1');
  await shot('tb-thread');
  await page.locator('.searchbox').click();
  await page.waitForTimeout(400);
  await shot('tb-ask');
  await page.keyboard.press('Escape');
  await go('/app');
  await page.locator('.demo-trigger').click();
  await page.waitForTimeout(300);
  await shot('tb-simulate');
  await page.keyboard.press('Escape');
  await go('/app/lab');
  await shot('tb-lab-full', true);
  await go('/client/thread/t-a1');
  await shot('tb-client-thread');

  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobile = await mctx.newPage();
  for (const [name, url] of [
    ['tb-m-landing', '/'],
    ['tb-m-overview', '/app'],
    ['tb-m-inbox', '/app/inbox'],
    ['tb-m-client', '/client'],
    ['tb-m-lab', '/app/lab'],
  ]) {
    await mobile.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    await mobile.waitForTimeout(600);
    await mobile.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
    console.log('shot', name);
  }

  console.log('errors', errors.length ? errors : 'none');
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
