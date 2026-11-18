import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { activeThreads, CLASS_META } from '../lib/selectors';
import { dateWithTime, relative } from '../lib/format';
import { Avatar } from '../components/Avatar';
import { ClassificationChip } from '../components/Chips';
import { ArrowRight, ArrowUpRight, Check, Refresh, Sparkles } from '../components/Icons';
import { EmptyState } from '../components/States';

const SIGN_OFF = /^(?:best|thanks|thank you|cheers|regards|kind regards|warm regards|all the best|talk soon|speak soon)$/i;

function looksLikeSignOff(line) {
  if (!line || line.length > 40) return false;
  const bare = line.replace(/^[-–—]\s*/, '').replace(/[.,!]$/, '');
  if (SIGN_OFF.test(bare)) return true;
  return /^[A-Z][a-z]*(?: [A-Z][a-z]*)?$/.test(bare) || /^[A-Z]{1,3}$/.test(bare);
}

function excerptOf(body = '', max = 260) {
  const blocks = body.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  if (blocks.length > 1 && looksLikeSignOff(blocks[blocks.length - 1])) blocks.pop();
  const text = blocks.join(' ').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export function ReviewQueue() {
  const { threads, clients, setClassification, reclassify } = useApp();
  const navigate = useNavigate();
  const byId = new Map(clients.map((c) => [c.id, c]));
  const items = activeThreads(threads).filter(
    (t) => t.ai.classification === 'review' && t.status === 'open',
  );

  return (
    <div className="page page--scroll">
      <div className="page__inner review-page">
        <header className="page-head">
          <div className="page-head__text">
            <span className="eyebrow">Routing queue</span>
            <h1 className="page-title serif">Decisions Relay won&apos;t guess</h1>
            <p className="page-sub">
              Relay routes a conversation on its own only when the signals agree. Everything below sits under the
              confidence bar. Read the reasoning, then send it to the right person.
            </p>
          </div>
          <div className="review-page__count">
            <span className="review-page__count-value mono-num">{items.length}</span>
            <span className="review-page__count-label">awaiting a call</span>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="panel">
            <EmptyState
              title="Everything is routed"
              text="Nothing is sitting below the confidence threshold. New conversations will appear here if Relay can't decide."
              action={
                <Link to="/app/inbox" className="btn btn--outline btn--sm">
                  Open inbox <ArrowRight size={14} />
                </Link>
              }
            />
          </div>
        ) : (
          <div className="review-grid">
            {items.map((t) => {
              const client = byId.get(t.clientId);
              const inbound = [...t.messages].reverse().find((m) => m.direction === 'in');
              const candidates = t.ai.candidates || {};
              const max = Math.max(1, ...['client', 'assistant', 'none'].map((k) => candidates[k] || 0));
              return (
                <article key={t.id} className="review-card">
                  <header className="review-card__head">
                    <div className="review-card__client">
                      <Avatar name={client?.name} accent={client?.accent} size={32} />
                      <div>
                        <div className="review-card__client-name">{client?.name}</div>
                        <div className="review-card__client-company">{client?.company}</div>
                      </div>
                    </div>
                    <div className="review-card__meta">
                      <ClassificationChip classification="review" confidence={t.ai.confidence} size="xs" />
                      <span className="review-card__time">{relative(t.lastActivityAt)}</span>
                    </div>
                  </header>

                  <button className="review-card__subject" onClick={() => navigate(`/app/inbox/${t.id}`)}>
                    <h2>{t.subject}</h2>
                    <ArrowUpRight size={15} />
                  </button>

                  <p className="review-card__from">
                    {inbound?.from.name} · {dateWithTime(inbound?.at)}
                  </p>

                  <p className="review-card__excerpt">{excerptOf(inbound?.body)}</p>

                  <div className="review-card__signals">
                    <span className="eyebrow">What Relay saw</span>
                    <div className="signals">
                      {(t.ai.signals || []).map((s) => (
                        <span className="signal" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="review-card__scores">
                    {['client', 'assistant', 'none'].map((k) => (
                      <div className="candidate" key={k}>
                        <span className="candidate__label">{CLASS_META[k].short}</span>
                        <span className="candidate__track">
                          <span
                            className={`candidate__fill candidate__fill--${CLASS_META[k].tone}`}
                            style={{ width: `${Math.round(((candidates[k] || 0) / max) * 100)}%` }}
                          />
                        </span>
                        <span className="candidate__score mono-num">{(candidates[k] || 0).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>

                  <footer className="review-card__foot">
                    <button
                      type="button"
                      className="review-card__rerun"
                      onClick={() => reclassify(t.id)}
                      title="Check the signals again"
                    >
                      <Refresh size={13} /> Run again
                    </button>
                    <div className="review-card__actions">
                      <button
                        type="button"
                        className="btn btn--sm route-btn route-btn--client"
                        onClick={() => setClassification(t.id, 'client')}
                      >
                        <Check size={13} /> Client
                      </button>
                      <button
                        type="button"
                        className="btn btn--sm route-btn route-btn--assistant"
                        onClick={() => setClassification(t.id, 'assistant')}
                      >
                        <Check size={13} /> Assistant
                      </button>
                      <button
                        type="button"
                        className="btn btn--sm route-btn route-btn--none"
                        onClick={() => setClassification(t.id, 'none')}
                      >
                        <Check size={13} /> No reply
                      </button>
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
        )}

        <aside className="review-note">
          <span className="review-note__icon">
            <Sparkles size={16} />
          </span>
          <div>
            <strong>How the threshold works</strong>
            <p>
              Relay weighs the conversation&apos;s signals: who it&apos;s addressed to, what is being asked, and how
              sensitive the topic is. If the two strongest routes are too close, it stops and asks you. Any manual
              decision is remembered for that thread.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
