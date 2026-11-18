import { CLASS_META } from '../lib/selectors';
import { Calendar, Clock } from './Icons';

export function ClassificationChip({ classification, confidence, size = 'sm', withDot = true }) {
  const meta = CLASS_META[classification] || CLASS_META.review;
  return (
    <span className={`chip chip--${meta.tone} chip--${size}`}>
      {withDot && <span className="chip__dot" />}
      <span>{size === 'xs' ? meta.short : meta.label}</span>
      {confidence !== undefined && <span className="chip__conf">{Math.round(confidence * 100)}%</span>}
    </span>
  );
}

export function Tag({ children, tone = 'neutral' }) {
  return <span className={`tag tag--${tone}`}>{children}</span>;
}

export function CountPill({ children, tone = 'neutral' }) {
  return <span className={`count-pill count-pill--${tone}`}>{children}</span>;
}

export function DeadlinePill({ at, label, kind = 'deadline', compact = false }) {
  const d = new Date(at);
  const date = d.toLocaleDateString('en-US', { weekday: compact ? undefined : 'short', day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return (
    <span className={`deadline-pill deadline-pill--${kind}`}>
      {kind === 'meeting' ? <Calendar size={12} /> : <Clock size={12} />}
      <span className="truncate">
        {label ? `${label} · ` : ''}
        {date}
        {!compact && kind !== 'meeting' ? ` · ${time}` : ''}
      </span>
    </span>
  );
}

export function ClientTag({ client }) {
  if (!client) return null;
  return (
    <span className={`client-tag client-tag--${client.accent}`}>
      <span className="client-tag__dot" />
      {client.firstName}
    </span>
  );
}

export function StatusDot({ tone = 'green', pulse = false }) {
  return <span className={`status-dot status-dot--${tone} ${pulse ? 'is-pulsing' : ''}`} />;
}

export function EmptyArt() {
  return (
    <svg viewBox="0 0 120 90" width="120" height="90" fill="none" aria-hidden="true" className="empty-art">
      <rect x="24" y="20" width="72" height="50" rx="10" stroke="currentColor" strokeWidth="1.4" opacity=".28" />
      <path d="M34 38h30M34 48h44M34 58h22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".35" />
      <circle cx="92" cy="24" r="11" fill="var(--green-soft)" stroke="var(--green-line)" strokeWidth="1.2" />
      <path d="m87.5 24 3 3 5.5-6" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
