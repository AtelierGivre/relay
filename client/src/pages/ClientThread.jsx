import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { dateWithTime, dayLabel, relative } from '../lib/format';
import { Avatar } from '../components/Avatar';
import { LogoMark } from '../components/Logo';
import { TakeoverModal } from '../components/TakeoverModal';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCheck,
  Clock,
  Send,
  Sparkles,
  Users,
} from '../components/Icons';

export function ClientThread() {
  const { threadId } = useParams();
  const { threads, clients, user, clientAction } = useApp();
  const navigate = useNavigate();
  const [takeover, setTakeover] = useState(false);
  const [busy, setBusy] = useState(false);

  const thread = threads.find((t) => t.id === threadId);
  const client = thread ? clients.find((c) => c.id === thread.clientId) : null;

  if (!thread) {
    return (
      <div className="client-view">
        <header className="client-top">
          <Link to="/client" className="client-top__brand">
            <LogoMark size={26} />
            <span>Relay</span>
          </Link>
        </header>
        <main className="client-main client-main--narrow">
          <div className="client-empty">
            <span className="client-empty__mark">
              <CheckCheck size={22} />
            </span>
            <h2 className="serif">This conversation isn&apos;t available</h2>
            <p>It may have been archived or removed from this workspace.</p>
            <Link to="/client" className="btn btn--primary btn--sm">
              Back to your inbox
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const needsYou = thread.ai.classification === 'client' && thread.status === 'open';
  const inbound = [...thread.messages].reverse().find((m) => m.direction === 'in') || thread.messages[0];
  const clientHandled = thread.clientAction?.type === 'handled';
  const handedOver = thread.clientAction?.type === 'takeover';
  const closed = thread.status === 'done';

  const markHandled = async () => {
    setBusy(true);
    const updated = await clientAction(thread.id, 'handled', '');
    setBusy(false);
    if (updated) navigate(`/client?client=${thread.clientId}`);
  };

  return (
    <div className="client-view">
      <header className="client-top">
        <Link to={`/client?client=${thread.clientId}`} className="client-top__brand">
          <LogoMark size={26} />
          <span>Relay</span>
        </Link>
        <span className="client-top__divider" />
        <Link to={`/client?client=${thread.clientId}`} className="client-top__back">
          <ArrowLeft size={14} /> Back to your inbox
        </Link>
        <div className="client-top__right">
          <span className="client-top__assistant">
            <Avatar name={user?.name || 'Ananya Rao'} accent="ink" size={24} />
            {user?.firstName || 'Ananya'} is on it
          </span>
        </div>
      </header>

      <main className="client-main client-main--narrow">
        <article className="cthread">
          <header className="cthread__head">
            <span className="client-hero__eyebrow">Conversation · {client?.firstName}</span>
            <h1 className="cthread__subject serif">{thread.subject}</h1>
            <div className="cthread__meta">
              <Avatar name={inbound.from.name} accent={client?.accent} size={30} />
              <div>
                <strong>{inbound.from.name}</strong>
                <span>
                  {inbound.from.email} · {dateWithTime(inbound.at)}
                </span>
              </div>
              <span className={`cthread__state ${needsYou ? 'is-open' : 'is-closed'}`}>
                {clientHandled ? 'Handled' : handedOver ? 'With Ananya' : needsYou ? 'Needs your reply' : closed ? 'Closed' : 'No action needed'}
              </span>
            </div>
          </header>

          {clientHandled && (
            <div className="cthread__banner cthread__banner--done">
              <Check size={15} />
              <div>
                <strong>You marked this handled</strong>
                <span>
                  {relative(thread.clientAction?.at || thread.lastActivityAt)} · {user?.firstName || 'Ananya'} sees this
                  in her dashboard.
                </span>
              </div>
            </div>
          )}

          {handedOver && (
            <div className="cthread__banner cthread__banner--handover">
              <Users size={15} />
              <div>
                <strong>{user?.firstName || 'Ananya'} is taking care of this</strong>
                <span>
                  {thread.clientAction?.note
                    ? `Your note: “${thread.clientAction.note}”`
                    : 'Ananya has the full conversation and will reply on your behalf.'}
                </span>
              </div>
            </div>
          )}

          <section className="cthread__brief">
            <span className="cthread__brief-label">
              <Sparkles size={13} /> The short version
            </span>
            <p className="cthread__summary">{thread.ai.summary}</p>

            <div className="cthread__why">
              <strong>Why this needed you</strong>
              <p>{thread.ai.reason}</p>
            </div>

            {thread.deadlines?.length > 0 && (
              <div className="cthread__dates">
                {thread.deadlines.map((d) => (
                  <span key={`${d.label}-${d.at}`} className={`cthread__date cthread__date--${d.kind}`}>
                    {d.kind === 'meeting' ? <Calendar size={13} /> : <Clock size={13} />}
                    <span>
                      <strong>{d.label}</strong>
                      {dayLabel(d.at)}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="cthread__conversation">
            <div className="cthread__conv-head">
              <span className="eyebrow">The conversation</span>
              <span>
                {thread.messages.length} {thread.messages.length === 1 ? 'message' : 'messages'}
              </span>
            </div>

            <div className="cthread__messages">
              {thread.messages.map((m) => {
                const mine = m.direction === 'out';
                return (
                  <div key={m.id} className={`cmsg ${mine ? 'cmsg--mine' : ''}`}>
                    <Avatar
                      name={mine ? client?.name : m.from.name}
                      accent={mine ? client?.accent : 'ink'}
                      size={30}
                    />
                    <div className="cmsg__body">
                      <div className="cmsg__head">
                        <strong>{mine ? `${client?.firstName} (you)` : m.from.name}</strong>
                        <span>{dateWithTime(m.at)}</span>
                      </div>
                      <div className="cmsg__text">{m.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {closed && (
            <div className="cthread__done">
              <span className="cthread__done-icon">
                <CheckCheck size={18} />
              </span>
              <div>
                <strong>Nothing else needed here</strong>
                <span>This conversation is closed. {user?.firstName || 'Ananya'} can reopen it if a new message arrives.</span>
              </div>
            </div>
          )}
        </article>

        <div className="client-note">
          <Sparkles size={14} />
          <p>
            {needsYou
              ? 'Reply from your mail app, then mark it handled here. Or ask Ananya to take it over.'
              : 'Relay keeps this conversation in your history so you can always check what was decided.'}
          </p>
        </div>
      </main>

      {needsYou ? (
        <div className="cthread-actions">
          <div className="cthread-actions__inner">
            <div className="cthread-actions__copy">
              <strong>Two ways to close this out</strong>
              <span>Handled it yourself, or let {user?.firstName || 'Ananya'} take the reply.</span>
            </div>
            <div className="cthread-actions__buttons">
              <button type="button" className="btn btn--outline" onClick={() => setTakeover(true)}>
                <Users size={14} /> Ask Ananya to handle
              </button>
              <button type="button" className="btn btn--primary" disabled={busy} onClick={markHandled}>
                <Check size={14} /> {busy ? 'Saving…' : 'Mark as handled'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="cthread-actions">
          <div className="cthread-actions__inner">
            <div className="cthread-actions__copy">
              <strong>{clientHandled ? 'You marked this handled' : handedOver ? 'With Ananya' : 'Closed'}</strong>
              <span>No action needed from you right now.</span>
            </div>
            <Link to={`/client?client=${thread.clientId}`} className="btn btn--outline">
              Back to your inbox <Send size={13} />
            </Link>
          </div>
        </div>
      )}

      <TakeoverModal
        open={takeover}
        thread={thread}
        client={client}
        onClose={() => setTakeover(false)}
      />
    </div>
  );
}
