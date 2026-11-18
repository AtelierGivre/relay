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
  const shots = [
    ['ta-landing-full', '/', true],
    ['ta-inbox', '/app/inbox', false],
    ['ta-client', '/client', false],
    ['ta-connect', '/connect', false],
    ['ta-lab', '/app/lab', false],
    ['ta-board', '/app/board', false],
    ['ta-review', '/app/review', false],
    ['ta-accounts', '/app/accounts', false],
  ];
  for (const [name, url, full] of shots) {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
    console.log('shot', name);
  }
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
