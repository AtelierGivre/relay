import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { activeThreads, CLASS_META } from '../lib/selectors';
import { relative } from '../lib/format';
import { Avatar } from '../components/Avatar';
import { ClientTag, DeadlinePill } from '../components/Chips';
import { Modal } from '../components/Modal';
import { ArrowRight, Check, More, Sparkles } from '../components/Icons';

const COLUMNS = ['assistant', 'client', 'review', 'none'];

export function Board() {
  const { threads, clients, setClassification } = useApp();
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(null);
  const [hover, setHover] = useState(null);
  const [moving, setMoving] = useState(null);

  const byId = new Map(clients.map((c) => [c.id, c]));
  const open = activeThreads(threads).filter((t) => t.status === 'open');
  const movingThread = open.find((t) => t.id === moving);

  const drop = async (column) => {
    setHover(null);
    if (!dragging) return;
    const thread = threads.find((t) => t.id === dragging);
    setDragging(null);
    if (!thread || thread.ai.classification === column) return;
    await setClassification(thread.id, column);
  };

  return (
    <div className="page page--scroll">
      <div className="page__inner board-page">
        <header className="page-head">
          <div className="page-head__text">
            <span className="eyebrow">Responsibility</span>
            <h1 className="page-title serif">Who owes the reply?</h1>
            <p className="page-sub">
              Every open conversation across your clients. Drag a card or use its menu to change ownership, or open it
              to see why Relay routed it.
            </p>
          </div>
          <div className="board-legend">
            <span className="board-legend__item">
              <span className="seg-dot seg-dot--assistant" /> {open.filter((t) => t.ai.classification === 'assistant').length} yours
            </span>
            <span className="board-legend__item">
              <span className="seg-dot seg-dot--client" /> {open.filter((t) => t.ai.classification === 'client').length} client
            </span>
            <span className="board-legend__item">
              <span className="seg-dot seg-dot--review" /> {open.filter((t) => t.ai.classification === 'review').length} review
            </span>
            <span className="board-legend__item">
              <span className="seg-dot seg-dot--none" /> {open.filter((t) => t.ai.classification === 'none').length} no reply
            </span>
          </div>
        </header>

        <div className="board">
          {COLUMNS.map((column) => {
            const meta = CLASS_META[column];
            const items = open
              .filter((t) => t.ai.classification === column)
              .sort((a, b) => {
                const aD = a.deadlines?.[0]?.at;
                const bD = b.deadlines?.[0]?.at;
                if (aD && bD) return new Date(aD) - new Date(bD);
                if (aD) return -1;
                if (bD) return 1;
                return new Date(b.lastActivityAt) - new Date(a.lastActivityAt);
              });
            return (
              <section
                key={column}
                className={`board-col board-col--${column} ${hover === column ? 'is-hover' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHover(column);
                }}
                onDragLeave={() => setHover((h) => (h === column ? null : h))}
                onDrop={() => drop(column)}
              >
                <header className="board-col__head">
                  <div className="board-col__title">
                    <span className="seg-dot seg-dot--split" data-tone={column} />
                    <h2>{meta.label}</h2>
                    <span className="board-col__count mono-num">{items.length}</span>
                  </div>
                  <p className="board-col__desc">{meta.blurb}</p>
                </header>

                <div className="board-col__body">
                  {items.map((t) => {
                    const client = byId.get(t.clientId);
                    const inbound = [...t.messages].reverse().find((m) => m.direction === 'in');
                    const deadline = t.deadlines?.[0];
                    return (
                      <article
                        key={t.id}
                        className={`board-card ${dragging === t.id ? 'is-dragging' : ''}`}
                        draggable
                        tabIndex={0}
                        role="link"
                        aria-label={`Open ${t.subject}`}
                        onDragStart={(e) => {
                          setDragging(t.id);
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', t.id);
                        }}
                        onDragEnd={() => {
                          setDragging(null);
                          setHover(null);
                        }}
                        onClick={() => navigate(`/app/inbox/${t.id}`)}
                        onKeyDown={(e) => {
                          if (e.target !== e.currentTarget) return;
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/app/inbox/${t.id}`);
                          }
                        }}
                      >
                        <div className="board-card__top">
                          <ClientTag client={client} />
                          <span className="board-card__time mono-num">{relative(t.lastActivityAt)}</span>
                          <button
                            type="button"
                            className="board-card__move"
                            title="Change who replies"
                            aria-label={`Change who replies to ${t.subject}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setMoving(t.id);
                            }}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <More size={14} />
                          </button>
                        </div>
                        <h3 className="board-card__subject">{t.subject}</h3>
                        <div className="board-card__sender">
                          <Avatar name={inbound?.from.name} accent={client?.accent} size={20} />
                          <span className="truncate">{inbound?.from.name}</span>
                        </div>
                        {deadline && (
                          <DeadlinePill at={deadline.at} kind={deadline.kind} label={deadline.label} compact />
                        )}
                        <div className="board-card__foot">
                          <span className={`board-card__conf board-card__conf--${meta.tone}`}>
                            <span className="board-card__conf-dot" /> {Math.round(t.ai.confidence * 100)}%
                          </span>
                          {t.ai.waitingOn === 'them' ? (
                            <span className="board-card__wait">Waiting on them</span>
                          ) : (
                            <span className="board-card__wait">
                              {t.messages.length} {t.messages.length === 1 ? 'message' : 'messages'}
                            </span>
                          )}
                          <ArrowRight size={13} className="board-card__arrow" />
                        </div>
                      </article>
                    );
                  })}

                  {items.length === 0 && (
                    <div className="board-col__empty">
                      <span className={`board-col__empty-dot board-col__empty-dot--${column}`} />
                      <p>Nothing here</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <p className="board-hint">
          <Sparkles size={13} /> Drag a card, or use its menu, to change ownership. Every move is saved to the
          conversation history.
        </p>
      </div>

      <Modal
        open={Boolean(movingThread)}
        onClose={() => setMoving(null)}
        title="Who should reply?"
        subtitle={movingThread?.subject}
        width={470}
      >
        <div className="move-options">
          {COLUMNS.map((column) => {
            const meta = CLASS_META[column];
            const active = movingThread?.ai.classification === column;
            return (
              <button
                key={column}
                type="button"
                className={`move-option move-option--${meta.tone} ${active ? 'is-active' : ''}`}
                onClick={() => {
                  const id = movingThread.id;
                  setMoving(null);
                  if (!active) setClassification(id, column);
                }}
              >
                <span className={`seg-dot seg-dot--${meta.tone}`} />
                <span className="move-option__text">
                  <strong>{meta.label}</strong>
                  <span>{meta.description}</span>
                </span>
                {active ? <Check size={15} className="move-option__mark" /> : <ArrowRight size={14} className="move-option__mark" />}
              </button>
            );
          })}
        </div>
        <p className="move-note">
          Moving a card overrides the route. Running the analysis again restores the evidence-based answer.
        </p>
      </Modal>
    </div>
  );
}
