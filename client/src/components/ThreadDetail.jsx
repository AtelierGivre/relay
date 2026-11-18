import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { CLASS_META } from '../lib/selectors';
import { dateWithTime, percent, relative } from '../lib/format';
import { openAskPanel } from '../lib/bus';
import { Avatar } from './Avatar';
import { ClassificationChip, DeadlinePill } from './Chips';
import {
  Archive,
  ArrowLeft,
  Check,
  Clock,
  Mail,
  MailOpen,
  Refresh,
  Send,
  Sparkles,
  Star,
  Users,
  X,
} from './Icons';

const ROUTE_OPTIONS = ['assistant', 'client', 'none', 'review'];

const TONE_LABELS = { professional: 'Professional', warm: 'Warm', brief: 'Brief' };

function TimelineEvent({ event }) {
  const Icon = event.kind === 'ai' ? Sparkles : event.kind === 'client' ? Users : event.kind === 'sent' ? Send : Clock;
  return (
    <div className={`timeline-event timeline-event--${event.kind}`}>
      <span className="timeline-event__icon">
        <Icon size={13} />
      </span>
      <div className="timeline-event__body">
        <p>{event.text}</p>
        <span>{dateWithTime(event.at)}</span>
      </div>
    </div>
  );
}

function ConfidenceMeter({ value, tone }) {
  return (
    <div className={`conf-meter conf-meter--${tone}`}>
      <div className="conf-meter__track">
        <div className="conf-meter__fill" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      <span className="conf-meter__label">
        {percent(value)} {value >= 0.85 ? 'high' : value >= 0.6 ? 'medium' : 'low'} confidence
      </span>
    </div>
  );
}

