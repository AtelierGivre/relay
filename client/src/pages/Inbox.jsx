import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import {
  activeThreads,
  inSegment,
  searchThreads,
  segmentCount,
  sortThreads,
  SEGMENT_DEFS,
} from '../lib/selectors';
import { useMediaQuery } from '../lib/useMediaQuery';
import { ThreadRow } from '../components/ThreadRow';
import { ThreadDetail } from '../components/ThreadDetail';
import { EmptyArt } from '../components/Chips';
import { Filter, Search, Sparkles, X } from '../components/Icons';
import { EmptyState } from '../components/States';

export function Inbox() {
  const { threads, clients } = useApp();
  const { threadId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1000px)');
  const [search, setSearch] = useState('');

  const segment = params.get('segment') || 'all';
  const clientFilter = params.get('client') || 'all';
  const statusFilter = params.get('status') || 'open';
  const sort = params.get('sort') || 'recent';
  const segmentDef = SEGMENT_DEFS.find((s) => s.id === segment) || SEGMENT_DEFS[0];

  const list = useMemo(() => {
    let next = activeThreads(threads).filter((t) => inSegment(t, segment));
    if (clientFilter !== 'all') next = next.filter((t) => t.clientId === clientFilter);
    if (statusFilter !== 'all') next = next.filter((t) => t.status === statusFilter);
    if (search.trim()) next = searchThreads(next, search);
    return sortThreads(next, sort);
  }, [threads, segment, clientFilter, statusFilter, sort, search]);

  const visibleIds = list.map((t) => t.id).join(',');
  const selected = threads.find((t) => t.id === threadId) || null;

  useEffect(() => {
    if (!isDesktop) return;
    if (!threadId) {
      if (list.length) navigate(`/app/inbox/${list[0].id}?${params.toString()}`, { replace: true });
      return;
    }
    if (!visibleIds.split(',').includes(threadId)) {
      if (list.length) navigate(`/app/inbox/${list[0].id}?${params.toString()}`, { replace: true });
      else navigate(`/app/inbox?${params.toString()}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, threadId, visibleIds]);

  const openThread = (id) => {
    navigate(`/app/inbox/${id}?${params.toString()}`);
  };

  const closeThread = () => {
    navigate(`/app/inbox?${params.toString()}`);
  };

  const changeSegment = (id) => {
    const next = new URLSearchParams(params);
    if (id === 'all') next.delete('segment');
    else next.set('segment', id);
    navigate(`/app/inbox?${next.toString()}`);
  };

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all' || value === 'recent') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearch('');
    navigate(`/app/inbox?segment=${segment}`);
  };

  const clientById = (id) => clients.find((c) => c.id === id);
  const filtersActive = clientFilter !== 'all' || statusFilter !== 'open' || Boolean(search.trim());

  return (
    <div className={`inbox ${selected ? 'has-detail' : ''}`}>
      <section className="inbox__list" aria-label="Conversation list">
        <header className="list-head">
          <div className="list-head__title-row">
            <div className="list-head__title">
              <h1>{segmentDef.label}</h1>
              <span className="list-head__count mono-num">{list.length}</span>
            </div>
            <label className="sort-select" title="Sort conversations">
              <Filter size={14} />
              <select value={sort} onChange={(e) => setParam('sort', e.target.value)} aria-label="Sort">
                <option value="recent">Newest</option>
                <option value="priority">Priority</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
          </div>

          <div className="segment-tabs" role="tablist" aria-label="Segments">
            {SEGMENT_DEFS.map((s) => {
              const count = segmentCount(threads, s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={segment === s.id}
                  className={`segment-tab ${segment === s.id ? 'is-active' : ''}`}
                  onClick={() => changeSegment(s.id)}
                >
                  {s.short}
                  <span className="segment-tab__count mono-num">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="list-controls">
            <div className="list-search">
              <Search size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
              />
              {search && (
                <button type="button" className="list-search__clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={13} />
                </button>
              )}
            </div>
            <select
              className="select select--sm"
              value={clientFilter}
              onChange={(e) => setParam('client', e.target.value)}
              aria-label="Filter by client"
            >
              <option value="all">All clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="select select--sm select--status"
              value={statusFilter}
              onChange={(e) => setParam('status', e.target.value)}
              aria-label="Filter by status"
            >
              <option value="open">Open</option>
              <option value="done">Completed</option>
              <option value="all">All</option>
            </select>
          </div>
        </header>

        <div className="list-body">
          {list.length === 0 ? (
            <EmptyState
              title={filtersActive ? 'No conversations match' : 'This segment is clear'}
              text={
                filtersActive
                  ? 'Try a different segment, client or status, or clear the filters.'
                  : segment === 'assistant'
                    ? 'Nothing is waiting on you. Routine replies will land here.'
                    : 'New mail will appear here as soon as it arrives.'
              }
              action={
                filtersActive && (
                  <button type="button" className="btn btn--outline btn--sm" onClick={clearFilters}>
                    Clear filters
                  </button>
                )
              }
            />
          ) : (
            <div className="thread-list">
              {list.map((t) => (
                <ThreadRow
                  key={t.id}
                  thread={t}
                  client={clientById(t.clientId)}
                  active={t.id === threadId}
                  onClick={() => openThread(t.id)}
                />
              ))}
              <div className="list-end">
                <Sparkles size={13} />
                <span>
                  {list.length} {list.length === 1 ? 'conversation' : 'conversations'} · ownership checked on every new
                  message
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="inbox__detail" aria-label="Conversation">
        {selected ? (
          <ThreadDetail thread={selected} client={clientById(selected.clientId)} onBack={isDesktop ? null : closeThread} />
        ) : (
          <div className="detail-empty">
            <EmptyArt />
            <h2>Pick a conversation</h2>
            <p>The full thread, a short brief and who owes the reply, all in one place.</p>
            <div className="detail-empty__hint">
              <kbd className="kbd">⌘K</kbd> to ask Relay anything
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
