const Svg = ({ size = 18, children, strokeWidth = 1.7, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const Sparkles = (p) => (
  <Svg {...p}>
    <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.7l-1.6-5.5L5 10.6 10.4 9 12 3.5Z" />
    <path d="M18.5 16.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />
  </Svg>
);

export const Overview = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </Svg>
);

export const InboxIcon = (p) => (
  <Svg {...p}>
    <path d="M3.5 12.5h4l1.4 2.3h6.2l1.4-2.3h4" />
    <path d="M5.8 4.8h12.4l2.3 7.7v4.2a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-4.2l2.3-7.7Z" />
  </Svg>
);

export const Board = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="5" height="16" rx="1.6" />
    <rect x="9.5" y="4" width="5" height="11" rx="1.6" />
    <rect x="16" y="4" width="5" height="7.5" rx="1.6" />
  </Svg>
);

export const Flask = (p) => (
  <Svg {...p}>
    <path d="M9.5 3.5h5" />
    <path d="M10 3.5v5.2L5.6 17a2 2 0 0 0 1.7 3h9.4a2 2 0 0 0 1.7-3L14 8.7V3.5" />
    <path d="M7.4 14.5h9.2" />
  </Svg>
);

export const Gauge = (p) => (
  <Svg {...p}>
    <path d="m12 14 4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </Svg>
);

export const Review = (p) => (
  <Svg {...p}>
    <path d="M4.5 5.8A2 2 0 0 1 6.4 4h11.2a2 2 0 0 1 1.9 1.8l.9 12a1.4 1.4 0 0 1-1.4 1.5H5a1.4 1.4 0 0 1-1.4-1.5l.9-12Z" />
    <path d="M9.2 9.2a2.8 2.8 0 1 1 3.9 2.6c-.7.3-1.1.9-1.1 1.7" />
    <path d="M12 16.8h.01" strokeWidth="2.4" />
  </Svg>
);

export const Accounts = (p) => (
  <Svg {...p}>
    <path d="M9.5 14.5 6 18a3.5 3.5 0 0 1-5-5l3.5-3.5a3.5 3.5 0 0 1 5 0" transform="translate(1.5 -1)" />
    <path d="M14.5 9.5 18 6a3.5 3.5 0 0 1 5 5l-3.5 3.5a3.5 3.5 0 0 1-5 0" transform="translate(-1.5 1)" />
    <path d="M8.5 15.5 15.5 8.5" />
  </Svg>
);

export const Search = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Svg>
);

export const Star = ({ filled = false, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.8Z" />
  </Svg>
);

export const Archive = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="4.5" rx="1.4" />
    <path d="M4.8 8.5V18a2 2 0 0 0 2 2h10.4a2 2 0 0 0 2-2V8.5" />
    <path d="M10 12.5h4" />
  </Svg>
);

export const Mail = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.4" />
    <path d="m4 7 8 6 8-6" />
  </Svg>
);

export const MailOpen = (p) => (
  <Svg {...p}>
    <path d="M3.2 10.4 12 4l8.8 6.4V19a1.6 1.6 0 0 1-1.6 1.6H4.8A1.6 1.6 0 0 1 3.2 19v-8.6Z" />
    <path d="m4 10.5 8 5.8 8-5.8" />
  </Svg>
);

export const ArrowLeft = (p) => (
  <Svg {...p}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </Svg>
);

export const ArrowRight = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Svg>
);

