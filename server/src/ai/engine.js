const ASSISTANT_NAME = 'Ananya';

const AUTOMATED_LOCAL = [
  /no-?reply|do-?not-?reply/i,
  /notifications?|notify|automated/i,
  /^(billing|receipts?|newsletter|digest|mailer|updates?|press|alerts?)$/i,
  /(^|[._-])(billing|receipts?|newsletter|digest|mailer|updates?|alerts?)([._-]|$)/i,
];

const RULES = [
  // ---------- automated / no reply ----------
  {
    cls: 'none',
    w: 5,
    label: 'an automated sender address',
    test: (t) => AUTOMATED_LOCAL.some((re) => re.test(t.senderLocal)),
  },
  {
    cls: 'none',
    w: 4,
    label: 'a "do not reply" notice',
    test: (t) => /do not reply|don't reply|no-reply|automated (message|notification|confirmation)|this is a notification/i.test(t.body),
  },
  {
    cls: 'none',
    w: 3,
    label: 'newsletter boilerplate',
    test: (t) => /unsubscribe|view in browser|press digest|you are receiving this because/i.test(t.body),
  },
  {
    cls: 'none',
    w: 2.2,
    label: 'notification preferences or an account alert',
    test: (t) =>
      /this is a notification|manage (your )?(email |notification )?preferences|no action is needed|account alert|automated (message|email|update|alert)/i.test(
        t.body,
      ),
  },
  {
    cls: 'none',
    w: 2.4,
    label: 'a receipt or confirmation subject',
    test: (t) => /your (aws |stripe )?(invoice|payout|booking|reservation)|booking confirmed|payout summary|results ready/i.test(t.subject + ' ' + t.body),
  },

  // ---------- client to reply ----------
  {
    cls: 'client',
    w: 2.6,
    label: 'a legal or financial commitment',
    test: (t) => /term sheet|pre-money|valuation|equity|cap table|exclusivity|\blease\b|\brenewal\b|lock-in|offer letter|compensation|sign-off|signature|clause \d/i.test(t.text),
  },
  {
    cls: 'client',
    w: 1.6,
    label: 'a hiring or compensation decision',
    test: (t) => /offer letter|compensation|equity grant|salary|stock options|hiring package|sign(ing)? bonus/i.test(t.text),
  },
  {
    cls: 'client',
    w: 2.2,
    label: 'a contract or agreement',
    test: (t) => /\bcontract\b|\bagreement\b|\bcounsel\b|\blawyer\b|\blegal\b|\bterms\b/i.test(t.text),
  },
  {
    cls: 'client',
    w: 2.4,
    label: 'an explicit approval request',
    test: (t) => /(need|needs|required?|your) (explicit )?(approval|sign-off|confirmation)|approve (the|this|or adjust)|your call\b/i.test(t.text),
  },
  {
    cls: 'client',
    w: 2.2,
    label: 'a personal decision or judgment',
    test: (t) => /your call\b|decision is yours|final decision|what would you do|your (personal )?read|your view|your judg(e)?ment|what do you think|as a friend|personally/i.test(t.text),
  },
  {
    cls: 'client',
    w: 2,
    label: 'a sensitive clinical or business question',
    test: (t) => /second opinion|clinical|stent|angiogram|patient|acquisition|layoff|resignation|on the record|press release|statement|reporter|interview/i.test(t.text),
  },
  {
    cls: 'client',
    w: 1.6,
    label: 'an opening addressed to the client',
    test: (t) => t.greetingIsClient,
  },
  {
    cls: 'client',
    w: 1.2,
    label: 'a question only the client can answer',
    test: (t) => t.body.trim().endsWith('?') && /would you|do you|can you|could you confirm|are you|should we/i.test(t.body),
  },
  {
    cls: 'client',
    w: 2.5,
    label: 'a request for the client\u2019s own voice',
    test: (t) => /first-person|in your voice|your voice|interview request|would you be open to it|write for us|byline/i.test(t.text),
  },
  {
    cls: 'client',
    w: 2,
    label: 'a personal request to the client',
    test: (t) => /as a friend|asking you personally|i'm asking you|your personal read|what you would do/i.test(t.text),
  },
  {
    cls: 'client',
    w: 1,
    label: 'a senior counterparty',
    test: (t) => /investor|partner|board|founder|co-founder|editor|landlord/i.test(t.senderTitle + ' ' + t.body),
  },

  // ---------- assistant to reply ----------
  {
    cls: 'assistant',
    w: 2.6,
    label: 'a request addressed to the assistant',
    test: (t) => t.greetingIsAssistant || /could ananya|can ananya|your assistant|from zoya's side|ananya,/i.test(t.text),
  },
  {
    cls: 'assistant',
    w: 2,
    label: 'scheduling and logistics',
    test: (t) => /reschedul|move (it|the|our)|availability|calendar|invite|slot|fitting|appointment|pickup|pick-up|courier|docket|hotel|flight|visa|letterhead|itinerary|arrival time|showroom|book (a|the|us|it)\b/i.test(t.text),
  },
  {
    cls: 'assistant',
    w: 1.8,
    label: 'routine administrative follow-up',
    test: (t) => /invoice|payment|overdue|past due|follow up|following up|chase|receipt|expenses|reimburse|reconcil/i.test(t.text),
  },
  {
    cls: 'assistant',
    w: 1.4,
    label: 'a vendor or coordinator contact',
    test: (t) =>
      /desk|coordinator|secretariat|reservations|accounts@|books@|recruit|talent|studio|office@/i.test(
        `${t.senderLocal} ${t.senderEmail} ${t.senderName} ${t.body}`,
      ),
  },
  {
    cls: 'assistant',
    w: 1.2,
    label: 'an internal team request',
    test: (t) => /northwindlabs|atelierrasa|meridianheart/i.test(t.senderEmail) && !t.greetingIsClient,
  },
  {
    cls: 'assistant',
    w: 1.1,
    label: 'a routine confirm or forward',
    test: (t) => /could you (confirm|share|send|get|follow)|please (confirm|share|send)|can you (confirm|share|send|follow)|let me know/i.test(t.body),
  },
  {
    cls: 'assistant',
    w: 0.9,
    label: 'an external outreach to manage',
    test: (t) => /reach(ing)? out|would .* be open|happy to (work|jump)|suggest a slot|introduce|intro:/i.test(t.body + ' ' + t.subject),
  },
  {
    cls: 'assistant',
    w: 1.7,
    label: 'a recruiter or staffing outreach',
    test: (t) => /recruit|talent|staffing|technical recruiter/i.test(`${t.text} ${t.senderLocal}`),
  },
];

