import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { resetStore } from '../src/store.js';

let server;
let base;

before(async () => {
  const app = createApp({ serveStatic: false, logRequests: false });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

beforeEach(() => resetStore());

async function call(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => null);
  return { res, body };
}

const json = (method, payload) => ({ method, body: JSON.stringify(payload) });

test('bootstrap returns a hydrated workspace', async () => {
  const { res, body } = await call('/api/bootstrap');
  assert.equal(res.status, 200);
  assert.ok(body.user.email);
  assert.ok(body.clients.length >= 3);
  assert.ok(body.threads.length > 10);
  for (const thread of body.threads) {
    assert.ok(['assistant', 'client', 'none', 'review'].includes(thread.ai.classification));
    assert.equal(typeof thread.ai.confidence, 'number');
    assert.ok(thread.messages.length > 0);
  }
});

test('every response carries the security headers', async () => {
  const { res } = await call('/api/health');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('unknown conversations and routes return JSON 404s', async () => {
  const missingThread = await call('/api/threads/t-nope');
  assert.equal(missingThread.res.status, 404);
  assert.match(missingThread.body.error, /not found/i);

  const missingRoute = await call('/api/nope');
  assert.equal(missingRoute.res.status, 404);
  assert.equal(missingRoute.body.error, 'Unknown API route');

  const missingPage = await call('/nope');
  assert.equal(missingPage.res.status, 404);
  assert.equal(missingPage.body.error, 'Not found');
});

test('classification override is recorded and rejects unknown routes', async () => {
  const { res, body } = await call('/api/threads/t-a1', json('PATCH', { classification: 'review' }));
  assert.equal(res.status, 200);
  assert.equal(body.thread.ai.classification, 'review');
  assert.equal(body.thread.ai.manual, true);
  assert.match(body.thread.events[0].text, /changed the reply responsibility/i);

  const bad = await call('/api/threads/t-a1', json('PATCH', { classification: 'nobody' }));
  assert.equal(bad.res.status, 400);
  assert.equal(bad.body.error, 'Unknown classification');
});

test('thread patches validate their payload', async () => {
  const empty = await call('/api/threads/t-a1', json('PATCH', {}));
  assert.equal(empty.res.status, 400);
  assert.equal(empty.body.error, 'Nothing to update');

  const badStatus = await call('/api/threads/t-a1', json('PATCH', { status: 'closed' }));
  assert.equal(badStatus.res.status, 400);
  assert.equal(badStatus.body.error, 'Unknown status');

  const starred = await call('/api/threads/t-a1', json('PATCH', { starred: true }));
  assert.equal(starred.res.status, 200);
  assert.equal(starred.body.thread.starred, true);
});

test('replies are trimmed, validated and appended', async () => {
  const empty = await call('/api/threads/t-a1/reply', json('POST', { body: ' ' }));
  assert.equal(empty.res.status, 400);

  const long = await call('/api/threads/t-a1/reply', json('POST', { body: 'x'.repeat(5001) }));
  assert.equal(long.res.status, 400);

  const ok = await call('/api/threads/t-a1/reply', json('POST', { body: '  On it, thank you.  ' }));
  assert.equal(ok.res.status, 200);
  const last = ok.body.thread.messages.at(-1);
  assert.equal(last.direction, 'out');
  assert.equal(last.body, 'On it, thank you.');
  assert.equal(ok.body.thread.ai.waitingOn, 'them');
});

test('drafts respect the route and the tone', async () => {
  const client = await call('/api/threads/t-a1/draft', json('POST', {}));
  assert.equal(client.res.status, 200);
  assert.match(client.body.draft.subject, /^Re: /);
  assert.ok(client.body.draft.body.length > 40);

  const brief = await call('/api/threads/t-a1/draft', json('POST', { tone: 'brief' }));
  assert.equal(brief.body.draft.tone, 'brief');
  assert.ok(brief.body.draft.body.length < client.body.draft.body.length);

  const fallback = await call('/api/threads/t-a1/draft', json('POST', { tone: 'shouty' }));
  assert.equal(fallback.body.draft.tone, 'professional');
});

test('follow-up drafts are only offered while waiting on the client', async () => {
  const waiting = await call('/api/threads/t-z2/follow-up', json('POST', {}));
  assert.equal(waiting.res.status, 200);
  assert.match(waiting.body.draft.body, /invoice #4471/);
  assert.match(waiting.body.draft.body, /Zoya/);
  assert.equal(typeof waiting.body.daysWaiting, 'number');
  assert.ok(waiting.body.note);

  const notWaiting = await call('/api/threads/t-a1/follow-up', json('POST', {}));
  assert.equal(notWaiting.res.status, 400);
  assert.match(notWaiting.body.error, /waiting on a reply/i);
});

test('client actions validate and update the thread', async () => {
  const bad = await call('/api/threads/t-a1/client-action', json('POST', { type: 'ignore' }));
  assert.equal(bad.res.status, 400);
  assert.equal(bad.body.error, 'Unknown action');

  const handled = await call(
    '/api/threads/t-a1/client-action',
    json('POST', { type: 'handled', note: 'All set, thanks.' }),
  );
  assert.equal(handled.res.status, 200);
  assert.equal(handled.body.thread.status, 'done');
  assert.equal(handled.body.thread.clientAction.type, 'handled');

  const takeover = await call('/api/threads/t-a2/client-action', json('POST', { type: 'takeover' }));
  assert.equal(takeover.res.status, 200);
  assert.equal(takeover.body.thread.ai.classification, 'assistant');
  assert.equal(takeover.body.thread.ai.waitingOn, 'us');
});

test('simulation rejects unknown kinds and returns a routed thread', async () => {
  const bad = await call('/api/simulate', json('POST', { kind: 'chaos' }));
  assert.equal(bad.res.status, 400);

  const badClient = await call('/api/simulate', json('POST', { kind: 'client', clientId: 'c-nope' }));
  assert.equal(badClient.res.status, 400);

  const ok = await call('/api/simulate', json('POST', { kind: 'client', clientId: 'c-aarav' }));
  assert.equal(ok.res.status, 201);
  assert.equal(ok.body.thread.clientId, 'c-aarav');
  assert.ok(ok.body.thread.ai.evidence.length > 0);
  assert.ok(ok.body.thread.events[0].text.includes('routed'));
});

test('ask answers from the mailbox and rejects empty questions', async () => {
  const empty = await call('/api/ask', json('POST', { query: '   ' }));
  assert.equal(empty.res.status, 400);

  const waiting = await call('/api/ask', json('POST', { query: 'What am I waiting on?' }));
  assert.equal(waiting.res.status, 200);
  assert.equal(waiting.body.kind, 'waiting');
  assert.ok(Array.isArray(waiting.body.threads));

  const tooLong = await call('/api/ask', json('POST', { query: 'a'.repeat(501) }));
  assert.equal(tooLong.res.status, 400);
});

test('mailbox management validates provider and address', async () => {
  const badStatus = await call('/api/accounts/acc-aarav', json('PATCH', { status: 'paused' }));
  assert.equal(badStatus.res.status, 400);

  const badProvider = await call('/api/accounts', json('POST', { provider: 'yahoo', address: 'a@b.co' }));
  assert.equal(badProvider.res.status, 400);

  const badAddress = await call('/api/accounts', json('POST', { provider: 'google', address: 'not-an-email' }));
  assert.equal(badAddress.res.status, 400);

  const created = await call('/api/accounts', json('POST', { provider: 'google', address: 'ops@relay.studio' }));
  assert.equal(created.res.status, 201);
  assert.equal(created.body.account.provider, 'google');
  assert.ok(created.body.accounts.some((a) => a.address === 'ops@relay.studio'));

  const sync = await call('/api/accounts/acc-aarav/sync', { method: 'POST' });
  assert.equal(sync.res.status, 200);
});

test('incoming messages validate the body and re-run routing', async () => {
  const empty = await call('/api/threads/t-a1/messages', json('POST', { body: '' }));
  assert.equal(empty.res.status, 400);

  const ok = await call(
    '/api/threads/t-a1/messages',
    json('POST', {
      fromName: 'Priya Nair',
      fromEmail: 'priya@meridian.vc',
      body: 'Could you confirm the updated term sheet before Thursday?',
    }),
  );
  assert.equal(ok.res.status, 201);
  assert.equal(ok.body.thread.unread, true);
  const last = ok.body.thread.messages.at(-1);
  assert.equal(last.from.email, 'priya@meridian.vc');
  assert.ok(ok.body.thread.messages.length > 1);
});

test('malformed JSON returns a JSON 400, not an HTML page', async () => {
  const res = await fetch(`${base}/api/ask`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{"query":',
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /valid JSON/i);
});

test('reset restores the seeded workspace', async () => {
  await call('/api/threads/t-a1', json('PATCH', { classification: 'review' }));
  const reset = await call('/api/reset', { method: 'POST' });
  assert.equal(reset.res.status, 200);

  const { body } = await call('/api/threads/t-a1');
  assert.notEqual(body.thread.ai.manual, true);
  assert.ok(body.thread.ai.classification);
});

test('the evaluation endpoint scores the labeled suite', async () => {
  const { res, body } = await call('/api/evaluate', json('POST', {}));
  assert.equal(res.status, 200);
  assert.equal(body.total, 51);
  assert.ok(body.accuracy >= 0.9);
  assert.equal(body.correct, body.total - body.failures.length);
  assert.deepEqual(Object.keys(body.confusion).sort(), ['assistant', 'client', 'none', 'review']);

  const strict = await call('/api/evaluate', json('POST', { minEvidence: 12 }));
  assert.equal(strict.res.status, 200);
  assert.ok(strict.body.reviewRate > body.reviewRate);
});
