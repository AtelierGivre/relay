import {
  store,
  resetStore,
  getThread,
  recomputeThread,
  overrideClassification,
  appendReply,
  applyClientAction,
  simulateIncoming,
  labelOf,
} from './store.js';
import { draftReply, followUpReply, answerQuery, TONES } from './ai/engine.js';
export { evaluateRouter } from './ai/evaluate.js';

const CLASSES = new Set(['assistant', 'client', 'none', 'review']);
const SIMULATION_KINDS = new Set(['client', 'assistant', 'none', 'review']);
const PROVIDERS = new Set(['google', 'microsoft']);

const LIMITS = {
  reply: 5000,
  message: 10000,
  note: 280,
  ask: 500,
  address: 254,
  senderName: 120,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

const bad = (message) => new HttpError(400, message);
const missing = (message) => new HttpError(404, message);

const asText = (value) => (typeof value === 'string' ? value.trim() : '');

function within(value, max, field) {
  if (value.length > max) throw bad(`${field} must be ${max} characters or fewer.`);
  return value;
}

function threadOrThrow(id) {
  const thread = getThread(id);
  if (!thread) throw missing('Conversation not found');
  return thread;
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export function bootstrap() {
  return {
    user: store.user,
    clients: store.clients,
    accounts: store.accounts,
    threads: store.threads,
    generatedAt: new Date().toISOString(),
  };
}

export function readThread(id) {
  return threadOrThrow(id);
}

export function draftFor(id, tone) {
  const thread = threadOrThrow(id);
  const client = store.clients.find((c) => c.id === thread.clientId);
  if (!client) throw missing('Client for this conversation not found');
  const safeTone = TONES.includes(tone) ? tone : 'professional';
  return {
    draft: draftReply(thread, client, {
      tone: safeTone,
      intent: thread.ai.intent,
      classification: thread.ai.classification,
    }),
    note:
      thread.ai.classification === 'client'
        ? 'This is a holding reply. The decision itself still needs the client.'
        : 'Review before sending. Relay never sends without approval.',
  };
}

export function followUpFor(id) {
  const thread = threadOrThrow(id);
  if (thread.status !== 'open' || thread.ai.waitingOn !== 'them') {
    throw bad('Only conversations waiting on a reply can be nudged.');
  }
  const client = store.clients.find((c) => c.id === thread.clientId);
  if (!client) throw missing('Client for this conversation not found');
  const waited = Date.now() - new Date(thread.lastActivityAt).getTime();
  return {
    draft: followUpReply(thread, client),
    daysWaiting: Math.max(0, Math.floor(waited / 864e5)),
    note: 'A short follow-up on your last message. Edit it before sending.',
  };
}

export function askRelay(query, threadId) {
  const text = within(asText(query), LIMITS.ask, 'Question');
  if (!text) throw bad('Ask a question first');
  const result = answerQuery(text, store.threads, store.clients, threadId);
  return {
    ...result,
    threads: result.threadIds.map((id) => getThread(id)).filter(Boolean),
  };
}

/* ------------------------------------------------------------------ */
/* Thread changes                                                      */
/* ------------------------------------------------------------------ */

export function patchThread(id, patch = {}) {
  const thread = threadOrThrow(id);
  const { starred, unread, archived, status, classification } = patch;

  if (classification !== undefined) {
    if (!CLASSES.has(classification)) throw bad('Unknown classification');
    return overrideClassification(thread, classification);
  }

  if (status !== undefined && status !== 'open' && status !== 'done') throw bad('Unknown status');

  let recognized = false;
  if (typeof starred === 'boolean') {
    thread.starred = starred;
    recognized = true;
  }
  if (typeof unread === 'boolean') {
    thread.unread = unread;
    recognized = true;
  }
  if (typeof archived === 'boolean') {
    thread.archived = archived;
    thread.events.unshift({
      id: globalThis.crypto.randomUUID(),
      at: new Date().toISOString(),
      kind: 'system',
      text: archived ? 'Ananya archived this conversation.' : 'Ananya restored this conversation.',
    });
    recognized = true;
  }
  if (status !== undefined) {
    thread.status = status;
    thread.events.unshift({
      id: globalThis.crypto.randomUUID(),
      at: new Date().toISOString(),
      kind: 'system',
      text: status === 'done' ? 'Ananya marked this conversation complete.' : 'Ananya reopened this conversation.',
    });
    recognized = true;
  }

  if (!recognized) throw bad('Nothing to update');
  return thread;
}

export function reclassifyThread(id) {
  const thread = threadOrThrow(id);
  delete thread.ai.manual;
  recomputeThread(thread, { reason: 'a manual re-run' });
  thread.events.unshift({
    id: globalThis.crypto.randomUUID(),
    at: new Date().toISOString(),
    kind: 'ai',
    text: `Relay re-checked the full conversation: ${labelOf(thread.ai.classification)} at ${Math.round(
      thread.ai.confidence * 100,
    )}% confidence.`,
  });
  return thread;
}

export function addReply(id, body) {
  const thread = threadOrThrow(id);
  const text = within(asText(body), LIMITS.reply, 'Reply');
  if (text.length < 2) throw bad('Reply is empty');
  return appendReply(thread, text);
}

export function clientAction(id, type, note) {
  const thread = threadOrThrow(id);
  if (!['handled', 'takeover'].includes(type)) throw bad('Unknown action');
  const trimmed = within(asText(note), LIMITS.note, 'Note');
  return applyClientAction(thread, type, trimmed);
}

export function addIncomingMessage(id, message = {}) {
  const thread = threadOrThrow(id);
  const client = store.clients.find((c) => c.id === thread.clientId);
  if (!client) throw missing('Client for this conversation not found');

  const body = within(asText(message.body), LIMITS.message, 'Message');
  if (!body) throw bad('Message body is required');

  const rawName = within(asText(message.fromName), LIMITS.senderName, 'Sender name');
  const rawEmail = within(asText(message.fromEmail), LIMITS.address, 'Sender address');

  thread.messages.push({
    id: globalThis.crypto.randomUUID(),
    direction: 'in',
    from: {
      name: rawName || 'Unknown sender',
      email: EMAIL.test(rawEmail) ? rawEmail : 'unknown@example.com',
    },
    to: [{ name: client.name, email: client.email }],
    at: new Date().toISOString(),
    body,
  });
  thread.unread = true;
  recomputeThread(thread, { reason: 'a new message' });
  return thread;
}

export function simulateMessage(kind, clientId) {
  if (!SIMULATION_KINDS.has(kind)) throw bad('Unknown simulation kind');
  if (clientId !== undefined && !store.clients.some((c) => c.id === clientId)) {
    throw bad('Unknown client');
  }
  return simulateIncoming(kind, clientId);
}

/* ------------------------------------------------------------------ */
/* Mailboxes                                                           */
/* ------------------------------------------------------------------ */

function accountOrThrow(id) {
  const account = store.accounts.find((a) => a.id === id);
  if (!account) throw missing('Account not found');
  return account;
}

export function setAccountStatus(id, status) {
  const account = accountOrThrow(id);
  if (status === 'connected') {
    account.status = 'connected';
    account.health = 'ok';
    account.lastSyncAt = new Date().toISOString();
  } else if (status === 'disconnected') {
    account.status = 'disconnected';
    account.lastSyncAt = null;
  } else {
    throw bad('Unknown account status');
  }
  return store.accounts;
}

export function syncAccount(id) {
  const account = accountOrThrow(id);
  account.status = 'connected';
  account.lastSyncAt = new Date().toISOString();
  return store.accounts;
}

export function addAccount(provider, address) {
  if (!PROVIDERS.has(provider)) throw bad('Choose Gmail or Outlook');
  const clean = within(asText(address), LIMITS.address, 'Mailbox address');
  if (!EMAIL.test(clean)) throw bad('Enter a valid mailbox address.');

  const account = {
    id: `acc-${globalThis.crypto.randomUUID()}`,
    clientId: null,
    provider,
    address: clean,
    label: 'Assistant mailbox',
    status: 'connected',
    health: 'ok',
    connectedAt: new Date().toISOString(),
    lastSyncAt: new Date().toISOString(),
    scopes: provider === 'google' ? ['gmail.readonly', 'gmail.send'] : ['mail.read', 'mail.send'],
    messageCount: 0,
  };
  store.accounts.push(account);
  return { accounts: store.accounts, account };
}

export function resetDemo() {
  resetStore();
  return { ok: true };
}
