import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { CLASS_META } from '../lib/selectors';
import { percent } from '../lib/format';
import { useToast } from '../components/Toast';

const AppContext = createContext(null);

const EMPTY = { user: null, clients: [], accounts: [], threads: [] };

export function AppProvider({ children }) {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const toast = useToast();

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setStatus('loading');
        setError(null);
      }
      try {
        const payload = await api.bootstrap();
        setData({
          user: payload.user,
          clients: payload.clients,
          accounts: payload.accounts,
          threads: payload.threads,
        });
        setStatus('ready');
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    },
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const replaceThread = useCallback((thread) => {
    setData((d) => ({ ...d, threads: d.threads.map((t) => (t.id === thread.id ? thread : t)) }));
  }, []);

  const addThread = useCallback((thread) => {
    setData((d) => ({ ...d, threads: [thread, ...d.threads.filter((t) => t.id !== thread.id)] }));
  }, []);

  const guard = useCallback(
    async (fn) => {
      try {
        return await fn();
      } catch (err) {
        toast.error(err);
        return null;
      }
    },
    [toast],
  );

  const actions = useMemo(
    () => ({
      setClassification: (id, classification) =>
        guard(async () => {
          const { thread } = await api.patchThread(id, { classification });
          replaceThread(thread);
          toast.push(`Moved to “${CLASS_META[classification].label}”.`);
          return thread;
        }),

      toggleStar: (thread) =>
        guard(async () => {
          const { thread: updated } = await api.patchThread(thread.id, { starred: !thread.starred });
          replaceThread(updated);
          return updated;
        }),

      setUnread: (thread, unread) =>
        guard(async () => {
          const { thread: updated } = await api.patchThread(thread.id, { unread });
          replaceThread(updated);
          return updated;
        }),

      archive: (thread) =>
        guard(async () => {
          const { thread: updated } = await api.patchThread(thread.id, { archived: !thread.archived });
          replaceThread(updated);
          toast.push(updated.archived ? 'Conversation archived.' : 'Conversation restored.');
          return updated;
        }),

      setStatus: (thread, nextStatus) =>
        guard(async () => {
          const { thread: updated } = await api.patchThread(thread.id, { status: nextStatus });
          replaceThread(updated);
          toast.push(nextStatus === 'done' ? 'Marked complete.' : 'Conversation reopened.');
          return updated;
        }),

      reclassify: (id) =>
        guard(async () => {
          const { thread } = await api.reclassify(id);
          replaceThread(thread);
          toast.push(
            `Re-ran the analysis: ${CLASS_META[thread.ai.classification].label} at ${percent(
              thread.ai.confidence,
            )}.`,
          );
          return thread;
        }),

      draftReply: (id, tone) => guard(() => api.draft(id, tone)),

      followUp: (id) => guard(() => api.followUp(id)),

      sendReply: (id, text) =>
        guard(async () => {
          const { thread } = await api.reply(id, text);
          replaceThread(thread);
          toast.push('Reply sent. Now waiting on them.');
          return thread;
        }),

      clientAction: (id, type, note) =>
        guard(async () => {
          const { thread } = await api.clientAction(id, type, note);
          replaceThread(thread);
          toast.push(type === 'handled' ? 'Marked as handled.' : 'Ananya will take this one from here.');
          return thread;
        }),

      simulate: (kind, clientId) =>
        guard(async () => {
          const { thread } = await api.simulate(kind, clientId);
          addThread(thread);
          toast.push(
            `New email routed to ${CLASS_META[thread.ai.classification].label} · ${percent(thread.ai.confidence)}.`,
          );
          return thread;
        }),

      ask: (query, threadId) => guard(() => api.ask(query, threadId)),

      evaluate: (policy) => guard(() => api.evaluate(policy)),

      syncAccount: (id) =>
        guard(async () => {
          const { accounts } = await api.syncAccount(id);
          setData((d) => ({ ...d, accounts }));
          toast.push('Mailbox synced just now.');
          return accounts;
        }),

      setAccountStatus: (id, next) =>
        guard(async () => {
          const { accounts } = await api.patchAccount(id, { status: next });
          setData((d) => ({ ...d, accounts }));
          toast.push(next === 'connected' ? 'Mailbox reconnected.' : 'Mailbox disconnected.');
          return accounts;
        }),

      addAccount: (provider, address) =>
        guard(async () => {
          const { accounts } = await api.addAccount(provider, address);
          setData((d) => ({ ...d, accounts }));
          toast.push('Mailbox connected.');
          return accounts;
        }),

      resetDemo: () =>
        guard(async () => {
          await api.reset();
          await load({ silent: true });
          toast.push('Demo data restored.');
        }),
    }),
    [guard, replaceThread, addThread, toast, load],
  );

  const value = useMemo(
    () => ({ ...data, status, error, reload: load, ...actions }),
    [data, status, error, load, actions],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export function useThread(id) {
  const { threads } = useApp();
  return threads.find((t) => t.id === id) || null;
}