export const RULE_COUNT = RULES.length;

function addressedTo(body, client) {
  const firstLine = (body.trim().split('\n')[0] || '').slice(0, 90);
  const lower = firstLine.toLowerCase();
  const looksLikeOpening =
    /^(hi|hey|hello|dear|bonjour|greetings|dr\.?|prof\.?|good (morning|afternoon|evening))\b/.test(lower) ||
    firstLine.trim().length <= 24;
  if (!looksLikeOpening) return null;
  if (/\bananya\b/.test(lower)) return 'assistant';
  const first = client.firstName.toLowerCase();
  const last = client.name
    .split(' ')
    .filter((w) => !/^dr\.?$/i.test(w))
    .pop()
    .toLowerCase();
  if (new RegExp(`\\b${first}\\b`).test(lower) || new RegExp(`\\b${last}\\b`).test(lower)) return 'client';
  return null;
}

function sentences(text) {
  return text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildSignals(thread, client) {
  const inbound = [...thread.messages].reverse().find((m) => m.direction === 'in') || thread.messages[0];
  const body = inbound.body;
  const from = inbound.from;
  const senderLocal = (from.email.split('@')[0] || '').toLowerCase();
  const inboundMessages = thread.messages.filter((m) => m.direction === 'in');
  const addressed = [...inboundMessages]
    .reverse()
    .map((m) => addressedTo(m.body, client))
    .find(Boolean);
  const greetingIsClient = addressed === 'client';
  const greetingIsAssistant = addressed === 'assistant';
  const senderTitle = inbound.from.title || '';

  const ctx = {
    subject: thread.subject,
    body,
    text: `${thread.subject} ${body}`.toLowerCase(),
    senderLocal,
    senderName: from.name,
    senderEmail: from.email,
    senderTitle,
    greetingIsClient,
    greetingIsAssistant,
  };

  const scores = { assistant: 0, client: 0, none: 0 };
  const hits = [];

  for (const rule of RULES) {
    if (rule.test(ctx)) {
      scores[rule.cls] += rule.w;
      hits.push({ cls: rule.cls, label: rule.label, w: rule.w });
    }
  }

  return { scores, hits, ctx, inbound };
}

export const ROUTING_POLICY = { minEvidence: 4.5, minMargin: 1.6 };

export function classify(thread, client, options = {}) {
  const policy = {
    minEvidence: Number.isFinite(options.minEvidence) ? options.minEvidence : ROUTING_POLICY.minEvidence,
    minMargin: Number.isFinite(options.minMargin) ? options.minMargin : ROUTING_POLICY.minMargin,
  };
  const { scores, hits, ctx, inbound } = buildSignals(thread, client);

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topCls, topScore] = ranked[0];
  const secondScore = ranked[1][1];
  const margin = topScore - secondScore;

  const automated = hits.filter((h) => h.cls === 'none').reduce((s, h) => s + h.w, 0);
  const isAutomated = automated >= 5;

  let classification;
  let confidence;

  if (isAutomated && scores.none >= topScore) {
    classification = 'none';
    confidence = Math.min(0.99, 0.8 + automated * 0.02);
  } else if (topScore < policy.minEvidence || margin < policy.minMargin) {
    classification = 'review';
    confidence = Math.max(0.36, Math.min(0.58, 0.38 + margin * 0.05));
  } else {
    classification = topCls;
    confidence = Math.min(0.97, 0.6 + topScore * 0.021 + margin * 0.024);
  }

  const winningHits =
    classification === 'review'
      ? hits
          .filter((h) => h.cls === ranked[0][0] || h.cls === ranked[1][0])
          .sort((a, b) => b.w - a.w)
          .slice(0, 3)
      : hits.filter((h) => h.cls === classification).sort((a, b) => b.w - a.w).slice(0, 3);

  const labels = winningHits.map((h) => h.label);

  let reason;
  if (classification === 'review') {
    const names = { assistant: 'the assistant', client: 'the client', none: 'no reply' };
    reason = `Confidence is too low to route automatically. Strongest signals point to ${names[ranked[0][0]]} (${ranked[0][1].toFixed(
      1,
    )}) and ${names[ranked[1][0]]} (${ranked[1][1].toFixed(1)}).`;
  } else if (classification === 'none') {
    reason = `Reads as automated: ${labels[0] || 'no human request'}${labels[1] ? ` and ${labels[1]}` : ''}.`;
  } else if (classification === 'client') {
    reason = `Needs ${client.firstName} personally: ${labels.slice(0, 2).join(', ')}.`;
  } else {
    reason = `Yours to handle: ${labels.slice(0, 2).join(', ')}.`;
  }

  const intent = detectIntent(thread, classification, ctx);
  const waitingOn =
    classification === 'none' || classification === 'review'
      ? null
      : thread.messages[thread.messages.length - 1].direction === 'out'
        ? 'them'
        : 'us';

  return {
    classification,
    confidence: Number(confidence.toFixed(2)),
    signals: labels,
    reason,
    scores,
    candidates: {
      assistant: Number(scores.assistant.toFixed(1)),
      client: Number(scores.client.toFixed(1)),
      none: Number(scores.none.toFixed(1)),
    },
    margin: Number(margin.toFixed(1)),
    evidence: hits.map((h) => ({ cls: h.cls, label: h.label, w: h.w })),
    policy,
    intent,
    waitingOn,
    summary: thread.brief?.summary || summarize(inbound, classification, client),
    bullets: thread.brief?.bullets || extractBullets(inbound, client),
    suggestedAction: thread.brief?.suggestedAction || suggestAction(intent, classification, client),
    updatedAt: new Date().toISOString(),
  };
}

