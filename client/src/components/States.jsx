import { Logo, LogoMark } from './Logo';
import { AlertTriangle, Refresh } from './Icons';
import { EmptyArt } from './Chips';

export function BootScreen({ label = 'Connecting to your mailboxes…' }) {
  return (
    <div className="boot">
      <div className="boot__mark">
        <LogoMark size={46} />
      </div>
      <div className="boot__word">Relay</div>
      <div className="boot__bar">
        <span />
      </div>
      <p className="boot__label">{label}</p>
      <p className="boot__hint">Reading recent conversations · classifying reply responsibility</p>
    </div>
  );
}

export function ErrorScreen({
  message,
  onRetry,
  title = "We couldn't load your mailboxes",
  actionLabel = 'Try again',
}) {
  return (
    <div className="boot">
      <Logo size={30} />
      <div className="error-card">
        <span className="error-card__icon">
          <AlertTriangle size={20} />
        </span>
        <h1>{title}</h1>
        <p>{message || 'The Relay API is not responding. Check that the server is running and try again.'}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          <Refresh size={15} /> {actionLabel}
        </button>
      </div>
    </div>
  );
}

export function EmptyState({ title, text, action, art = true }) {
  return (
    <div className="empty-state">
      {art && <EmptyArt />}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function SkeletonRows({ count = 6, detail = false }) {
  return (
    <div className="skeleton-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton-row ${detail ? 'skeleton-row--detail' : ''}`}>
          <span className="skeleton-circle" />
          <span className="skeleton-lines">
            <span className="skeleton-line" style={{ width: '42%' }} />
            <span className="skeleton-line" style={{ width: '78%' }} />
            <span className="skeleton-line" style={{ width: '58%' }} />
          </span>
        </div>
      ))}
    </div>
  );
}
