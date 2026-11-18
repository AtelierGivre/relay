const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const EXEC = 'C:/Users/aditi/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe';
const BASE = 'http://localhost:5173';
const OUT = 'C:/Users/aditi/.qoder/app/chat-session-visualizations/5c8080c1-d8e6-44e3-96ed-c5ae2ae1d163/visualizations';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const shots = [
  { id: 'landing', url: '/', w: 1440, h: 900, label: 'Landing', note: 'The new hero, built from the reference', wait: 1400 },
  { id: 'overview', url: '/app', w: 1440, h: 900, label: 'Assistant overview', note: 'Today, counts, next moves, deadlines' },
  { id: 'inbox', url: '/app/inbox/t-a1', w: 1440, h: 900, label: 'Conversation view', note: 'Brief, route, reasoning, thread' },
  { id: 'board', url: '/app/board', w: 1440, h: 900, label: 'Responsibility board', note: 'Four routes, drag or use the card menu' },
  { id: 'review', url: '/app/review', w: 1440, h: 900, label: 'Needs review', note: 'Low confidence threads ask a human' },
  { id: 'client', url: '/client', w: 1440, h: 900, label: 'Client view', note: 'Only what needs the client' },
  { id: 'accounts', url: '/app/accounts', w: 1440, h: 900, label: 'Connections and sync', note: 'Mailboxes, scopes, token renewal' },
  { id: 'connect', url: '/connect', w: 1440, h: 900, label: 'Onboarding', note: 'Account, provider, consent, first sync' },
  { id: 'm-landing', url: '/', w: 390, h: 844, label: 'Landing on phone', note: 'One column, same hierarchy', mobile: true, wait: 1400 },
  { id: 'm-client', url: '/client', w: 390, h: 844, label: 'Client view on phone', note: 'Reads like a message, not a dashboard', mobile: true },
  { id: 'm-inbox', url: '/app/inbox', w: 390, h: 844, label: 'Inbox on phone', note: 'List, detail, bottom tabs', mobile: true },
];

(async () => {
  try { await fetch('http://127.0.0.1:4000/api/reset', { method: 'POST' }); } catch {}
  const browser = await chromium.launch({ executablePath: EXEC });
  const data = [];
  for (const s of shots) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(`${BASE}${s.url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(s.wait || 900);
    const file = path.join(OUT, `${s.id}.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 50 });
    data.push({ ...s, b64: fs.readFileSync(file).toString('base64') });
    console.log(s.id, Math.round(fs.statSync(file).size / 1024) + 'kb');
    await ctx.close();
  }
  await browser.close();

  const card = (s, cls) => `
    <figure class="shot ${cls}">
      <div class="shot__frame"><img src="data:image/jpeg;base64,${s.b64}" alt="${s.label}" /></div>
      <figcaption><strong>${s.label}</strong><span>${s.note}</span></figcaption>
    </figure>`;

  const desktop = data.filter((s) => !s.mobile);
  const mobile = data.filter((s) => s.mobile);

  const html = `<div class="wrap">
  <style>
    .wrap { background: #f6f4ef; color: #1c1f1c; border: 1px solid #e2ddd2; border-radius: 22px; padding: 34px 34px 40px; font-family: -apple-system, "Segoe UI", Inter, sans-serif; }
    .wrap * { box-sizing: border-box; }
    .head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; padding-bottom: 20px; border-bottom: 1px solid #ddd7cc; margin-bottom: 28px; }
    .eyebrow { font-size: 11px; font-weight: 650; letter-spacing: .12em; text-transform: uppercase; color: #1f5b49; margin-bottom: 10px; }
    h1 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-weight: 400; font-size: clamp(30px, 4vw, 44px); letter-spacing: -.02em; }
    .lede { margin: 8px 0 0; max-width: 560px; font-size: 14px; line-height: 1.6; color: #5a5f57; }
    .meta { font-size: 11px; color: #7a7e75; text-align: right; line-height: 1.7; }
    .meta b { display: block; color: #1c1f1c; font-weight: 600; font-size: 12px; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 30px; }
    figure { margin: 0; }
    .shot__frame { border-radius: 16px; overflow: hidden; border: 1px solid #dcd6ca; background: #fff; box-shadow: 0 18px 40px -26px rgba(40,30,15,.35); }
    .shot__frame img { display: block; width: 100%; height: auto; }
    figcaption { display: flex; align-items: baseline; gap: 10px; padding: 11px 2px 0; flex-wrap: wrap; }
    figcaption strong { font-size: 13px; font-weight: 600; }
    figcaption span { font-size: 12px; color: #7a7e75; }
    .mob { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: start; }
    .mob .shot__frame { border-radius: 22px; }
    h2 { font-size: 11px; font-weight: 650; letter-spacing: .12em; text-transform: uppercase; color: #7a7e75; margin: 34px 0 16px; padding-top: 24px; border-top: 1px solid #ddd7cc; }
    @media (max-width: 720px) { .wrap { padding: 22px 16px 28px; } .mob { grid-template-columns: 1fr; } .meta { text-align: left; } }
  </style>
  <div class="head">
    <div>
      <div class="eyebrow">Relay, screen by screen</div>
      <h1>What the site looks like today</h1>
      <p class="lede">The landing page follows the insurance reference. The app keeps the same warm paper, serif headlines, and green, clay, and violet route colors.</p>
    </div>
    <div class="meta"><b>11 captures</b>Desktop at 1440<br />Phone at 390<br />Live data from the API</div>
  </div>
  <div class="grid">${desktop.map((s) => card(s, '')).join('')}</div>
  <h2>On a phone</h2>
  <div class="mob">${mobile.map((s) => card(s, '')).join('')}</div>
</div>`;

  const file = path.join(OUT, 'relay-gallery.html');
  fs.writeFileSync(file, html);
  console.log('gallery', Math.round(fs.statSync(file).size / 1024) + 'kb');
})().catch((e) => { console.error(e); process.exit(1); });
