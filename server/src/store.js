import { user, clients, accounts, threads as seedThreads } from './seed.js';
import { classify } from './ai/engine.js';

const randomUUID = () => globalThis.crypto.randomUUID();

const clientById = (id) => clients.find((c) => c.id === id);

function lastMessageAt(thread) {
  return thread.messages.reduce((latest, m) => (m.at > latest ? m.at : latest), thread.messages[0].at);
}

function withDerived(thread) {
  const client = clientById(thread.clientId);
  const ai = classify(thread, client);
  const tags = new Set(thread.tags || []);
  if ((thread.deadlines || []).some((d) => d.kind === 'meeting')) tags.add('Meetings');
  if (ai.classification === 'client' && thread.starred) tags.add('Important');
  return {
    ...thread,
    ai,
    tags: [...tags],
    lastActivityAt: lastMessageAt(thread),
    events: thread.events || [],
    clientAction: thread.clientAction || null,
  };
}

function initialState() {
  return {
    user,
    clients: clients.map((c) => ({ ...c })),
    accounts: accounts.map((a) => ({ ...a })),
    threads: seedThreads.map((t) => withDerived(structuredClone(t))),
    simulations: 0,
  };
}

export const store = initialState();

export function resetStore() {
  Object.assign(store, initialState());
}

export function hydrate(thread) {
  return withDerived(thread);
}

export function getThread(id) {
  return store.threads.find((t) => t.id === id);
}

export function recomputeThread(thread, { reason = 'new message' } = {}) {
  const client = clientById(thread.clientId);
  const before = thread.ai?.classification;
  const ai = classify(thread, client);
  if (before && before !== ai.classification && !thread.ai?.manual) {
    ai.previousClassification = before;
    thread.events.unshift({
      id: randomUUID(),
      at: new Date().toISOString(),
      kind: 'ai',
      text: `Relay re-checked this conversation after ${reason} and moved it from ${labelOf(
        before,
      )} to ${labelOf(ai.classification)}.`,
    });
  }
  thread.ai = ai;
  thread.lastActivityAt = lastMessageAt(thread);
  return thread;
}

export function labelOf(classification) {
  return (
    {
      assistant: 'Assistant to reply',
      client: 'Client to reply',
      none: 'No reply needed',
      review: 'Needs review',
    }[classification] || classification
  );
}

export function overrideClassification(thread, classification) {
  thread.ai = {
    ...thread.ai,
    classification,
    confidence: 1,
    manual: true,
    signals: ['Set manually by Ananya'],
    reason: 'Set by hand. Re-run the analysis to see what Relay would do.',
    previousClassification: thread.ai.classification,
    updatedAt: new Date().toISOString(),
  };
  thread.events.unshift({
    id: randomUUID(),
    at: new Date().toISOString(),
    kind: 'system',
    text: `Ananya changed the reply responsibility to ${labelOf(classification)}.`,
  });
  return thread;
}

export function appendReply(thread, body) {
  thread.messages.push({
    id: randomUUID(),
    direction: 'out',
    from: { name: store.user.name, email: store.user.email },
    to: [{ name: clientById(thread.clientId).name, email: clientById(thread.clientId).email }],
    at: new Date().toISOString(),
    body,
    sentByAssistant: true,
  });
  thread.ai = { ...thread.ai, waitingOn: 'them', updatedAt: new Date().toISOString() };
  thread.lastActivityAt = new Date().toISOString();
  thread.events.unshift({
    id: randomUUID(),
    at: new Date().toISOString(),
    kind: 'sent',
    text: 'Reply approved and sent from Relay.',
  });
  return thread;
}