export const ArrowUpRight = (p) => (
  <Svg {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Svg>
);

export const Send = (p) => (
  <Svg {...p}>
    <path d="M20.5 3.5 3.6 10.2c-.8.3-.8 1.4 0 1.7l6.2 2.3 2.3 6.2c.3.8 1.4.8 1.7 0l6.7-16.9Z" />
    <path d="M9.8 14.2 20.5 3.5" />
  </Svg>
);

export const Check = (p) => (
  <Svg {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Svg>
);

export const CheckCheck = (p) => (
  <Svg {...p}>
    <path d="m2.5 12.5 4.5 4.5 8-9" />
    <path d="m11 15.5 1.5 1.5 8-9" />
  </Svg>
);

export const Clock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const Calendar = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.2" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </Svg>
);

export const ChevronDown = (p) => (
  <Svg {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </Svg>
);

export const ChevronRight = (p) => (
  <Svg {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </Svg>
);

export const ChevronLeft = (p) => (
  <Svg {...p}>
    <path d="m14.5 6-6 6 6 6" />
  </Svg>
);

export const X = (p) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const More = (p) => (
  <Svg {...p}>
    <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </Svg>
);

export const Plus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const Refresh = (p) => (
  <Svg {...p}>
    <path d="M20 11.5a8 8 0 1 0-2.3 6.1" />
    <path d="M20 4.5v6h-6" />
  </Svg>
);

export const Users = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M3.5 20c0-3.2 2.5-5.2 5.5-5.2s5.5 2 5.5 5.2" />
    <path d="M16 5.2a3.4 3.4 0 0 1 0 6.4" />
    <path d="M17.6 14.9c2 .5 3.4 2.2 3.4 4.4" />
  </Svg>
);

export const Filter = (p) => (
  <Svg {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Svg>
);

export const Menu = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const Command = (p) => (
  <Svg {...p}>
    <path d="M9 6.5A1.5 1.5 0 1 0 7.5 8H9V6.5ZM9 17.5A1.5 1.5 0 1 1 7.5 16H9v1.5ZM15 6.5A1.5 1.5 0 1 1 16.5 8H15V6.5ZM15 17.5a1.5 1.5 0 1 0 1.5-1.5H15v1.5Z" />
    <rect x="9" y="8" width="6" height="8" rx="1.4" />
  </Svg>
);

export const Zap = (p) => (
  <Svg {...p}>
    <path d="M13 2.5 4.5 13.2h6.2l-.7 8.3 8.5-10.7h-6.2l.7-8.3Z" />
  </Svg>
);

export const Help = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.5 9.3a2.6 2.6 0 1 1 3.6 2.4c-.8.3-1.1.9-1.1 1.8" />
    <path d="M12 17h.01" strokeWidth="2.4" />
  </Svg>
);

export const Shield = (p) => (
  <Svg {...p}>
    <path d="M12 3.2 19.5 6v5.6c0 4.4-3 7.7-7.5 9.2-4.5-1.5-7.5-4.8-7.5-9.2V6L12 3.2Z" />
    <path d="m9 12 2 2 4-4.2" />
  </Svg>
);

export const AlertTriangle = (p) => (
  <Svg {...p}>
    <path d="M12 4.2 21 19.5H3L12 4.2Z" strokeLinejoin="round" />
    <path d="M12 10v4.2" />
    <path d="M12 17.2h.01" strokeWidth="2.2" />
  </Svg>
);

export const Link = (p) => (
  <Svg {...p}>
    <path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.4 1.4" />
    <path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.4-1.4" />
  </Svg>
);

export const LogOut = (p) => (
  <Svg {...p}>
    <path d="M14 20H6.5A2.5 2.5 0 0 1 4 17.5v-11A2.5 2.5 0 0 1 6.5 4H14" />
    <path d="M17 8.5 20.5 12 17 15.5M10 12h10.5" />
  </Svg>
);

export const Eye = (p) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Svg>
);

export const Trash = (p) => (
  <Svg {...p}>
    <path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.9 12.2a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7" />
  </Svg>
);

export const Lock = (p) => (
  <Svg {...p}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="2.2" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
  </Svg>
);

export const Route = (p) => (
  <Svg {...p}>
    <circle cx="5.5" cy="6" r="2.2" />
    <circle cx="18.5" cy="18" r="2.2" />
    <path d="M5.5 8.2v3.3a3.5 3.5 0 0 0 3.5 3.5h6.2a3.5 3.5 0 0 1 3.5 3.5" />
  </Svg>
);

export const Layers = (p) => (
  <Svg {...p}>
    <path d="m12 3.5 8.5 4.8L12 13 3.5 8.3 12 3.5Z" />
    <path d="m4 12.5 8 4.6 8-4.6" />
    <path d="m4 16.7 8 4.5 8-4.5" />
  </Svg>
);

export const Google = ({ size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" {...rest}>
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.97-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48Z"
    />
  </svg>
);

export const Microsoft = ({ size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 23 23" aria-hidden="true" {...rest}>
    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
    <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
    <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
    <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
  </svg>
);

export const ProviderMark = ({ provider, size = 18 }) =>
  provider === 'microsoft' ? <Microsoft size={size} /> : <Google size={size} />;
