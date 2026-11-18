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
    console.log('FAIL', name, String(e.message).slice(0, 260));
    throw e;
  }
}
const getJson = async (p) => (await fetch(api + p)).json();

(async () => {
  await fetch(api + '/reset', { method: 'POST' });

  const browser = await chromium.launch({ executablePath: exe });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => localStorage.setItem('relay.onboarded', '1'));
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  // 1. review queue resolution
  await page.goto(base + '/app/review', { waitUntil: 'networkidle' });
  await step('review queue resolves a thread', async () => {
    const before = await page.locator('.review-card').count();
    const subject = await page.locator('.review-card__subject').first().textContent();
    await page.locator('.review-card__actions button:has-text("Client")').first().click();
    await page.waitForTimeout(700);
    const after = await page.locator('.review-card').count();
    if (after !== before - 1) throw new Error(`count ${before} -> ${after}`);
    const t = (await getJson('/bootstrap')).threads.find((x) => x.subject === subject);
    if (t.ai.classification !== 'client' || !t.ai.manual) throw new Error('not routed');
  });

  // 2. thread actions
  await page.goto(base + '/app/inbox/t-a2', { waitUntil: 'networkidle' });
  await step('star, unread, complete, archive actions', async () => {
    const initial = (await getJson('/threads/t-a2')).thread;
    await page.click('button[title="Star conversation"], button[title="Remove star"]');
    await page.waitForTimeout(400);
    await page.click('button[title="Mark as unread"], button[title="Mark as read"]');
    await page.waitForTimeout(400);
    let t = (await getJson('/threads/t-a2')).thread;
    if (t.starred === initial.starred) throw new Error('star unchanged');
    if (t.unread === initial.unread) throw new Error('unread unchanged');
    await page.click('button:has-text("Mark done")');
    await page.waitForTimeout(600);
    t = (await getJson('/threads/t-a2')).thread;
    if (t.status !== 'done') throw new Error('not completed');
    await page.goto(base + '/app/inbox/t-a2?status=done', { waitUntil: 'networkidle' });
    await page.click('.detail__tools button:has-text("Completed")');
    await page.waitForTimeout(500);
    t = (await getJson('/threads/t-a2')).thread;
    if (t.status !== 'open') throw new Error('not reopened');
    await page.goto(base + '/app/inbox/t-a3', { waitUntil: 'networkidle' });
    await page.click('button[title="Archive conversation"]');
    await page.waitForTimeout(700);
    t = (await getJson('/threads/t-a3')).thread;
    if (!t.archived) throw new Error('not archived');
  });

  // 3. simulate all four kinds
  await page.goto(base + '/app/inbox', { waitUntil: 'networkidle' });
  await step('simulate all four email kinds', async () => {
    const labels = [
      ['A client decision', 'client'],
      ['A scheduling request', 'assistant'],
      ['An ambiguous intro', 'review'],
      ['A newsletter', 'none'],
    ];
    for (const [label, expected] of labels) {
      await page.click('.demo-trigger');
      await page.waitForTimeout(250);
      await page.click(`.simulate__option:has-text("${label}")`);
      await page.waitForURL(/\/app\/inbox\/t-sim-/, { timeout: 5000 });
      await page.waitForTimeout(500);
      const id = page.url().split('/').pop();
      const t = (await getJson('/threads/' + id)).thread;
      if (t.ai.classification !== expected)
        throw new Error(`${label}: expected ${expected}, got ${t.ai.classification}`);
    }
  });

  // 4. add mailbox
  await step('connect another mailbox', async () => {
    await page.goto(base + '/app/accounts', { waitUntil: 'networkidle' });
    const before = (await getJson('/bootstrap')).accounts.length;
    await page.click('.acct-add');
    await page.fill('.modal input[type="email"], .modal input', 'assistant@example.com');
    const posted = page.waitForResponse(
      (r) => r.url().includes('/api/accounts') && r.request().method() === 'POST',
      { timeout: 5000 },
    );
    await page.click('.modal button:has-text("Continue with")');
    await posted;
    await page.waitForTimeout(600);
    const after = (await getJson('/bootstrap')).accounts.length;
    if (after !== before + 1) throw new Error(`${before} -> ${after}`);
  });

  // 5. onboarding end to end
  await step('onboarding flow completes into workspace', async () => {
    await page.evaluate(() => localStorage.removeItem('relay.onboarded'));
    await page.goto(base + '/connect', { waitUntil: 'networkidle' });
    await page.fill('#onboard-name', 'Meera Iyer');
    await page.fill('#onboard-email', 'meera@studio.in');
    await page.click('.connect-panel button:has-text("Continue")');
    await page.waitForTimeout(300);
    await page.click('.provider-card:has-text("Microsoft Outlook")');
    await page.click('button:has-text("Continue with")');
    await page.waitForSelector('.consent');
    await page.check('.consent__allow input');
    await page.click('button:has-text("Allow access")');
    await page.waitForSelector('.sync-progress', { timeout: 3000 });
    await page.waitForTimeout(5200);
    if (!(await page.isVisible('text=already routed'))) throw new Error('done step missing');
    await page.screenshot({ path: `${shotDir}/t05-onboarding-done.png` });
    await page.click('button:has-text("Open my workspace")');
    await page.waitForURL(/\/app/, { timeout: 5000 });
    const onboarded = await page.evaluate(() => localStorage.getItem('relay.onboarded'));
    if (onboarded !== '1') throw new Error('onboarded flag not set');
  });

  // 6. empty state
  await step('empty search state', async () => {
    await page.goto(base + '/app/inbox', { waitUntil: 'networkidle' });
    await page.fill('.list-search input', 'zzzz no match');
    await page.waitForTimeout(400);
    if (!(await page.isVisible('.empty-state, .list-empty'))) throw new Error('no empty state');
    await page.screenshot({ path: `${shotDir}/t06-empty-state.png` });
  });

  // 7. error state
  await step('error state with retry', async () => {
    const p2 = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    await p2.addInitScript(() => localStorage.setItem('relay.onboarded', '1'));
    await p2.route('**/api/bootstrap', (r) => r.abort());
    await p2.goto(base + '/app', { waitUntil: 'domcontentloaded' });
    await p2.waitForTimeout(1200);
    const text = await p2.locator('body').innerText();
    if (!/couldn't|went wrong|retry|offline/i.test(text)) throw new Error('no error copy');
    await p2.screenshot({ path: `${shotDir}/t07-error-state.png` });
    await p2.close();
  });

  // 8. loading state
  await step('loading state renders', async () => {
    const p3 = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    await p3.addInitScript(() => localStorage.setItem('relay.onboarded', '1'));
    await p3.route('**/api/bootstrap', async (r) => {
      await new Promise((res) => setTimeout(res, 2500));
      r.continue();
    });
    await p3.goto(base + '/app', { waitUntil: 'domcontentloaded' });
    await p3.waitForTimeout(600);
    const text = await p3.locator('body').innerText();
    if (!/relay/i.test(text) || text.length < 10) throw new Error('loading screen empty');
    await p3.screenshot({ path: `${shotDir}/t08-loading-state.png` });
    await p3.close();
  });

  console.log('\npage errors:', errors);
  console.log(`\n${passed}/${passed + failed} passed`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
