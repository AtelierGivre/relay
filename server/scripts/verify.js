import { store } from '../src/store.js';

const rows = store.threads.map((t) => ({
  id: t.id,
  cls: t.ai.classification,
  conf: t.ai.confidence,
  wait: t.ai.waitingOn || '-',
  client: t.clientId.slice(2),
  subject: t.subject.slice(0, 46),
  signals: t.ai.signals.join(' | '),
  scores: `a${t.ai.candidates.assistant}/c${t.ai.candidates.client}/n${t.ai.candidates.none}`,
}));
for (const r of rows) {
  console.log(`${r.id.padEnd(6)} ${r.cls.padEnd(9)} ${String(r.conf).padEnd(5)} wait=${String(r.wait).padEnd(4)} ${r.client.padEnd(6)} ${r.subject.padEnd(48)} ${r.scores.padEnd(14)} ${r.signals}`);
}
const counts = rows.reduce((a, r) => ((a[r.cls] = (a[r.cls] || 0) + 1), a), {});
console.log('\ncounts', counts, 'total', rows.length);
console.log('\nReasons:');
for (const t of store.threads) console.log(`- ${t.id}: ${t.ai.reason}`);