export function applyClientAction(thread, type, note) {
  const client = clientById(thread.clientId);
  thread.clientAction = { type, at: new Date().toISOString(), note: note || '' };
  if (type === 'handled') {
    thread.status = 'done';
    thread.events.unshift({
      id: randomUUID(),
      at: new Date().toISOString(),
      kind: 'client',
      text: `${client.firstName} marked this handled from the client view.`,
    });
  } else {
    thread.ai = {
      ...thread.ai,
      classification: 'assistant',
      manual: true,
      confidence: 1,
      signals: ['Client asked the assistant to take over'],
      reason: `${client.firstName} asked Ananya to handle this reply.`,
      waitingOn: 'us',
      updatedAt: new Date().toISOString(),
    };
    thread.events.unshift({
      id: randomUUID(),
      at: new Date().toISOString(),
      kind: 'client',
      text: `${client.firstName} asked Ananya to take over this reply${note ? `: “${note}”` : '.'}`,
    });
  }
  return thread;
}

/* ------------------------------------------------------------------ */
/* Demo: simulated incoming mail                                       */
/* ------------------------------------------------------------------ */

const SIMULATIONS = {
  client: (client) => ({
    from: { name: 'Ishaan Verma', email: 'ishaan@northstar-capital.com' },
    subject: 'Before we finalize: one decision for you',
    body: `Hi ${client.firstName},

Thank you for the introduction call. Before we take this further, there's one point my team can't settle without you: the final commercial terms, and how much flexibility you'd like built into the agreement.

Could you share your view by ${new Date(Date.now() + 2 * 864e5).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })}? Happy to jump on a call if that's easier. I don't want to assume on your behalf.

Best,
Ishaan`,
  }),
  assistant: (client) => ({
    from: { name: 'Neha · Studio Ops', email: 'ops@studio-calendar.in' },
    subject: 'Reschedule: shoot prep call',
    body: `Hi Ananya,

The photographer has a conflict on the original slot. Could we move the prep call to 4:30pm on the same day, or 10:00am the next morning?

Please let me know which works and I'll re-send the invite to ${client.firstName}'s team.

Thanks,
Neha`,
  }),
  none: (client) => ({
    from: { name: 'Notion', email: 'notifications@notion.so' },
    subject: 'Your weekly workspace digest',
    body: `Here's what changed in your workspace this week: 12 pages updated, 3 comments resolved.

You are receiving this because you are subscribed to weekly digests. Unsubscribe | View in browser.`,
  }),
  review: (client) => ({
    from: { name: 'Aditi Sharma', email: 'aditi@commonroom.vc' },
    subject: 'Intro: could be useful for ' + client.company,
    body: `Hi both,

A founder in our portfolio is exploring a partnership that might overlap with ${client.company}. Happy to make an intro if it's useful, or we can leave it for now.

No rush, just let me know.

Aditi`,
  }),
};

export function simulateIncoming(kind, clientId) {
  const client = clientById(clientId) || store.clients[0];
  const account = store.accounts.find((a) => a.clientId === client.id);
  const template = (SIMULATIONS[kind] || SIMULATIONS.assistant)(client);
  store.simulations += 1;
  const now = new Date().toISOString();
  const thread = {
    id: `t-sim-${store.simulations}`,
    accountId: account?.id || store.accounts[0].id,
    clientId: client.id,
    subject: template.subject,
    unread: true,
    starred: false,
    status: 'open',
    tags: [],
    deadlines: [],
    messages: [
      {
        id: randomUUID(),
        direction: 'in',
        from: template.from,
        to: [{ name: client.name, email: client.email }],
        at: now,
        body: template.body,
      },
    ],
    events: [],
    simulated: true,
  };
  const hydrated = withDerived(thread);
  hydrated.ai.signals = hydrated.ai.signals.length ? hydrated.ai.signals : ['weak or conflicting signals'];
  hydrated.events.unshift({
    id: randomUUID(),
    at: now,
    kind: 'ai',
    text: `New message analyzed on arrival and routed to ${labelOf(hydrated.ai.classification)} (${Math.round(
      hydrated.ai.confidence * 100,
    )}% confidence).`,
  });
  store.threads.unshift(hydrated);
  return hydrated;
}