function detectIntent(thread, classification, ctx) {
  const text = `${thread.subject} ${ctx.body}`.toLowerCase();
  if (classification === 'none') return 'info';
  if (/intro/.test(text)) return 'intro';
  if (/invoice|payment|overdue|past due|reimburse/.test(text)) return 'invoice';
  if (/second opinion|what would you do|your read|your call|personally/.test(text)) return 'judge';
  if (/term sheet|approval|sign-off|lease|renewal|offer letter|clause/.test(text)) return 'approve';
  if (/interview|press release|statement|on the record|reporter/.test(text)) return 'decide';
  if (/reschedul|move|availability|slot|fitting|appointment|calendar|invite|pickup|hotel|visa|itinerary/.test(text)) return 'schedule';
  if (/min(imum)? order|fabric|supplier|quote/.test(text)) return 'decide';
  if (/would .*be open|reach(ing)? out|talent|recruit/.test(text)) return 'decline';
  return classification === 'client' ? 'decide' : 'admin';
}

function summarize(inbound, classification, client) {
  const cleaned = inbound.body
    .split('\n')
    .filter((line) => !/^(hi|hey|hello|dear|bonjour)\b/i.test(line.trim()))
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/best,?$|thanks,?$|regards,?$|warm regards,?$/i, '')
    .trim();
  const list = sentences(cleaned).slice(0, 2).join(' ');
  const body = list.length > 230 ? `${list.slice(0, 227).trim()}…` : list;
  if (classification === 'none') return `Automated message. ${body}`;
  if (classification === 'review') return `Unclear who should reply. ${body}`;
  return body;
}

