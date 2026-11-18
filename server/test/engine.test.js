import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, ROUTING_POLICY, RULE_COUNT } from '../src/ai/engine.js';
import { evaluateRouter } from '../src/ai/evaluate.js';
import { EVAL_CASES, EVAL_CLIENTS } from '../src/ai/eval-set.js';

const client = { firstName: 'Aarav', name: 'Aarav Shah', company: 'Northwind Labs' };

const message = (subject, body, from = { name: 'Priya Nair', email: 'priya@meridian.com' }) => ({
  subject,
  messages: [
    {
      id: 'm1',
      direction: 'in',
      from,
      to: [],
      at: '2026-11-17T10:00:00.000Z',
      body,
    },
  ],
  events: [],
  deadlines: [],
});

const TERM_SHEET = message(
  'Re: Series A term sheet',
  'Hi Aarav,\n\nAttached is the term sheet with the pre-money valuation, the exclusivity clause and the board seat. We need your approval before signing.\n\nBest,\nPriya',
);

const NEWSLETTER = message(
  'Your weekly workspace digest',
  'Here is what changed in your workspace this week: 12 pages updated. You are receiving this because you are subscribed to weekly digests. Unsubscribe | View in browser.',
  { name: 'Notion', email: 'notifications@notion.so' },
);

const SCHEDULE = message(
  'Reschedule: shoot prep call',
  'Hi Ananya,\n\nCould we move the prep call to 4:30pm, or 10:00am the next morning? Please let me know which works.\n\nThanks,\nNeha',
  { name: 'Neha · Studio Ops', email: 'ops@studio-calendar.in' },
);

const AMBIGUOUS = message(
  'Quick note',
  'Hi both,\n\nA founder in our portfolio is exploring a partnership that might overlap. No rush, just let me know.',
  { name: 'Aditi Sharma', email: 'aditi@commonroom.vc' },
);

test('a term sheet routes to the client', () => {
  const result = classify(TERM_SHEET, client);
  assert.equal(result.classification, 'client');
  assert.ok(result.confidence >= 0.6);
});

test('a newsletter is filed with no reply needed', () => {
  assert.equal(classify(NEWSLETTER, client).classification, 'none');
});

test('a scheduling request routes to the assistant', () => {
  assert.equal(classify(SCHEDULE, client).classification, 'assistant');
});

test('a weak message goes to review instead of being guessed', () => {
  const result = classify(AMBIGUOUS, client);
  assert.equal(result.classification, 'review');
  assert.ok(result.confidence <= 0.58);
});

test('raising the evidence floor sends a clear route to review', () => {
  const relaxed = classify(SCHEDULE, client);
  const strict = classify(SCHEDULE, client, { minEvidence: relaxed.candidates.assistant + 1 });
  assert.equal(relaxed.classification, 'assistant');
  assert.equal(strict.classification, 'review');
});

test('a wider required margin also forces review', () => {
  const strict = classify(SCHEDULE, client, { minMargin: 50 });
  assert.equal(strict.classification, 'review');
});

test('evidence weights add up to the candidate scores', () => {
  const result = classify(TERM_SHEET, client);
  const sums = { assistant: 0, client: 0, none: 0 };
  for (const hit of result.evidence) sums[hit.cls] += hit.w;
  for (const key of Object.keys(sums)) {
    assert.equal(Number(sums[key].toFixed(1)), result.candidates[key]);
  }
});

test('the same message always produces the same route', () => {
  const a = classify(TERM_SHEET, client);
  const b = classify(TERM_SHEET, client);
  assert.equal(a.classification, b.classification);
  assert.equal(a.confidence, b.confidence);
  assert.equal(a.margin, b.margin);
  assert.deepEqual(a.scores, b.scores);
  assert.deepEqual(a.evidence, b.evidence);
});

test('the policy defaults and rule count are exposed for the UI', () => {
  const result = classify(TERM_SHEET, client);
  assert.deepEqual(result.policy, ROUTING_POLICY);
  assert.equal(ROUTING_POLICY.minEvidence, 4.5);
  assert.equal(ROUTING_POLICY.minMargin, 1.6);
  assert.ok(RULE_COUNT >= 20);
});

test('the evaluation suite accounts for every labeled case', () => {
  const report = evaluateRouter();
  assert.equal(report.total, 51);
  assert.equal(report.correct + report.failures.length, report.total);
  assert.equal(report.perClass.length, 4);
  const cells = Object.values(report.confusion).reduce(
    (sum, row) => sum + Object.values(row).reduce((a, b) => a + b, 0),
    0,
  );
  assert.equal(cells, report.total);
  assert.deepEqual(report.policy, ROUTING_POLICY);
});

test('the default policy clears the release gate', () => {
  const report = evaluateRouter();
  assert.ok(report.accuracy >= 0.9);
  assert.ok(report.failures.every((miss) => miss.predicted === 'review'));
});

test('evaluation is deterministic and follows policy overrides', () => {
  assert.deepEqual(evaluateRouter(), evaluateRouter());

  const base = evaluateRouter();
  const strict = evaluateRouter({ minEvidence: 12 });
  assert.ok(strict.reviewRate > base.reviewRate);
  assert.ok(strict.accuracy <= base.accuracy);
});

test('policy inputs are clamped before they reach the router', () => {
  assert.equal(evaluateRouter({ minEvidence: 999 }).policy.minEvidence, 20);
  assert.equal(evaluateRouter({ minEvidence: 'wide' }).policy.minEvidence, ROUTING_POLICY.minEvidence);
  assert.equal(evaluateRouter({ minMargin: -4 }).policy.minMargin, 0);
});

test('the labeled suite is complete and balanced', () => {
  const ids = new Set(EVAL_CASES.map((item) => item.id));
  assert.equal(ids.size, EVAL_CASES.length);

  const counts = {};
  for (const item of EVAL_CASES) {
    assert.ok(EVAL_CLIENTS[item.client], `${item.id} references a known client`);
    assert.ok(item.subject && item.body, `${item.id} has a subject and body`);
    assert.ok(item.from?.name && item.from?.email, `${item.id} has a sender`);
    assert.ok(
      ['assistant', 'client', 'none', 'review'].includes(item.expected),
      `${item.id} has a known label`,
    );
    counts[item.expected] = (counts[item.expected] || 0) + 1;
  }

  assert.deepEqual(counts, { assistant: 13, client: 13, none: 13, review: 12 });
});
