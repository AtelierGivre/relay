const { chromium } = require('playwright-core');
const path = require('path');
const exe = path.join(
  process.env.LOCALAPPDATA,
  'ms-playwright',
  'chromium_headless_shell-1248',
  'chrome-headless-shell-win64',
  'chrome-headless-shell.exe',
);
const base = 'http://localhost:5173';
const api = 'http://127.0.0.1:4000/api';
const shotDir = 'C:/Users/aditi/Documents/Qoder/2026-11-16/445cdf8c/.qa';
let passed = 0;
let failed = 0;
async function step(name, fn) {
  try {
    await fn();
    passed++;
    console.log('PASS', name);
  } catch (e) {
    failed++;
    console.log('FAIL', name, String(e.message).slice(0, 240));
  }
}
const getJson = async (p) => (await fetch(api + p)).json();

(async () => {
  await fetch(api + '/reset', { method: 'POST' });
  const browser = await chromium.launch({ executablePath: exe });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.addInitScript(() => localStorage.setItem('relay.onboarded', '1'));

  await step('client hand-off lowers dashboard client count', async () => {
    await desktop.goto(base + '/app', { waitUntil: 'networkidle' });
    const read = async () => {
      const card = desktop.locator('.ovy-stat', { hasText: 'Needs the client' });
      return Number((await card.locator('.ovy-stat__value').innerText()).trim());
    };
    const before = await read();
    await desktop.goto(base + '/client?client=c-aarav', { waitUntil: 'networkidle' });
    await desktop.locator('.client-card').first().locator('a:has-text("Open conversation")').click();
    await desktop.click('button:has-text("Mark as handled")');
    await desktop.waitForURL(/\/client\?/, { timeout: 5000 });
    await desktop.goto(base + '/app', { waitUntil: 'networkidle' });
    const after = await read();
    if (after !== before - 1) throw new Error(`overview count ${before} -> ${after}`);
    await desktop.screenshot({ path: `${shotDir}/02-app-overview.png` });
  });

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => localStorage.setItem('relay.onboarded', '1'));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(base + '/app/inbox', { waitUntil: 'networkidle' });
  await step('mobile inbox opens detail and returns', async () => {
    await page.locator('.thread-row').first().click();
    await page.waitForTimeout(500);
    if (!(await page.locator('.inbox.has-detail').count())) throw new Error('no detail state');
    if (await page.locator('.inbox__list').isVisible()) throw new Error('list still visible');
    await page.screenshot({ path: `${shotDir}/m04-thread.png` });
    await page.click('.detail__back');
    await page.waitForTimeout(500);
    if (!(await page.locator('.inbox__list').isVisible())) throw new Error('list not restored');
  });

  await step('mobile bottom tabs navigate', async () => {
    await page.click('.mobile-tabs a:has-text("Route"), .mobile-tabs button:has-text("Route")');
    await page.waitForTimeout(600);
    if (!/\/app\/board/.test(page.url())) throw new Error('Route tab: ' + page.url());
    await page.click('.mobile-tabs a:has-text("Home"), .mobile-tabs button:has-text("Home")');
    await page.waitForTimeout(600);
    if (!/\/app\/?$/.test(page.url())) throw new Error('Home tab: ' + page.url());
  });

  await page.goto(base + '/client?client=c-aarav', { waitUntil: 'networkidle' });
  await step('mobile client view fits viewport', async () => {
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    if (w > 390) throw new Error('page width ' + w);
    await page.screenshot({ path: `${shotDir}/m05-client.png` });
  });

  await page.locator('.client-card').first().locator('a:has-text("Open conversation")').click();
  await page.waitForTimeout(600);
  await step('mobile client thread actions stacked and visible', async () => {
    const boxes = await page.locator('.cthread-actions__buttons .btn').evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), h: Math.round(r.height) };
      }),
    );
    if (boxes.some((b) => b.right > 390 || b.left < 0)) throw new Error('button overflow ' + JSON.stringify(boxes));
    if (boxes[0].top === boxes[1].top) throw new Error('buttons not stacked');
    await page.screenshot({ path: `${shotDir}/m06-client-thread.png` });
  });

  await page.goto(base + '/app/inbox', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${shotDir}/m03-inbox.png` });
  console.log('page errors:', errors);
  console.log(`\n${passed}/${passed + failed} passed`);
  await browser.close();
})();