function extractBullets(inbound, client) {
  const picks = sentences(inbound.body).filter((s) =>
    /₹|\$|\d{1,2}(:\d{2})? ?(am|pm|IST)|monday|tuesday|wednesday|thursday|friday|saturday|sunday|by |before |deadline|due/i.test(s),
  );
  const out = picks.slice(0, 3).map((s) => (s.length > 110 ? `${s.slice(0, 107).trim()}…` : s));
  return out.length ? out : [`No dates or figures mentioned`, `Sent by ${inbound.from.name}`];
}

function suggestAction(intent, classification, client) {
  if (classification === 'none') return 'No action needed. Filed automatically.';
  if (classification === 'review') return 'Review and route this conversation manually.';
  if (classification === 'client') {
    const map = {
      approve: `Send to ${client.firstName} for a decision before replying.`,
      judge: `${client.firstName} should answer this personally.`,
      decide: `${client.firstName} should decide how to respond.`,
      intro: `Ask ${client.firstName} whether to take the intro.`,
    };
    return map[intent] || `${client.firstName} should review this personally.`;
  }
  const map = {
    schedule: 'Confirm a time and send the calendar invite.',
    invoice: 'Chase the payment and confirm a date.',
    admin: 'Reply with the requested details.',
    decline: 'Send the standard decline on the client\u2019s behalf.',
    intro: 'Offer two slots for the intro call.',
  };
  return map[intent] || 'Draft a reply for review.';
}

/* ------------------------------------------------------------------ */
/* Reply drafting                                                      */
/* ------------------------------------------------------------------ */

const TONES = ['professional', 'warm', 'brief'];

