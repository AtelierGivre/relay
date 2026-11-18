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

const results = [];
function pass(name, extra = '') {
  results.push(['PASS', name, extra]);
  console.log('PASS', name, extra);
}
function fail(name, err) {
  results.push(['FAIL', name, String(err).slice(0, 300)]);
  console.log('FAIL', name, String(err).slice(0, 300));
}
async function step(name, fn) {
  try {
    await fn();
    pass(name);
  } catch (e) {
    fail(name, e.message);
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

  await page.goto(base + '/app/inbox', { waitUntil: 'networkidle' });

  // 1. search
  await step('inbox search filters rows', async () => {
    await page.fill('.list-search input', 'term sheet');
    await page.waitForTimeout(300);
    const n = await page.locator('.thread-row').count();
    if (n < 1 || n > 3) throw new Error(`expected 1-3 rows, got ${n}`);
    await page.fill('.list-search input', '');
  });

  // 2. segment filter
  await step('client segment filters rows', async () => {
    await page.click('.segment-tab:has-text("Client")');
    await page.waitForTimeout(350);
    const chips = await page.locator('.thread-row .chip, .thread-row [class*="chip"]').allTextContents();
    const wrong = chips.filter((c) => /Assistant|No reply/.test(c));
    if (wrong.length) throw new Error('non-client rows: ' + wrong.join(','));
    await page.click('.segment-tab:has-text("All")');
  });

  // 3. open thread and override classification
  await page.goto(base + '/app/inbox/t-a1', { waitUntil: 'networkidle' });
  await step('manual classification override', async () => {
    await page.click('.route-option:has-text("Assistant to reply")');
    await page.waitForTimeout(500);
    const t = await getJson('/threads/t-a1');
    if (!t.thread.ai.manual || t.thread.ai.classification !== 'assistant')
      throw new Error('override not persisted: ' + JSON.stringify(t.thread.ai.classification));
    const active = await page.locator('.route-option.is-active').textContent();
    if (!/Assistant/.test(active)) throw new Error('route selector did not update');
  });

  // 4. re-run analysis restores deterministic route
  await step('re-run analysis restores route', async () => {
    await page.click('.route-card button:has-text("Re-run analysis")');
    await page.waitForTimeout(500);
    const t = await getJson('/threads/t-a1');
    if (t.thread.ai.classification !== 'client') throw new Error('expected client, got ' + t.thread.ai.classification);
    if (t.thread.ai.manual) throw new Error('manual flag still set');
  });

  // 5. draft + tone + approve
  await step('draft, tone switch, approve send', async () => {
    const before = (await getJson('/threads/t-a1')).thread.messages.length;
    await page.click('button:has-text("Draft reply")');
    await page.waitForSelector('.composer__textarea', { timeout: 5000 });
    await page.waitForTimeout(250);
    const first = await page.inputValue('.composer__textarea');
    if (first.length < 40) throw new Error('draft too short');
    await page.click('.tone-chip:has-text("Brief")');
    await page.waitForTimeout(600);
    const second = await page.inputValue('.composer__textarea');
    if (second === first) throw new Error('tone did not change draft');
    await page.click('button:has-text("Approve and send")');
    await page.waitForTimeout(700);
    const after = (await getJson('/threads/t-a1')).thread;
    if (after.messages.length !== before + 1) throw new Error('message not appended');
    if (after.ai.waitingOn !== 'them') throw new Error('waitingOn not updated');
    await page.screenshot({ path: `${shotDir}/t01-thread-draft-sent.png` });
  });

  // 6. Ask Relay
  await step('Ask Relay answers and lists threads', async () => {
    await page.keyboard.press('Control+K');
    await page.waitForSelector('.ask-bar__input', { timeout: 3000 });
    await page.fill('.ask-bar__input', "What's waiting on me?");
    await page.press('.ask-bar__input', 'Enter');
    await page.waitForSelector('.ask-answer__text', { timeout: 5000 });
    const answer = await page.locator('.ask-answer__text').textContent();
    if (!answer || answer.length < 15) throw new Error('empty answer');
    await page.screenshot({ path: `${shotDir}/t02-ask-relay.png` });
    await page.keyboard.press('Escape');
  });

  // 7. simulate incoming
  await step('simulate review email routes to review', async () => {
    await page.click('.demo-trigger');
    await page.waitForTimeout(250);
    await page.click('.simulate__option:has-text("An ambiguous intro")');
    await page.waitForTimeout(900);
    if (!/\/app\/inbox\/t-sim-/.test(page.url())) throw new Error('did not open simulated thread');
    const id = page.url().split('/').pop();
    const t = await getJson('/threads/' + id);
    if (t.thread.ai.classification !== 'review') throw new Error('got ' + t.thread.ai.classification);
  });

  // 8. board drag
  await step('board drag reclassifies', async () => {
    await page.goto(base + '/app/board', { waitUntil: 'networkidle' });
    const card = page.locator('.board-col--assistant .board-card').first();
    const subject = await card.locator('.board-card__subject').textContent();
    const target = page.locator('.board-col--client');
    const from = await card.boundingBox();
    const to = await target.boundingBox();
    await page.mouse.move(from.x + from.width / 2, from.y + 40);
    await page.mouse.down();
    await page.waitForTimeout(200);
    await page.mouse.move(to.x + to.width / 2, to.y + 160, { steps: 14 });
    await page.waitForTimeout(250);
    await page.mouse.up();
    await page.waitForTimeout(900);
    const threads = (await getJson('/bootstrap')).threads;
    const moved = threads.find((t) => t.subject === subject);
    if (!moved || moved.ai.classification !== 'client') throw new Error('drag did not move: ' + moved?.ai?.classification);
    await page.screenshot({ path: `${shotDir}/t03-board-after-drag.png` });
  });

  // 9. accounts sync / disconnect / reconnect
  await step('account sync, disconnect, reconnect', async () => {
    await page.goto(base + '/app/accounts', { waitUntil: 'networkidle' });
    await page.click('.account-card button:has-text("Sync now"), button:has-text("Sync now")');
    await page.waitForTimeout(700);
    await page.locator('button:has-text("Disconnect")').first().click();
    await page.waitForTimeout(600);
    let accts = (await getJson('/bootstrap')).accounts;
    if (!accts.some((a) => a.status === 'disconnected')) throw new Error('no disconnected account');
    await page.locator('button:has-text("Reconnect")').first().click();
    await page.waitForTimeout(600);
    accts = (await getJson('/bootstrap')).accounts;
    if (accts.some((a) => a.status === 'disconnected')) throw new Error('account not reconnected');
  });

  // 10. client marks handled
  await step('client marks thread handled', async () => {
    await page.goto(base + '/client?client=c-aarav', { waitUntil: 'networkidle' });
    const card = page.locator('.client-card').first();
    const subject = await card.locator('.client-card__subject').textContent();
    await card.locator('a:has-text("Open conversation")').click();
    await page.waitForSelector('.cthread-actions');
    await page.click('button:has-text("Mark as handled")');
    await page.waitForURL(/\/client\?/, { timeout: 5000 });
    const threads = (await getJson('/bootstrap')).threads;
    const t = threads.find((x) => x.subject === subject);
    if (!t) throw new Error('thread not found');
    if (t.status !== 'done' || t.clientAction?.type !== 'handled') throw new Error('handled not reflected');
  });

  // 11. client hands over
  await step('client hands thread to assistant', async () => {
    await page.goto(base + '/client?client=c-aarav', { waitUntil: 'networkidle' });
    const card = page.locator('.client-card').first();
    const subject = await card.locator('.client-card__subject').textContent();
    await card.locator('button:has-text("Ask Ananya to handle")').click();
    await page.waitForSelector('.modal textarea, textarea');
    await page.fill('textarea', 'Please take this one. I am traveling.');
    await page.click('.modal button:has-text("Hand this to Ananya")');
    await page.waitForTimeout(800);
    const threads = (await getJson('/bootstrap')).threads;
    const t = threads.find((x) => x.subject === subject);
    if (t.ai.classification !== 'assistant' || t.clientAction?.type !== 'takeover')
      throw new Error('handover not reflected');
    await page.screenshot({ path: `${shotDir}/t04-client-after-handover.png` });
  });

  console.log('\npage errors:', errors);
  const failed = results.filter((r) => r[0] === 'FAIL');
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  await browser.close();
  process.exit(failed.length ? 1 : 0);
})();
