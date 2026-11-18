const dateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
const dayFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' });
const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
const timeFmtShort = new Intl.DateTimeFormat('en-US', { hour: 'numeric' });

const isSameDay = (a, b) => a.toDateString() === b.toDateString();

export function timeOf(iso) {
  return timeFmt.format(new Date(iso));
}

export function listTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  if (isSameDay(d, now)) return timeOf(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return 'Yesterday';
  if (now - d < 6 * 864e5) return dateFmt.format(d).split(' ')[0];
  return dayFmt.format(d);
}

export function relative(iso) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (diff < 60e3) return 'just now';
  if (diff < 36e5) return `${Math.max(1, Math.round(diff / 60e3))}m ago`;
  if (diff < 864e5) return `${Math.round(diff / 36e5)}h ago`;
  if (diff < 7 * 864e5) return `${Math.round(diff / 864e5)}d ago`;
  return dayFmt.format(new Date(iso));
}

export function dayLabel(iso) {
  const d = new Date(iso);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (isSameDay(d, now)) return 'Today';
  if (isSameDay(d, tomorrow)) return 'Tomorrow';
  return dateFmt.format(d);
}

export function deadlineLabel(iso) {
  const d = new Date(iso);
  const now = new Date();
  const time = isSameDay(d, now) || d.getHours() % 12 !== 0 || d.getMinutes() !== 0 ? `, ${timeOf(iso)}` : '';
  return `${dayLabel(iso)}${time}`.replace(', ', ' · ');
}

export function dateWithTime(iso, { withWeekday = true } = {}) {
  const d = new Date(iso);
  const date = withWeekday ? dateFmt.format(d) : dayFmt.format(d);
  return `${date}, ${timeOf(iso)}`;
}

export function fullDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function initials(name = '') {
  return name
    .replace(/^dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function firstName(name = '') {
  return name.replace(/^dr\.?\s+/i, '').split(/\s+/)[0] || name;
}

export function greeting(name) {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return `Good ${part}, ${firstName(name)}`;
}

export function isThisWeek(iso) {
  const d = new Date(iso);
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return d >= start && d < end;
}

export function percent(value) {
  return `${Math.round(value * 100)}%`;
}

export function plural(n, one, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