export function draftReply(thread, client, { tone = 'professional', intent, classification } = {}) {
  const inbound = [...thread.messages].reverse().find((m) => m.direction === 'in') || thread.messages[0];
  const to = inbound.from.name.split(' ')[0];
  const kind = intent || thread.ai?.intent || 'admin';
  const clientName = client.firstName;
  const invoice = (thread.subject.match(/#(\d+)/) || [])[1];
  const deadlineLabel = thread.deadlines?.[0]
    ? new Date(thread.deadlines[0].at).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    : null;

  const sign = (style) =>
    style === 'brief'
      ? `Ananya`
      : `Best,\nAnanya\nOn behalf of ${client.name}`;

  if (classification === 'client' || classification === 'review') {
    const holding = {
      professional: `Hi ${to},\n\nThank you for your note. I've shared this with ${clientName} and will come back to you with a considered response${
        deadlineLabel ? ` before ${deadlineLabel}` : ' shortly'
      }.\n\n${sign('professional')}`,
      warm: `Hi ${to},\n\nThanks for writing, and for flagging this so clearly. I've passed it to ${clientName}, and you'll hear from us${
        deadlineLabel ? ` before ${deadlineLabel}` : ' very soon'
      }.\n\n${sign('professional')}`,
      brief: `Hi ${to}, noted, and with ${clientName} now. We'll revert${
        deadlineLabel ? ` before ${deadlineLabel}` : ' shortly'
      }.\n\n${sign('brief')}`,
    };
    return { subject: `Re: ${thread.subject}`, body: holding[tone] || holding.professional, tone };
  }

  if (kind === 'schedule') {
    const map = {
      professional: `Hi ${to},\n\nThank you for the details. ${clientName} is available on Tuesday at 11:00 or Wednesday at 15:00. Would either work for you? I'll send the calendar invite as soon as you confirm.\n\n${sign(
        'professional',
      )}`,
      warm: `Hi ${to},\n\nThanks so much for sorting this out! Tuesday at 11:00 or Wednesday at 15:00 both work on our side, so pick whichever is easier. I'll send the invite right after.\n\n${sign(
        'professional',
      )}`,
      brief: `Hi ${to}, Tue 11:00 or Wed 15:00 works. Which suits? I'll send the invite.\n\n${sign('brief')}`,
    };
    return { subject: `Re: ${thread.subject}`, body: map[tone] || map.professional, tone };
  }

  if (kind === 'invoice') {
    const map = {
      professional: `Hi ${to},\n\nA quick follow-up on ${invoice ? `invoice #${invoice}` : 'the outstanding invoice'}. It is now past due. Could you confirm a payment date? We're closing our books for the month and would like to reflect it accurately.\n\n${sign(
        'professional',
      )}`,
      warm: `Hi ${to},\n\nJust circling back on ${invoice ? `invoice #${invoice}` : 'the invoice'}. I know month-end gets busy. If you can share a payment date, I'll update our books and we're all set.\n\n${sign(
        'professional',
      )}`,
      brief: `Hi ${to}, checking in on ${invoice ? `#${invoice}` : 'the invoice'}. Can you confirm a payment date?\n\n${sign('brief')}`,
    };
    return { subject: `Re: ${thread.subject}`, body: map[tone] || map.professional, tone };
  }

  if (kind === 'decline') {
    const map = {
      professional: `Hi ${to},\n\nThank you for reaching out. ${clientName} is fully focused on current commitments and won't be able to take this on. We appreciate you thinking of ${clientName} and will keep the note on file.\n\n${sign(
        'professional',
      )}`,
      warm: `Hi ${to},\n\nThanks for getting in touch. I really appreciate it. ${clientName} isn't able to take anything new on right now, but do keep us in mind for later in the year.\n\n${sign(
        'professional',
      )}`,
      brief: `Hi ${to}, thanks for reaching out. ${clientName} isn't taking this on right now, but we'll keep it on file.\n\n${sign('brief')}`,
    };
    return { subject: `Re: ${thread.subject}`, body: map[tone] || map.professional, tone };
  }

  const map = {
    professional: `Hi ${to},\n\nThank you for the note. I'll take care of this and confirm once it's done. If you need anything else in the meantime, just let me know.\n\n${sign(
      'professional',
    )}`,
    warm: `Hi ${to},\n\nThanks for flagging this. I'm on it. I'll come back to you as soon as it's sorted.\n\n${sign('professional')}`,
    brief: `Hi ${to}, on it. I'll confirm once done.\n\n${sign('brief')}`,
  };
  return { subject: `Re: ${thread.subject}`, body: map[tone] || map.professional, tone };
}

