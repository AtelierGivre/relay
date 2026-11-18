const BASE = import.meta.env.VITE_API_URL || '/api';
const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === '1';

let demoModule = null;
const loadDemo = () => (demoModule ??= import('./demoApi.js').then((m) => m.demoApi));

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'content-type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the Relay API. Is the server running?');
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json();
}

const body = (data) => JSON.stringify(data);

const liveApi = {
  bootstrap: () => request('/bootstrap'),
  thread: (id) => request(`/threads/${id}`),
  patchThread: (id, data) => request(`/threads/${id}`, { method: 'PATCH', body: body(data) }),
  reclassify: (id) => request(`/threads/${id}/reclassify`, { method: 'POST' }),
  draft: (id, tone) => request(`/threads/${id}/draft`, { method: 'POST', body: body({ tone }) }),
  followUp: (id) => request(`/threads/${id}/follow-up`, { method: 'POST' }),
  reply: (id, text) => request(`/threads/${id}/reply`, { method: 'POST', body: body({ body: text }) }),
  clientAction: (id, type, note) =>
    request(`/threads/${id}/client-action`, { method: 'POST', body: body({ type, note }) }),
  simulate: (kind, clientId) => request('/simulate', { method: 'POST', body: body({ kind, clientId }) }),
  ask: (query, threadId) => request('/ask', { method: 'POST', body: body({ query, threadId }) }),
  evaluate: (policy = {}) => request('/evaluate', { method: 'POST', body: body(policy) }),
  syncAccount: (id) => request(`/accounts/${id}/sync`, { method: 'POST' }),
  patchAccount: (id, data) => request(`/accounts/${id}`, { method: 'PATCH', body: body(data) }),
  addAccount: (provider, address) => request('/accounts', { method: 'POST', body: body({ provider, address }) }),
  reset: () => request('/reset', { method: 'POST' }),
};

const DEMO_METHODS = Object.keys(liveApi);

export const api = STATIC_DEMO
  ? Object.fromEntries(
      DEMO_METHODS.map((name) => [name, (...args) => loadDemo().then((demo) => demo[name](...args))]),
    )
  : liveApi;
