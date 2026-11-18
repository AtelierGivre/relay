import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { relative, dayLabel } from '../lib/format';
import { Avatar } from '../components/Avatar';
import { LogoMark } from '../components/Logo';
import { Popover } from '../components/Popover';
import { TakeoverModal } from '../components/TakeoverModal';
import {
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  InboxIcon,
  Sparkles,
  Users,
} from '../components/Icons';

function messageSubject(thread) {
  return [...thread.messages].reverse().find((m) => m.direction === 'in') || thread.messages[0];
}

function clientThreads(threads, clientId) {
  return threads
    .filter((t) => t.clientId === clientId && !t.archived)
    .sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));
}

export function ClientHome() {
  const { clients, threads, user } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [takeover, setTakeover] = useState(null);

  const activeId = params.get('client') || clients[0]?.id;
  const client = clients.find((c) => c.id === activeId) || clients[0];

  const all = useMemo(() => (client ? clientThreads(threads, client.id) : []), [threads, client]);
  const needs = all.filter((t) => t.status === 'open' && t.ai.classification === 'client');
  const handedOver = all.filter((t) => t.ai.classification === 'assistant' && t.status === 'open');
  const recent = all.filter((t) => t.clientAction).slice(0, 4);

  const switchClient = (id) => setParams({ client: id }, { replace: true });

  if (!client) return null;

  const firstName = client.firstName;

  return (
    <div className="client-view">
      <header className="client-top">
        <Link to="/" className="client-top__brand" aria-label="Relay home">
          <LogoMark size={26} />
          <span>Relay</span>
        </Link>
        <span className="client-top__divider" />
        <span className="client-top__label">Your inbox, filtered</span>
        <div className="client-top__right">
          <Popover
            align="right"
            width={236}
            trigger={({ toggle, open }) => (
              <button
                type="button"
                className="client-switcher"
                onClick={toggle}
                aria-haspopup="true"
                aria-expanded={open}
              >
                <Avatar name={client.name} accent={client.accent} size={26} />
                <span className="client-switcher__text">
                  <small>Viewing as</small>
                  <strong>{firstName}</strong>
                </span>
                <ChevronDown size={14} />
              </button>
            )}
          >
            <div className="client-switcher__head">Switch client view</div>
            {clients.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`client-switcher__item ${c.id === client.id ? 'is-on' : ''}`}
                onClick={() => switchClient(c.id)}
              >
                <Avatar name={c.name} accent={c.accent} size={26} />
                <span>
                  <strong>{c.name}</strong>
                  <small>{c.company}</small>
                </span>
                {c.id === client.id && <Check size={14} />}
              </button>
            ))}
          </Popover>
        </div>
      </header>

      <main className="client-main">
        <section className="client-hero">
          <span className="client-hero__eyebrow">{dayLabel(new Date().toISOString())}</span>
          <h1 className="client-hero__title serif">
            {needs.length > 0 ? (
              <>
                {needs.length === 1 ? 'One reply needs' : `${needs.length} replies need`} you, {firstName}.
              </>
            ) : (
              <>You&apos;re all caught up, {firstName}.</>
            )}
          </h1>
          <p className="client-hero__sub">
            {needs.length > 0
              ? `${user?.firstName || 'Ananya'} has already handled everything else. These are the conversations only you can answer.`
              : `${user?.firstName || 'Ananya'} is keeping an eye on the inbox. Anything that needs your judgment will land here.`}
          </p>

          <div className="client-assistant">
            <Avatar name={user?.name || 'Ananya Rao'} accent="ink" size={30} />
            <div>
              <strong>{user?.name || 'Ananya Rao'}</strong>
              <span>Your assistant · {handedOver.length} {handedOver.length === 1 ? 'thread' : 'threads'} in the queue</span>
            </div>
            <span className="client-assistant__live">
              <span className="status-dot status-dot--green" /> Watching the inbox
            </span>
          </div>
        </section>

        {needs.length > 0 ? (
          <section className="client-needs" aria-label="Conversations needing your reply">
            <div className="client-needs__head">
              <h2>Needs your reply</h2>
              <span>
                {needs.length} {needs.length === 1 ? 'conversation' : 'conversations'} waiting on you
              </span>
            </div>
            <div className="client-cards">
              {needs.map((t) => {
                const inbound = messageSubject(t);
                return (
                  <article key={t.id} className="client-card">
                    <div className="client-card__top">
                      <Avatar name={inbound.from.name} accent={client.accent} size={38} />
                      <div className="client-card__who">
                        <strong>{inbound.from.name}</strong>
                        <span>{inbound.from.email}</span>
                      </div>
                      <span className="client-card__when">{relative(inbound.at)}</span>
                    </div>

                    <h2 className="client-card__subject">{t.subject}</h2>

                    <p className="client-card__summary">{t.ai.summary}</p>

                    <div className="client-card__why">
                      <span className="client-card__why-icon">
                        <Sparkles size={13} />
                      </span>
                      <p>
                        <strong>Why you&apos;re needed</strong>
                        {t.ai.reason}
                      </p>
                    </div>

                    <div className="client-card__foot">
                      <span className="client-card__meta">
                        Received {relative(inbound.at)}
                        {t.deadlines?.[0] ? ` · ${t.deadlines[0].label} ${dayLabel(t.deadlines[0].at)}` : ''}
                      </span>
                      <div className="client-card__actions">
                        <button
                          type="button"
                          className="client-link"
                          onClick={() => setTakeover(t)}
                        >
                          Ask Ananya to handle
                        </button>
                        <Link to={`/client/thread/${t.id}`} className="btn btn--primary btn--sm">
                          Open conversation <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="client-empty">
            <span className="client-empty__mark">
              <CheckCheck size={22} />
            </span>
            <h2 className="serif">Nothing needs your reply</h2>
            <p>
              {user?.firstName || 'Ananya'} is handling the inbox. If something needs your judgment, it will appear
              here and you&apos;ll get a nudge.
            </p>
            <div className="client-empty__note">
              <InboxIcon size={14} /> {handedOver.length} conversations are being handled for you right now
            </div>
          </section>
        )}

        {recent.length > 0 && (
          <section className="client-history">
            <div className="client-history__head">
              <h2>Recently closed</h2>
              <span>Changes here show up in {user?.firstName || 'Ananya'}&apos;s dashboard instantly.</span>
            </div>
            <ul className="client-history__list">
              {recent.map((t) => (
                <li key={t.id}>
                  <Link to={`/client/thread/${t.id}`} className="client-history__row">
                    <span className={`client-history__mark client-history__mark--${t.clientAction.type}`}>
                      {t.clientAction.type === 'handled' ? <Check size={12} /> : <Users size={12} />}
                    </span>
                    <span className="client-history__body">
                      <span className="client-history__subject truncate">{t.subject}</span>
                      <span className="client-history__meta">
                        {t.clientAction.type === 'handled' ? 'You marked this handled' : 'You asked Ananya to take over'} ·{' '}
                        {relative(t.clientAction.at)}
                      </span>
                    </span>
                    <span className={`client-history__tag client-history__tag--${t.clientAction.type}`}>
                      {t.clientAction.type === 'handled' ? 'Handled' : 'With Ananya'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="client-note">
          <Sparkles size={14} />
          <p>
            Relay only shows conversations routed to you, with a plain reason. You can always ask{' '}
            {user?.firstName || 'Ananya'} to take something over instead.
          </p>
        </section>
      </main>

      <footer className="client-foot">
        <span>Relay · client view</span>
        <span className="client-foot__links">
          <Link to="/">About Relay</Link>
          <span className="dot-sep" />
          <button type="button" className="link-btn" onClick={() => navigate('/app')}>
            Assistant workspace
          </button>
        </span>
      </footer>

      <TakeoverModal
        open={Boolean(takeover)}
        thread={takeover}
        client={client}
        onClose={() => setTakeover(null)}
      />
    </div>
  );
}
