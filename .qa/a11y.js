const { chromium } = require('playwright-core');

const EXEC =
  'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'http://localhost:5173';

let failures = 0;

async function step(name, fn) {
  try {
    await fn();
    console.log('PASS', name);
  } catch (err) {
    failures += 1;
    console.log('FAIL', name, '-', err.message);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await step('skip link is the first tab stop and jumps to main', async () => {
    await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    const cls = await page.evaluate(() => document.activeElement.className);
    assert(cls.includes('skip-link'), `first tab stop was "${cls}"`);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    const focusId = await page.evaluate(() => document.activeElement.id);
    assert(focusId === 'main', `focus moved to "${focusId}"`);
  });

  await step('document titles follow the route', async () => {
    await page.goto(`${BASE}/app/inbox`, { waitUntil: 'networkidle' });
    assert((await page.title()) === 'Inbox · Relay', `inbox title was ${await page.title()}`);
    await page.goto(`${BASE}/app/lab`, { waitUntil: 'networkidle' });
    assert((await page.title()) === 'Routing lab · Relay', `lab title was ${await page.title()}`);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    assert((await page.title()).startsWith('Relay:'), `landing title was ${await page.title()}`);
  });

  await step('popover triggers expose their expanded state', async () => {
    await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
    const trigger = page.locator('button[aria-haspopup="menu"]', { hasText: 'Simulate' });
    assert((await trigger.getAttribute('aria-expanded')) === 'false', 'menu started expanded');
    await trigger.click();
    await page.waitForTimeout(150);
    assert((await trigger.getAttribute('aria-expanded')) === 'true', 'menu did not report expanded');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    assert((await trigger.getAttribute('aria-expanded')) === 'false', 'Escape did not collapse the menu');
  });

  await step('move dialog is labelled, traps tab and restores focus', async () => {
    await page.goto(`${BASE}/app/board`, { waitUntil: 'networkidle' });
    const opener = page.locator('.board-card__move').first();
    await opener.click();
    const dialog = page.locator('[role="dialog"]');
    await dialog.waitFor();
    await page.waitForTimeout(120);

    const labelled = await dialog.getAttribute('aria-labelledby');
    assert(labelled, 'dialog has no aria-labelledby');
    const heading = await page.locator(`[id="${labelled}"]`).innerText();
    assert(/who should reply/i.test(heading), `dialog label was "${heading}"`);

    const inside = await page.evaluate(() => {
      const el = document.querySelector('[role="dialog"]');
      return Boolean(el && el.contains(document.activeElement));
    });
    assert(inside, 'focus was not moved into the dialog');

    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('[role="dialog"] button')];
      buttons[buttons.length - 1].focus();
    });
    await page.keyboard.press('Tab');
    const wrapped = await page.evaluate(() =>
      document.activeElement.getAttribute('aria-label')?.toLowerCase(),
    );
    assert(wrapped === 'close', `Tab from the last control went to "${wrapped}"`);

    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    await page.waitForTimeout(120);
    const restored = await page.evaluate(() => document.activeElement.className);
    assert(restored.includes('board-card__move'), `focus returned to "${restored}"`);
  });

  await step('thread actions have accessible names', async () => {
    await page.goto(`${BASE}/app/inbox/t-a1`, { waitUntil: 'networkidle' });
    for (const name of [/ask relay about this thread/i, /star conversation|remove star/i, /mark as (un)?read/i, /archive conversation/i]) {
      const count = await page.getByRole('button', { name }).count();
      assert(count > 0, `no button named ${name}`);
    }
    const reply = page.getByRole('textbox', { name: 'Reply text' });
    await page.getByRole('button', { name: /write manually/i }).click();
    assert(await reply.isVisible(), 'reply textbox is not exposed with its label');
  });

  const pages = ['/app', '/app/inbox', '/app/board', '/app/review', '/app/lab', '/app/eval', '/app/accounts', '/client', '/connect'];
  for (const path of pages) {
    await step(`${path} has no unnamed controls`, async () => {
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const unnamed = await page.evaluate(() => {
        const text = (el) => (el.innerText || el.textContent || '').trim();
        const name = (el) =>
          (el.getAttribute('aria-label') || el.getAttribute('title') || text(el)).trim();
        const controls = [...document.querySelectorAll('button, a[href], [role="button"]')];
        const badControls = controls
          .filter((el) => !name(el))
          .map((el) => el.className || el.tagName);

        const fields = [...document.querySelectorAll('input:not([type="hidden"]), select, textarea')];
        const badFields = fields
          .filter((el) => {
            if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return false;
            if (el.closest('label')) return false;
            if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return false;
            return true;
          })
          .map((el) => el.className || el.tagName);

        return [...badControls, ...badFields];
      });
      assert(unnamed.length === 0, `unnamed: ${unnamed.join(', ')}`);
    });
  }

  console.log(`\npage errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  console.log(failures === 0 ? '\nall accessibility checks passed' : `\n${failures} checks failed`);

  await browser.close();
  process.exit(failures === 0 && errors.length === 0 ? 0 : 1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
