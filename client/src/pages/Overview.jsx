import { Link } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import {
  activeThreads,
  clientLoad,
  getStats,
  upcomingDeadlines,
} from '../lib/selectors';
import {
  fullDate,
  greeting,
  plural,
  relative,
  timeOf,
} from '../lib/format';
import { Avatar } from '../components/Avatar';
import { ClientTag, DeadlinePill, EmptyArt } from '../components/Chips';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  Clock,
  Flask,
  Review as ReviewIcon,
  Sparkles,
  Star,
} from '../components/Icons';

function StatCell({ to, label, value, hint, tone }) {
  return (
    <Link to={to} className={`ovy-stat ovy-stat--${tone}`}>
      <span className="ovy-stat__label">
        <span className="ovy-stat__dot" />
        {label}
      </span>
      <span className="ovy-stat__value serif mono-num">{value}</span>
      <span className="ovy-stat__hint">{hint}</span>
      <ArrowUpRight size={14} className="ovy-stat__arrow" />
    </Link>
  );
}

function MoveRow({ thread, client }) {
  const inbound = [...thread.messages].reverse().find((m) => m.direction === 'in');
  const deadline = thread.deadlines?.[0];
  return (
    <Link to={`/app/inbox/${thread.id}`} className="move-row">
      <Avatar name={client?.name} accent={client?.accent} size={32} />
      <div className="move-row__body">
        <div className="move-row__top">
          <span className="move-row__subject truncate">{thread.subject}</span>
          <span className="move-row__time mono-num">{relative(thread.lastActivityAt)}</span>
        </div>
        <div className="move-row__meta">
          <span className="move-row__sender truncate">{inbound?.from.name}</span>
          <ClientTag client={client} />
          {deadline && <DeadlinePill at={deadline.at} kind={deadline.kind} label={deadline.label} compact />}
        </div>
      </div>
      <ArrowUpRight size={15} className="move-row__arrow" />
    </Link>
  );
}

