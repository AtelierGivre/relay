const { chromium } = require('playwright-core');
const EXEC =
  'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'http://localhost:4173';
const OUT = 'C:/Users/aditi/Documents/Qoder/2026-11-16/445cdf8c/.qa';

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const shots = [
    ['prod-landing', '/', true],
    ['prod-inbox', '/app/inbox', false],
    ['prod-lab', '/app/lab', false],
    ['prod-client', '/client', false],
  ];
  for (const [name, url, full] of shots) {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
    console.log('shot', name);
  }
  const mock = await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  void mock;
  const transform = await page
    .locator('.client-mock')
    .evaluate((el) => getComputedStyle(el).transform)
    .catch(() => 'missing');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log('client-mock transform:', transform);
  console.log('body background:', bg);
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
