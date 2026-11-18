import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { useDialogFocus } from '../lib/useDialogFocus';
import { Avatar } from './Avatar';
import { ClassificationChip } from './Chips';
import { ArrowUpRight, Search, Sparkles, X } from './Icons';
import { relative } from '../lib/format';

const BASE_SUGGESTIONS = [
  'What needs my attention?',
  'What am I waiting on?',
  'Which emails need the client?',
  'Show me this week\u2019s meetings',
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function AskRelay({ open, onClose, thread }) {
  const { ask, clients } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  useDialogFocus(open, modalRef);

  useEffect(() => {
    if (!open) return undefined;
    setQuery('');
    setResult(null);
    setLoading(false);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const run = async (q) => {
    const text = (q ?? query).trim();
    if (!text) return;
    setQuery(text);
    setLoading(true);
    setResult(null);
    const [res] = await Promise.all([ask(text, thread?.id), wait(620)]);
    setLoading(false);
    if (res) setResult(res);
  };

  const suggestions = thread
    ? ['Summarize this conversation', 'Draft a reply to this thread', ...BASE_SUGGESTIONS]
    : BASE_SUGGESTIONS;

  const openThread = (id) => {
    onClose();
    navigate(`/app/inbox/${id}`);
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        ref={modalRef}
        className="ask-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Ask Relay"
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <form
          className="ask-bar"
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
        >
          <span className="ask-bar__icon">
            <Search size={18} />
          </span>
          <input
            ref={inputRef}
            className="ask-bar__input"
            data-autofocus
            aria-label="Ask Relay a question"
            placeholder={thread ? `Ask about “${thread.subject}” or anything else…` : 'Ask about any client, thread or task…'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="kbd">Esc</kbd>
          <button type="button" className="icon-btn icon-btn--sm" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </form>

        <div className="ask-body">
          {!result && !loading && (
            <div className="ask-suggestions">
              <div className="ask-suggestions__label">
                <Sparkles size={13} /> Try asking
              </div>
              <div className="ask-chips">
                {suggestions.map((s) => (
                  <button key={s} type="button" className="ask-chip" onClick={() => run(s)}>
                    {s}
                  </button>
                ))}
              </div>
              <p className="ask-hint">
                Relay answers from the connected mailboxes only. It never sends anything without your approval.
              </p>
            </div>
          )}

          {loading && (
            <div className="ask-loading">
              <span className="ask-loading__dot" />
              <span className="ask-loading__dot" />
              <span className="ask-loading__dot" />
              <span>Reading conversations across 3 mailboxes…</span>
            </div>
          )}

          {result && !loading && (
            <div className="ask-result">
              <div className="ask-answer">
                <span className="ask-answer__badge">
                  <Sparkles size={13} /> Relay
                </span>
                <p className="ask-answer__text">{result.answer}</p>
                {result.kind === 'draft' && result.threads[0] && (
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => {
                      onClose();
                      navigate(`/app/inbox/${result.threads[0].id}`, { state: { openDraft: true } });
                    }}
                  >
                    Open draft composer <ArrowUpRight size={14} />
                  </button>
                )}
              </div>

              {result.threads?.length > 0 && (
                <ul className="ask-threads">
                  {result.threads.map((t) => {
                    const client = clients.find((c) => c.id === t.clientId);
                    return (
                      <li key={t.id}>
                        <button className="ask-thread" onClick={() => openThread(t.id)}>
                          <Avatar name={client?.name} accent={client?.accent} size={28} />
                          <span className="ask-thread__text">
                            <span className="ask-thread__subject">{t.subject}</span>
                            <span className="ask-thread__meta">
                              {client?.firstName} · {relative(t.lastActivityAt)}
                            </span>
                          </span>
                          <ClassificationChip classification={t.ai.classification} size="xs" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <button type="button" className="ask-reset" onClick={() => setResult(null)}>
                Ask something else
              </button>
            </div>
          )}
        </div>

        <div className="ask-foot">
          <span>
            <Sparkles size={12} /> Answers come from your mailboxes and may need a quick check.
          </span>
          <kbd className="kbd">⌘K</kbd>
        </div>
      </div>
    </div>
  );
}
