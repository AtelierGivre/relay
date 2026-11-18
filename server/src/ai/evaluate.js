import { classify, ROUTING_POLICY } from './engine.js';
import { EVAL_CASES, EVAL_CLIENTS } from './eval-set.js';

const CLASSES = ['assistant', 'client', 'none', 'review'];

function emptyMatrix() {
  return Object.fromEntries(CLASSES.map((expected) => [expected, Object.fromEntries(CLASSES.map((p) => [p, 0]))]));
}

const clamp = (value, fallback) =>
  Number.isFinite(value) ? Math.min(20, Math.max(0, value)) : fallback;

export function evaluateRouter(options = {}) {
  const policy = {
    minEvidence: clamp(options.minEvidence, ROUTING_POLICY.minEvidence),
    minMargin: clamp(options.minMargin, ROUTING_POLICY.minMargin),
  };

  const confusion = emptyMatrix();
  const support = Object.fromEntries(CLASSES.map((c) => [c, 0]));
  const failures = [];
  let correct = 0;

  for (const item of EVAL_CASES) {
    const client = EVAL_CLIENTS[item.client];
    if (!client) continue;
    const thread = {
      subject: item.subject,
      messages: [
        {
          id: item.id,
          direction: 'in',
          from: item.from,
          to: [{ name: client.name, email: client.email }],
          at: item.at,
          body: item.body,
        },
      ],
    };
    const ai = classify(thread, client, policy);
    support[item.expected] += 1;
    confusion[item.expected][ai.classification] += 1;
    if (ai.classification === item.expected) {
      correct += 1;
    } else {
      failures.push({
        id: item.id,
        subject: item.subject,
        client: client.name,
        expected: item.expected,
        predicted: ai.classification,
        confidence: ai.confidence,
        margin: ai.margin,
        signals: ai.signals.slice(0, 2),
      });
    }
  }

  const perClass = CLASSES.map((cls) => {
    const truePositives = confusion[cls][cls];
    const predicted = CLASSES.reduce((sum, expected) => sum + confusion[expected][cls], 0);
    const precision = predicted ? truePositives / predicted : 0;
    const recall = support[cls] ? truePositives / support[cls] : 0;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    return { cls, support: support[cls], predicted, precision, recall, f1 };
  });

  const total = EVAL_CASES.length;
  const reviewRate = CLASSES.reduce((sum, expected) => sum + confusion[expected].review, 0) / total;

  return {
    total,
    correct,
    accuracy: total ? correct / total : 0,
    reviewRate,
    policy,
    classes: CLASSES,
    confusion,
    perClass,
    failures,
  };
}
