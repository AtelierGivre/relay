import { Avatar } from './Avatar';
import { ClassificationChip, ClientTag, DeadlinePill } from './Chips';
import { Star } from './Icons';
import { listTime } from '../lib/format';

function inboundOf(thread) {
  return [...thread.messages].reverse().find((m) => m.direction === 'in') || thread.messages[0];
}

function snippetOf(thread) {
  const inbound = inboundOf(thread);
  const lines = inbound.body.split('\n').filter((l) => l.trim());
  const body = lines.filter((l) => !/^(hi|hey|hello|dear|bonjour)\b/i.test(l.trim())).join(' ');
  const text = (body || inbound.body).replace(/\s+/g, ' ').trim();
  return text.length > 130 ? `${text.slice(0, 127)}…` : text;
}

export function ThreadRow({ thread, client, active = false, onClick, dense = false }) {
  const inbound = inboundOf(thread);
  const waitingOnThem = thread.ai.waitingOn === 'them';
  const deadline = thread.deadlines?.[0];

  return (
    <button
      type="button"
      className={`thread-row ${active ? 'is-active' : ''} ${thread.unread ? 'is-unread' : ''} ${
        dense ? 'thread-row--dense' : ''
      }`}
      onClick={onClick}
    >
      <span className="thread-row__avatar">
        <Avatar name={client?.name} accent={client?.accent} size={dense ? 30 : 34} />
        {thread.unread && <span className="thread-row__unread-dot" />}
      </span>

      <span className="thread-row__body">
        <span className="thread-row__top">
          <span className="thread-row__sender truncate">{inbound.from.name}</span>
          <ClientTag client={client} />
          <span className="thread-row__time mono-num">{listTime(thread.lastActivityAt)}</span>
        </span>

        <span className="thread-row__subject-line">
          <span className="thread-row__subject truncate">{thread.subject}</span>
          {thread.starred && (
            <span className="thread-row__star" role="img" aria-label="Starred">
              <Star size={12} filled />
            </span>
          )}
        </span>

        {!dense && <span className="thread-row__snippet truncate">{snippetOf(thread)}</span>}

        <span className="thread-row__foot">
          <ClassificationChip classification={thread.ai.classification} size="xs" />
          {deadline && <DeadlinePill at={deadline.at} kind={deadline.kind} label={deadline.label} compact />}
          {waitingOnThem ? (
            <span className="thread-row__waiting" title={`Waiting on ${inbound.from.name}`}>
              Waiting
            </span>
          ) : !deadline ? (
            <span className="thread-row__waiting">
              {thread.status === 'done' ? 'Completed' : `${thread.messages.length} messages`}
            </span>
          ) : null}
          {thread.clientAction && (
            <span className={`thread-row__client-action client-action--${thread.clientAction.type}`}>
              {thread.clientAction.type === 'handled' ? 'Client handled' : 'Client handed over'}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
