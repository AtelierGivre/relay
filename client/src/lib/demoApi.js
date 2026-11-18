import { store } from '../../../server/src/store.js';
import {
  bootstrap,
  readThread,
  patchThread,
  reclassifyThread,
  draftFor,
  followUpFor,
  addReply,
  clientAction,
  askRelay,
  evaluateRouter,
  simulateMessage,
  setAccountStatus,
  syncAccount,
  addAccount,
  resetDemo,
} from '../../../server/src/core.js';

const KEY = 'relay-demo-v1';
const latency = () => new Promise((resolve) => setTimeout(resolve, 90 + Math.random() * 90));

function save() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* storage can be full or blocked; the demo still works in memory */
  }
}

try {
  const saved = sessionStorage.getItem(KEY);
  if (saved) Object.assign(store, JSON.parse(saved));
} catch {
  resetDemo();
}

export const demoApi = {
  async bootstrap() {
    await latency();
    return bootstrap();
  },

  async thread(id) {
    await latency();
    return { thread: readThread(id) };
  },

  async patchThread(id, data = {}) {
    await latency();
    const thread = patchThread(id, data);
    save();
    return { thread };
  },

  async reclassify(id) {
    await latency();
    const thread = reclassifyThread(id);
    save();
    return { thread };
  },

  async draft(id, tone) {
    await latency();
    return draftFor(id, tone);
  },

  async followUp(id) {
    await latency();
    return followUpFor(id);
  },

  async reply(id, text) {
    await latency();
    const thread = addReply(id, text);
    save();
    return { thread };
  },

  async clientAction(id, type, note) {
    await latency();
    const thread = clientAction(id, type, note);
    save();
    return { thread };
  },

  async simulate(kind, clientId) {
    await latency();
    const thread = simulateMessage(kind, clientId);
    save();
    return { thread };
  },

  async ask(query, threadId) {
    await latency();
    return askRelay(query, threadId);
  },

  async evaluate(policy = {}) {
    await latency();
    return evaluateRouter(policy);
  },

  async syncAccount(id) {
    await latency();
    const accounts = syncAccount(id);
    save();
    return { accounts };
  },

  async patchAccount(id, data = {}) {
    await latency();
    const accounts = setAccountStatus(id, data.status);
    save();
    return { accounts };
  },

  async addAccount(provider, address) {
    await latency();
    const result = addAccount(provider, address);
    save();
    return result;
  },

  async reset() {
    await latency();
    const result = resetDemo();
    save();
    return result;
  },
};
