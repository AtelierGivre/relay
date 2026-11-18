const { chromium } = require('playwright-core');

const EXEC =
  'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'http://localhost:5173';
const OUT = 'C:/Users/aditi/Documents/Qoder/2026-11-16/445cdf8c/.qa';

const pages = ['/app', '/app/inbox', '/app/board', '/app/review', '/app/eval', '/app/accounts', '/client', '/', '/connect'];
const widths = [1280, 1024, 768, 390];

(async () => {
  await fetch('http://127.0.0.1:4000/api/reset', { method: 'POST' });
  const browser = await chromium.launch({ executablePath: EXEC });
  let failures = 0;

  for (const width of widths) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addInitScript(() => localStorage.setItem('relay.onboarded', '1'));
    const page = await ctx.newPage();
    for (const url of pages) {
      await page.goto(BASE + url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(350);
      const info = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        view: window.innerWidth,
      }));
      if (info.scroll > info.view + 1) {
        failures++;
        console.log(`OVERFLOW ${width} ${url}: ${info.scroll} > ${info.view}`);
      }
    }
    if (width === 1024) {
      await page.goto(BASE + '/app', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${OUT}/w1024-overview.png` });
    }
    if (width === 768) {
      await page.goto(BASE + '/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${OUT}/w768-landing.png` });
    }
    await ctx.close();
  }

  console.log(failures ? `${failures} overflow issues` : 'No horizontal overflow at 1280, 1024, 768 or 390px');
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
