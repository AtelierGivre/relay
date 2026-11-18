export const CLASS_META = {
  assistant: {
    label: 'Assistant to reply',
    short: 'Assistant',
    tone: 'assistant',
    blurb: 'You own the reply',
    description: 'Routine scheduling, admin and follow-ups you can answer on your client\u2019s behalf.',
  },
  client: {
    label: 'Client to reply',
    short: 'Client',
    tone: 'client',
    blurb: 'Needs the client',
    description: 'Decisions, sensitive conversations and messages only your client can answer.',
  },
  none: {
    label: 'No reply needed',
    short: 'No reply',
    tone: 'none',
    blurb: 'Filed automatically',
    description: 'Notifications, receipts and updates that do not need a response.',
  },
  review: {
    label: 'Needs review',
    short: 'Review',
    tone: 'review',
    blurb: 'Low confidence',
    description: 'Signals conflict, so Relay asks you to route it instead of guessing.',
  },
};

export const SEGMENT_DEFS = [
  { id: 'all', label: 'All conversations', short: 'All' },
  { id: 'assistant', label: 'Assistant to reply', short: 'Assistant' },
  { id: 'client', label: 'Client to reply', short: 'Client' },
  { id: 'review', label: 'Needs review', short: 'Review' },
  { id: 'waiting', label: 'Waiting on them', short: 'Waiting' },
  { id: 'none', label: 'No reply needed', short: 'No reply' },
  { id: 'meetings', label: 'Meetings', short: 'Meetings' },
  { id: 'important', label: 'Important', short: 'Important' },
];

export function activeThreads(threads) {
  return threads.filter((t) => !t.archived);
}

export function inSegment(thread, segment) {
  if (thread.archived) return false;
  switch (segment) {
    case 'assistant':
    case 'client':
    case 'none':
    case 'review':
      return thread.ai.classification === segment && thread.status !== 'done';
    case 'waiting':
      return thread.ai.waitingOn === 'them' && thread.status === 'open';
    case 'meetings':
      return (thread.tags || []).includes('Meetings');
    case 'important':
      return thread.starred || (thread.tags || []).includes('Important');
    default:
      return true;
  }
}

export function segmentCount(threads, segment) {
  return activeThreads(threads).filter((t) => t.status !== 'done' && inSegment(t, segment)).length;
}

export function getStats(threads) {
  const open = activeThreads(threads).filter((t) => t.status === 'open');
  return {
    total: activeThreads(threads).length,
    unread: open.filter((t) => t.unread).length,
    needsYou: open.filter((t) => t.ai.classification === 'assistant').length,
    needsClient: open.filter((t) => t.ai.classification === 'client').length,
    waiting: open.filter((t) => t.ai.waitingOn === 'them').length,
    review: open.filter((t) => t.ai.classification === 'review').length,
    noReply: open.filter((t) => t.ai.classification === 'none').length,
    important: open.filter((t) => t.starred || (t.tags || []).includes('Important')).length,
    done: activeThreads(threads).filter((t) => t.status === 'done').length,
  };
}

export function upcomingMeetings(threads, limit = 4) {
  const items = [];
  for (const t of activeThreads(threads)) {
    for (const d of t.deadlines || []) {
      if (d.kind === 'meeting') items.push({ ...d, thread: t });
    }
  }
  const now = Date.now();
  return items
    .filter((d) => new Date(d.at).getTime() > now - 36e5)
    .sort((a, b) => new Date(a.at) - new Date(b.at))
    .slice(0, limit);
}

export function upcomingDeadlines(threads, limit = 5) {
  const items = [];
  for (const t of activeThreads(threads)) {
    for (const d of t.deadlines || []) items.push({ ...d, thread: t });
  }
  const now = Date.now();
  return items
    .filter((d) => new Date(d.at).getTime() > now)
    .sort((a, b) => new Date(a.at) - new Date(b.at))
    .slice(0, limit);
}

export function clientLoad(threads, clients) {
  return clients.map((client) => {
    const list = activeThreads(threads).filter((t) => t.clientId === client.id && t.status === 'open');
    const unread = list.filter((t) => t.unread).length;
    const latest = activeThreads(threads)
      .filter((t) => t.clientId === client.id)
      .sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt))[0];
    return {
      client,
      open: list.length,
      unread,
      needsYou: list.filter((t) => t.ai.classification === 'assistant').length,
      needsClient: list.filter((t) => t.ai.classification === 'client').length,
      latest,
    };
  });
}

export function sortThreads(threads, sort = 'recent') {
  const copy = [...threads];
  if (sort === 'priority') {
    return copy.sort((a, b) => {
      const score = (t) =>
        (t.ai.classification === 'review' ? 30 : 0) +
        (t.starred ? 20 : 0) +
        ((t.tags || []).includes('Important') ? 8 : 0) +
        t.ai.confidence;
      return score(b) - score(a);
    });
  }
  if (sort === 'oldest') return copy.sort((a, b) => new Date(a.lastActivityAt) - new Date(b.lastActivityAt));
  return copy.sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));
}

export function searchThreads(threads, query) {
  const q = query.trim().toLowerCase();
  if (!q) return threads;
  return threads.filter((t) => {
    const last = t.messages[t.messages.length - 1];
    return `${t.subject} ${last.from.name} ${last.from.email} ${last.body} ${t.ai.summary}`
      .toLowerCase()
      .includes(q);
  });
}