export function followUpReply(thread, client) {
  const lastOut = [...thread.messages].reverse().find((m) => m.direction === 'out');
  const to = (lastOut?.to?.[0]?.name || client.name).split(' ')[0];
  const subject = thread.subject.replace(/^re:\s*/i, '');
  const invoice = (thread.subject.match(/#(\d+)/) || [])[1];
  const kind = thread.ai?.intent || 'admin';
  const ask =
    kind === 'invoice'
      ? 'Could you confirm a payment date?'
      : kind === 'schedule'
        ? 'Does the time I suggested still work for you?'
        : kind === 'intro'
          ? 'Would you like me to go ahead and set up the intro?'
          : kind === 'decline'
            ? 'Let me know if you would like me to close this out.'
            : 'Is there anything else you need from me on this?';
  return {
    subject: `Re: ${subject}`,
    tone: 'brief',
    body: `Hi ${to},\n\nJust following up on ${
      invoice ? `invoice #${invoice}` : `“${subject}”`
    }. ${ask}\n\nBest,\nAnanya\nOn behalf of ${client.name}`,
  };
}

export { TONES };

/* ------------------------------------------------------------------ */
/* Ask Relay: question answering over the mailbox                      */
/* ------------------------------------------------------------------ */

export function answerQuery(query, threads, clients, threadId) {
  const q = query.toLowerCase().trim();
  const byId = new Map(threads.map((t) => [t.id, t]));
  const active = threads.filter((t) => !t.archived);
  const nameOf = (id) => clients.find((c) => c.id === id)?.firstName || 'Client';

  const thread = threadId ? byId.get(threadId) : null;

  if (/summar/.test(q) && thread) {
    return {
      kind: 'summary',
      answer: thread.ai.summary,
      threadIds: [thread.id],
      bullets: thread.ai.bullets,
    };
  }

  if (/draft|write a reply|reply for/.test(q) && thread) {
    return {
      kind: 'draft',
      answer: `I've prepared a draft reply to “${thread.subject}”. Review and edit it before sending.`,
      threadIds: [thread.id],
    };
  }

  if (/waiting|what am i waiting|pending|follow(ing)? up|chase/.test(q)) {
    const list = active.filter((t) => t.ai.waitingOn === 'them' && t.status === 'open');
    return {
      kind: 'waiting',
      answer: list.length
        ? `You're waiting on ${list.length} ${list.length === 1 ? 'thread' : 'threads'}: ${list
            .map((t) => `${nameOf(t.clientId)}: ${t.subject}`)
            .slice(0, 3)
            .join('; ')}${list.length > 3 ? ', and more' : ''}.`
        : 'Nothing is waiting on someone else right now.',
      threadIds: list.map((t) => t.id),
    };
  }

  if (/client|their attention|needs them|personally/.test(q)) {
    const list = active.filter((t) => t.ai.classification === 'client' && t.status === 'open');
    return {
      kind: 'client',
      answer: list.length
        ? `${list.length} ${list.length === 1 ? 'thread needs' : 'threads need'} a client's personal reply. ${list
            .slice(0, 2)
            .map((t) => `${nameOf(t.clientId)} on “${t.subject}”`)
            .join(', ')}${list.length > 2 ? ' and others' : ''}.`
        : 'No client replies are outstanding.',
      threadIds: list.map((t) => t.id),
    };
  }

  if (/review|unsure|not sure|confiden|uncertain/.test(q)) {
    const list = active.filter((t) => t.ai.classification === 'review' && t.status === 'open');
    return {
      kind: 'review',
      answer: list.length
        ? `${list.length} ${list.length === 1 ? 'conversation is' : 'conversations are'} below the confidence threshold. Take a look and route ${list.length === 1 ? 'it' : 'each one'}.`
        : 'Nothing needs manual review. Every conversation cleared the confidence threshold.',
      threadIds: list.map((t) => t.id),
    };
  }

  if (/meeting|calendar|appointment|schedule|upcoming|today|tomorrow/.test(q)) {
    const list = active
      .filter((t) => (t.deadlines || []).some((d) => d.kind === 'meeting'))
      .sort((a, b) => {
        const aNext = a.deadlines.filter((d) => d.kind === 'meeting')[0]?.at || '';
        const bNext = b.deadlines.filter((d) => d.kind === 'meeting')[0]?.at || '';
        return new Date(aNext) - new Date(bNext);
      });
    return {
      kind: 'meetings',
      answer: list.length
        ? `I found ${list.length} ${list.length === 1 ? 'thread with a meeting or appointment' : 'threads with meetings or appointments'} across your clients. Nearest: ${
            list[0].subject
          }.`
        : 'No meetings or appointments found in the inbox.',
      threadIds: list.map((t) => t.id),
    };
  }

  if (/invoice|payment|money|overdue|finance/.test(q)) {
    const list = active.filter((t) => t.ai.intent === 'invoice');
    return {
      kind: 'invoice',
      answer: list.length
        ? `${list.length} ${list.length === 1 ? 'thread concerns' : 'threads concern'} invoices or payments. ${
            list[0] ? `Start with “${list[0].subject}”.` : ''
          }`
        : 'No invoice or payment threads right now.',
      threadIds: list.map((t) => t.id),
    };
  }

  if (/important|urgent|priority|attention|needs me|my attention/.test(q)) {
    const list = active.filter(
      (t) =>
        t.status === 'open' &&
        (t.ai.classification === 'assistant' || t.starred || (t.tags || []).includes('Important')),
    );
    return {
      kind: 'attention',
      answer: list.length
        ? `${list.length} ${list.length === 1 ? 'conversation needs' : 'conversations need'} your attention. ${
            list.filter((t) => t.starred).length
          } are starred, and ${list.filter((t) => t.ai.classification === 'review').length} need a routing decision.`
        : 'Your inbox is clear. Nothing needs attention.',
      threadIds: list.map((t) => t.id),
    };
  }

  const words = q.split(/\s+/).filter((w) => w.length > 2);
  const matches = active.filter((t) => words.some((w) => `${t.subject} ${t.messages[t.messages.length - 1].body}`.toLowerCase().includes(w)));
  return {
    kind: 'search',
    answer: matches.length
      ? `I found ${matches.length} ${matches.length === 1 ? 'conversation' : 'conversations'} matching “${query.trim()}”.`
      : `I couldn't find anything matching “${query.trim()}”. Try a sender, a client or a topic.`,
    threadIds: matches.map((t) => t.id).slice(0, 8),
  };
}
