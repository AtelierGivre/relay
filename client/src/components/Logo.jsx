export function LogoMark({ size = 30, tone = 'green' }) {
  return (
    <span
      className={`logo-mark logo-mark--${tone}`}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width={size * 0.64} height={size * 0.64} fill="none">
        <path
          d="M5.2 18.2c0-6.1 3.7-9.6 10-9.6h3.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="m14.6 4.4 4.4 4.2-4.4 4.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="5.2" cy="18.2" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Logo({ size = 30, tone = 'green', wordmark = true, className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <LogoMark size={size} tone={tone} />
      {wordmark && (
        <span className="logo__word" style={{ fontSize: size * 0.6 }}>
          Relay
        </span>
      )}
    </span>
  );
}
