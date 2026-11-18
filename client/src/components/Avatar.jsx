import { initials as toInitials } from '../lib/format';

export function Avatar({ name, initials, accent = 'sage', size = 34, className = '', title }) {
  const label = initials || toInitials(name || '');
  return (
    <span
      className={`avatar avatar--${accent} ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.33) }}
      title={title || name}
      aria-hidden={!title}
    >
      {label}
    </span>
  );
}

export function AvatarStack({ people, size = 26 }) {
  return (
    <span className="avatar-stack">
      {people.map((p) => (
        <Avatar key={p.id || p.name} name={p.name} accent={p.accent} size={size} />
      ))}
    </span>
  );
}