export function Overview() {
  const { user, threads, clients } = useApp();
  const stats = getStats(threads);
  const load = clientLoad(threads, clients);
  const deadlines = upcomingDeadlines(threads, 5);
  const byId = new Map(clients.map((c) => [c.id, c]));

  const moves = activeThreads(threads)
    .filter((t) => t.status === 'open' && t.ai.classification === 'assistant')
    .sort((a, b) => {
      const score = (t) =>
        (t.starred ? 3 : 0) +
        ((t.deadlines || []).length ? 2 : 0) +
        (t.ai.waitingOn === 'them' ? -1 : 0) +
        t.ai.confidence;
      return score(b) - score(a);
    })
    .slice(0, 5);

  const reviews = activeThreads(threads).filter(
    (t) => t.ai.classification === 'review' && t.status === 'open',
  );

  const oldestWaiting = activeThreads(threads)
    .filter((t) => t.ai.waitingOn === 'them')
    .sort((a, b) => new Date(a.lastActivityAt) - new Date(b.lastActivityAt))[0];

  return (
    <div className="page page--scroll">
      <div className="page__inner overview">
        <header className="overview-hero">
          <div className="overview-hero__copy">
            <span className="eyebrow">{fullDate(new Date().toISOString())}</span>
            <h1 className="page-title serif">{greeting(user?.name || 'Ananya')}</h1>
            <p className="page-sub">
              {stats.total - stats.done} open conversations across {plural(clients.length, 'client')}.{' '}
              {stats.review > 0
                ? `${stats.review} still need a routing decision.`
                : 'Every conversation has a clear owner.'}
            </p>
            <div className="overview-hero__actions">
              <Link to="/app/inbox?segment=assistant" className="btn btn--primary">
                Triage my queue <ArrowRight size={15} />
              </Link>
              {reviews.length > 0 && (
                <Link to="/app/review" className="btn btn--outline">
                  Review {plural(reviews.length, 'flagged thread')}
                </Link>
              )}
              <Link to="/app/lab" className="btn btn--ghost">
                <Flask size={14} /> Routing lab
              </Link>
            </div>
          </div>

          <div className="overview-stats" aria-label="Inbox at a glance">
            <StatCell
              to="/app/inbox?segment=assistant"
              label="Needs you"
              value={stats.needsYou}
              hint="Routine replies you own"
              tone="assistant"
            />
            <StatCell
              to="/app/inbox?segment=client"
              label="Needs the client"
              value={stats.needsClient}
              hint="Waiting on a personal reply"
              tone="client"
            />
            <StatCell
              to="/app/inbox?segment=waiting"
              label="Waiting on them"
              value={stats.waiting}
              hint={oldestWaiting ? `Oldest ${relative(oldestWaiting.lastActivityAt)}` : 'Nothing outstanding'}
              tone="waiting"
            />
            <StatCell
              to="/app/review"
              label="Needs review"
              value={stats.review}
              hint={stats.review ? 'Waiting for your call' : 'All routed'}
              tone="review"
            />
          </div>
        </header>

        {reviews.length > 0 && (
          <section className="review-callout">
            <div className="review-callout__icon">
              <ReviewIcon size={17} />
            </div>
            <div className="review-callout__body">
              <strong>
                {plural(reviews.length, 'conversation')} couldn&apos;t be routed automatically
              </strong>
              <p>
                The signals conflict, so Relay flagged them for a human call
                {reviews[0] ? `, starting with “${reviews[0].subject}”.` : '.'}
              </p>
            </div>
            <Link to="/app/review" className="btn btn--outline btn--sm">
              Review now <ArrowRight size={14} />
            </Link>
          </section>
        )}

        <div className="overview__grid">
          <section className="panel panel--flush">
            <header className="panel__head">
              <div>
                <h2 className="panel__title">Your next moves</h2>
                <p className="panel__sub">Replies you own, nearest deadline first</p>
              </div>
              <Link to="/app/inbox?segment=assistant" className="panel__link">
                Open inbox <ArrowRight size={13} />
              </Link>
            </header>

            {moves.length ? (
              <div className="move-list">
                {moves.map((t) => (
                  <MoveRow key={t.id} thread={t} client={byId.get(t.clientId)} />
                ))}
              </div>
            ) : (
              <div className="panel__empty">
                <EmptyArt />
                <h3>Nothing owed from you</h3>
                <p>Every assistant thread is answered. Check the client queue next.</p>
              </div>
            )}

            <footer className="panel__foot">
              <span>
                <Sparkles size={13} /> {stats.noReply} conversations filed without a reply
              </span>
              <Link to="/app/inbox?segment=none">See what Relay cleared</Link>
            </footer>
          </section>

          <div className="overview__side">
            <section className="panel">
              <header className="panel__head">
                <div>
                  <h2 className="panel__title">Next up</h2>
                  <p className="panel__sub">Dates found in email</p>
                </div>
                <span className="panel__count mono-num">{deadlines.length}</span>
              </header>
              <div className="week-list">
                {deadlines.length ? (
                  deadlines.map((d) => {
                    const date = new Date(d.at);
                    return (
                      <Link key={`${d.thread.id}-${d.label}`} to={`/app/inbox/${d.thread.id}`} className="week-item">
                        <span className="week-item__date">
                          <span className="week-item__day mono-num">{date.getDate()}</span>
                          <span className="week-item__mon">
                            {date.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                        </span>
                        <span className="week-item__body">
                          <span className="week-item__label truncate">{d.label}</span>
                          <span className="week-item__meta">
                            {byId.get(d.thread.clientId)?.firstName} · {timeOf(d.at)}
                            {d.kind === 'meeting' ? ' · meeting' : ' · deadline'}
                          </span>
                        </span>
                        {d.kind === 'meeting' ? <Calendar size={14} /> : <Clock size={14} />}
                      </Link>
                    );
                  })
                ) : (
                  <p className="panel__empty-text">No dates extracted this week.</p>
                )}
              </div>
            </section>

            <section className="panel">
              <header className="panel__head">
                <div>
                  <h2 className="panel__title">Clients</h2>
                  <p className="panel__sub">Open work by mailbox</p>
                </div>
              </header>
              <div className="client-list">
                {load.map(({ client, open, unread, needsClient }) => (
                  <Link key={client.id} to={`/app/inbox?client=${client.id}`} className="client-row">
                    <Avatar name={client.name} accent={client.accent} size={34} />
                    <span className="client-row__body">
                      <span className="client-row__name">{client.name}</span>
                      <span className="client-row__company">{client.company}</span>
                    </span>
                    <span className="client-row__counts">
                      <span className="client-row__count mono-num">{open} open</span>
                      {needsClient > 0 && <span className="client-row__needs">{needsClient} for them</span>}
                    </span>
                    {unread > 0 && <span className="client-row__unread" aria-label={`${unread} unread`} />}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="overview__foot">
          <span>
            <Check size={13} /> {stats.done} completed · {stats.important} marked important · {stats.unread} unread
          </span>
          <span>
            <Star size={13} /> Relay checks ownership again whenever a new message arrives.
          </span>
        </footer>
      </div>
    </div>
  );
}
