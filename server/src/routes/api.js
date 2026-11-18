import { Router } from 'express';
import {
  bootstrap,
  readThread,
  patchThread,
  reclassifyThread,
  draftFor,
  followUpFor,
  addReply,
  clientAction,
  addIncomingMessage,
  askRelay,
  simulateMessage,
  setAccountStatus,
  syncAccount,
  addAccount,
  resetDemo,
  evaluateRouter,
} from '../core.js';
import { store } from '../store.js';

export const api = Router();

api.get('/bootstrap', (req, res) => {
  res.json(bootstrap());
});

api.get('/threads/:id', (req, res) => {
  res.json({ thread: readThread(req.params.id) });
});

api.patch('/threads/:id', (req, res) => {
  res.json({ thread: patchThread(req.params.id, req.body || {}) });
});

api.post('/threads/:id/reclassify', (req, res) => {
  res.json({ thread: reclassifyThread(req.params.id) });
});

api.post('/threads/:id/draft', (req, res) => {
  res.json(draftFor(req.params.id, req.body?.tone));
});

api.post('/threads/:id/follow-up', (req, res) => {
  res.json(followUpFor(req.params.id));
});

api.post('/threads/:id/reply', (req, res) => {
  res.json({ thread: addReply(req.params.id, req.body?.body) });
});

api.post('/threads/:id/client-action', (req, res) => {
  res.json({ thread: clientAction(req.params.id, req.body?.type, req.body?.note) });
});

api.post('/threads/:id/messages', (req, res) => {
  res.status(201).json({ thread: addIncomingMessage(req.params.id, req.body || {}) });
});

api.post('/evaluate', (req, res) => {
  res.json(evaluateRouter(req.body || {}));
});

api.post('/ask', (req, res) => {
  res.json(askRelay(req.body?.query, req.body?.threadId));
});

api.post('/simulate', (req, res) => {
  res.status(201).json({ thread: simulateMessage(req.body?.kind, req.body?.clientId) });
});

api.patch('/accounts/:id', (req, res) => {
  res.json({ accounts: setAccountStatus(req.params.id, req.body?.status) });
});

api.post('/accounts/:id/sync', (req, res) => {
  res.json({ accounts: syncAccount(req.params.id) });
});

api.post('/accounts', (req, res) => {
  const { accounts, account } = addAccount(req.body?.provider, req.body?.address);
  res.status(201).json({ accounts, account });
});

api.post('/reset', (req, res) => {
  res.json(resetDemo());
});

api.get('/health', (req, res) => res.json({ ok: true, threads: store.threads.length }));

api.use((req, res) => {
  res.status(404).json({ error: 'Unknown API route' });
});