export function ThreadDetail({ thread, client, onBack }) {
  const {
    user,
    clients,
    setClassification,
    reclassify,
    toggleStar,
    setUnread,
    archive,
    setStatus,
    draftReply,
    followUp,
    sendReply,
  } = useApp();
  const location = useLocation();
  const autoDraft = useRef(Boolean(location.state?.openDraft));
  const composerRef = useRef(null);

  const [mode, setMode] = useState('idle');
  const [tone, setTone] = useState('professional');
  const [text, setText] = useState('');
  const [draftNote, setDraftNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [nudging, setNudging] = useState(false);

  const meta = CLASS_META[thread.ai.classification];
  const toneClass = meta.tone;
  const inbound = [...thread.messages].reverse().find((m) => m.direction === 'in') || thread.messages[0];
  const replyTarget = thread.messages.find((m) => m.direction === 'out')?.to?.[0] || inbound.from;

  useEffect(() => {
    setMode('idle');
    setText('');
    setDraftNote('');
  }, [thread.id]);

  useEffect(() => {
    if (thread.unread) setUnread(thread, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id]);

  useEffect(() => {
    if (autoDraft.current) {
      autoDraft.current = false;
      generate('professional');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id]);

  async function generate(nextTone = tone) {
    setTone(nextTone);
    setMode('loading');
    const res = await draftReply(thread.id, nextTone);
    if (!res) {
      setMode('idle');
      return;
    }
    setText(res.draft.body);
    setDraftNote(res.note);
    setMode('draft');
  }

  async function nudge() {
    setNudging(true);
    const res = await followUp(thread.id);
    setNudging(false);
    if (!res) return;
    setTone('brief');
    setText(res.draft.body);
    setDraftNote(res.note);
    setMode('manual');
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function send() {
    if (!text.trim()) return;
    setSending(true);
    const updated = await sendReply(thread.id, text);
    setSending(false);
    if (updated) {
      setMode('idle');
      setText('');
      setDraftNote('');
    }
  }

  const timeline = [
    ...thread.messages.map((m) => ({ kind: 'message', at: m.at, data: m })),
    ...(thread.events || []).map((e) => ({ kind: 'event', at: e.at, data: e })),
  ].sort((a, b) => new Date(a.at) - new Date(b.at));

  const candidates = thread.ai.candidates || {};
  const candidateMax = Math.max(1, ...['assistant', 'client', 'none'].map((k) => candidates[k] || 0));
  const evidence = [...(thread.ai.evidence || [])].sort((a, b) => b.w - a.w);
  const policy = thread.ai.policy || { minEvidence: 4.5, minMargin: 1.6 };

  return (
    <article className="detail">
      <header className="detail__head">
        <div className="detail__topline">
          {onBack && (
            <button type="button" className="icon-btn detail__back" onClick={onBack} aria-label="Back to inbox">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="detail__client">
            <Avatar name={client?.name} accent={client?.accent} size={30} />
            <div>
              <div className="detail__client-name">{client?.name}</div>
              <div className="detail__client-company">
                {client?.role} · {client?.company}
              </div>
            </div>
          </div>
          <div className="detail__tools">
            <button
              type="button"
              className="icon-btn"
              onClick={() => openAskPanel()}
              aria-label="Ask Relay about this thread"
              title="Ask Relay about this thread"
            >
              <Sparkles size={16} />
            </button>
            <button
              type="button"
              className={`icon-btn ${thread.starred ? 'is-on' : ''}`}
              onClick={() => toggleStar(thread)}
              aria-label={thread.starred ? 'Remove star' : 'Star conversation'}
              aria-pressed={thread.starred}
              title={thread.starred ? 'Remove star' : 'Star conversation'}
            >
              <Star size={16} filled={thread.starred} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setUnread(thread, !thread.unread)}
              aria-label={thread.unread ? 'Mark as read' : 'Mark as unread'}
              aria-pressed={thread.unread}
              title={thread.unread ? 'Mark as read' : 'Mark as unread'}
            >
              {thread.unread ? <MailOpen size={16} /> : <Mail size={16} />}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={async () => {
                await archive(thread);
                onBack?.();
              }}
              aria-label="Archive conversation"
              title="Archive conversation"
            >
              <Archive size={16} />
            </button>
            <button
              type="button"
              className={`btn btn--sm ${thread.status === 'done' ? 'btn--soft' : 'btn--outline'}`}
              onClick={() => setStatus(thread, thread.status === 'done' ? 'open' : 'done')}
              aria-pressed={thread.status === 'done'}
            >
              <Check size={14} />
              {thread.status === 'done' ? 'Completed' : 'Mark done'}
            </button>
          </div>
        </div>

        <h1 className="detail__subject">{thread.subject}</h1>

        <div className="detail__meta">
          <span>
            {thread.messages.length} {thread.messages.length === 1 ? 'message' : 'messages'}
          </span>
          <span className="dot-sep" />
          <span>Last activity {relative(thread.lastActivityAt)}</span>
          <span className="dot-sep" />
          <span>Assigned to {client?.firstName}</span>
          <ClassificationChip classification={thread.ai.classification} confidence={thread.ai.confidence} size="xs" />
        </div>

        {(thread.deadlines || []).length > 0 && (
          <div className="detail__deadlines">
            {thread.deadlines.map((d) => (
              <DeadlinePill key={`${d.label}-${d.at}`} at={d.at} label={d.label} kind={d.kind} />
            ))}
          </div>
        )}

        {thread.status === 'open' && thread.ai.waitingOn === 'them' && (
          <div className="client-banner client-banner--waiting">
            <Clock size={15} />
            <div>
              <strong>Waiting on {inbound.from.name.split(' ')[0]}</strong>
              <span>
                Your last message went out {relative(thread.lastActivityAt)}. Relay keeps this here until a reply
                lands.
              </span>
            </div>
            <button
              type="button"
              className="btn btn--outline btn--sm client-banner__action"
              onClick={nudge}
              disabled={nudging}
            >
              {nudging ? 'Drafting…' : 'Draft a nudge'}
            </button>
          </div>
        )}

        {thread.clientAction && (
          <div className={`client-banner client-banner--${thread.clientAction.type}`}>
            <Users size={15} />
            <div>
              <strong>
                {thread.clientAction.type === 'handled'
                  ? `${client?.firstName} marked this handled`
                  : `${client?.firstName} asked you to take over`}
              </strong>
              <span>
                {relative(thread.clientAction.at)}
                {thread.clientAction.note ? ` · “${thread.clientAction.note}”` : ''}
              </span>
            </div>
          </div>
        )}
        {thread.status === 'done' && (
          <div className="client-banner client-banner--done">
            <Check size={15} />
            <div>
              <strong>This conversation is complete</strong>
              <span>Reopen it from the header if something else comes in.</span>
            </div>
          </div>
        )}
        {thread.archived && (
          <div className="client-banner client-banner--done">
            <Archive size={15} />
            <div>
              <strong>Archived</strong>
              <span>It won&apos;t appear in your inbox until you restore it.</span>
            </div>
          </div>
        )}
      </header>

      <div className="detail__scroll">
        <section className={`ai-card ai-card--${toneClass}`}>
          <header className="ai-card__head">
            <div className="ai-card__id">
              <span className="ai-card__badge">
                <Sparkles size={13} /> Relay brief
              </span>
              <span className="ai-card__time">Updated {relative(thread.ai.updatedAt)}</span>
            </div>
            <ClassificationChip classification={thread.ai.classification} confidence={thread.ai.confidence} size="xs" />
          </header>

          <p className="ai-card__summary">{thread.ai.summary}</p>

          {thread.ai.bullets?.length > 0 && (
            <ul className="ai-bullets">
              {thread.ai.bullets.map((b) => (
                <li key={b}>
                  <span className="ai-bullets__dot" />
                  {b}
                </li>
              ))}
            </ul>
          )}

          <div className="ai-card__action">
            <span className="ai-card__action-label">Suggested next step</span>
            <p>{thread.ai.suggestedAction}</p>
          </div>

          <div className="ai-card__why">
            <div className="ai-card__why-head">
              <span className="ai-card__why-label">Why Relay chose this</span>
              <span className="ai-card__why-tools">
                <Link className="ai-card__lab" to={`/app/lab?thread=${thread.id}`}>
                  Test in lab
                </Link>
                <ConfidenceMeter value={thread.ai.confidence} tone={toneClass} />
              </span>
            </div>
            <p className="ai-card__reason">{thread.ai.reason}</p>

            <div className="candidates" role="group" aria-label="Weighted evidence by route">
              {['assistant', 'client', 'none']
                .map((k) => ({ k, v: candidates[k] || 0 }))
                .sort((a, b) => b.v - a.v)
                .map(({ k, v }) => (
                  <div className="candidate" key={k}>
                    <span className="candidate__label">{CLASS_META[k].short}</span>
                    <span className="candidate__track">
                      <span
                        className={`candidate__fill candidate__fill--${CLASS_META[k].tone}`}
                        style={{ width: `${Math.round((v / candidateMax) * 100)}%` }}
                      />
                    </span>
                    <span className="candidate__score mono-num">{v.toFixed(1)}</span>
                  </div>
                ))}
            </div>

            {evidence.length > 0 && (
              <div className="ai-ledger">
                <div className="ai-ledger__head">
                  <span>Evidence considered</span>
                  <span className="mono-num">{evidence.length}</span>
                </div>
                <div className="ai-ledger__rows">
                  {evidence.slice(0, 6).map((hit) => (
                    <div className="ai-ledger__row" key={`${hit.cls}-${hit.label}`}>
                      <span className={`seg-dot seg-dot--${CLASS_META[hit.cls]?.tone || 'none'}`} />
                      <span className="ai-ledger__label">{hit.label}</span>
                      <span className="ai-ledger__w mono-num">+{hit.w.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
                {evidence.length > 6 && (
                  <span className="ai-ledger__more">and {evidence.length - 6} more</span>
                )}
              </div>
            )}

            <p className="ai-card__policy">
              Review below {policy.minEvidence.toFixed(1)} evidence or {policy.minMargin.toFixed(1)} margin.
              {thread.ai.margin !== undefined ? ` This call had a margin of ${thread.ai.margin.toFixed(1)}.` : ''}
            </p>
          </div>
        </section>

        <section className="route-card">
          <div className="route-card__head">
            <div>
              <span className="eyebrow">Reply responsibility</span>
              <p className="route-card__desc">
                {meta.description}
                {thread.ai.manual ? ' You set this manually.' : ' Based on the full conversation.'}
              </p>
            </div>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => reclassify(thread.id)}>
              <Refresh size={14} /> Re-run analysis
            </button>
          </div>
          <div className="route-options" role="group" aria-label="Who should reply">
            {ROUTE_OPTIONS.map((option) => {
              const optionMeta = CLASS_META[option];
              const active = thread.ai.classification === option;
              return (
                <button
                  key={option}
                  type="button"
                  className={`route-option route-option--${optionMeta.tone} ${active ? 'is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => !active && setClassification(thread.id, option)}
                >
                  <span className="route-option__dot" />
                  <span className="route-option__label">{optionMeta.label}</span>
                  {active && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="conversation">
          <div className="conversation__head">
            <span className="eyebrow">Conversation</span>
            <span className="conversation__count">{thread.messages.length} messages</span>
          </div>

          <div className="messages">
            {timeline.map((item) =>
              item.kind === 'event' ? (
                <TimelineEvent key={item.data.id} event={item.data} />
              ) : (
                <div
                  key={item.data.id}
                  className={`message ${item.data.direction === 'out' ? 'message--out' : ''}`}
                >
                  <Avatar
                    name={item.data.direction === 'out' ? user?.name : item.data.from.name}
                    accent={item.data.direction === 'out' ? 'ink' : client?.accent}
                    size={32}
                  />
                  <div className="message__body">
                    <div className="message__head">
                      <span className="message__from">
                        {item.data.direction === 'out' ? user?.name : item.data.from.name}
                      </span>
                      {item.data.direction === 'out' && <span className="message__you">You</span>}
                      <span className="message__email">{item.data.from.email}</span>
                      <span className="message__time mono-num">{dateWithTime(item.data.at)}</span>
                    </div>
                    <div className="message__text">{item.data.body}</div>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="composer" ref={composerRef}>
          <div className="composer__head">
            <div>
              <span className="eyebrow">Reply</span>
              <div className="composer__to">
                to {replyTarget?.name} · {replyTarget?.email}
              </div>
            </div>
            {mode === 'idle' && (
              <div className="composer__launchers">
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => {
                    setMode('manual');
                    setText('');
                    setDraftNote('');
                  }}
                >
                  Write manually
                </button>
                <button type="button" className="btn btn--primary btn--sm" onClick={() => generate('professional')}>
                  <Sparkles size={14} /> Draft reply
                </button>
              </div>
            )}
          </div>

          {thread.ai.classification === 'client' && mode !== 'idle' && (
            <p className="composer__caveat">
              This reply belongs with {client?.firstName}. Send a holding reply, or let them answer in the client view.
            </p>
          )}

          {mode === 'loading' && (
            <div className="draft-skeleton">
              <span className="skeleton-line" style={{ width: '38%' }} />
              <span className="skeleton-line" />
              <span className="skeleton-line" style={{ width: '86%' }} />
              <span className="skeleton-line" style={{ width: '64%' }} />
              <span className="draft-skeleton__note">
                <Sparkles size={13} /> Drafting a reply from the full conversation…
              </span>
            </div>
          )}

          {(mode === 'draft' || mode === 'manual') && (
            <>
              {mode === 'draft' && (
                <div className="tone-row">
                  <span className="tone-row__label">Tone</span>
                  {Object.entries(TONE_LABELS).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={`tone-chip ${tone === id ? 'is-on' : ''}`}
                      aria-pressed={tone === id}
                      onClick={() => generate(id)}
                    >
                      {label}
                    </button>
                  ))}
                  <span className="tone-row__spacer" />
                  <button type="button" className="tone-rerun" onClick={() => generate(tone)}>
                    <Refresh size={12} /> Regenerate
                  </button>
                </div>
              )}

              <textarea
                className="composer__textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={mode === 'draft' ? 8 : 6}
                placeholder="Write your reply…"
                aria-label="Reply text"
                autoFocus
              />

              {draftNote && (
                <div className="draft-note">
                  <Sparkles size={13} />
                  <span>{draftNote}</span>
                </div>
              )}

              <div className="composer__foot">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    setMode('idle');
                    setText('');
                    setDraftNote('');
                  }}
                >
                  <X size={14} /> Discard
                </button>
                <div className="composer__send">
                  <span className="composer__approval">Nothing sends until you approve it.</span>
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    disabled={!text.trim() || sending}
                    onClick={send}
                  >
                    {sending ? 'Sending…' : 'Approve and send'} <Send size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <footer className="detail__foot">
          <span>
            Synced from {clients.find((c) => c.id === thread.clientId)?.email} ·{' '}
            {thread.ai.manual ? 'Routed by hand' : 'Routed by Relay'}
          </span>
          <button type="button" className="detail__ask" onClick={() => openAskPanel()}>
            <Sparkles size={13} /> Ask Relay about this thread
          </button>
        </footer>
      </div>
    </article>
  );
}
