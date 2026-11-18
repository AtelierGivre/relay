import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { getStats, segmentCount, SEGMENT_DEFS } from '../lib/selectors';
import { relative } from '../lib/format';
import { ASK_EVENT } from '../lib/bus';
import { Avatar } from '../components/Avatar';
import { Logo, LogoMark } from '../components/Logo';
import { AskRelay } from '../components/AskRelay';
import { SimulateMenu } from '../components/SimulateMenu';
import { Popover, MenuItem, MenuDivider } from '../components/Popover';
import { StatusDot, CountPill } from '../components/Chips';
import {
  Accounts as AccountsIcon,
  Board,
  ChevronDown,
  Eye,
  Flask,
  Gauge,
  InboxIcon,
  LogOut,
  Overview,
  Refresh,
  Review,
  Search,
  Sparkles,
} from '../components/Icons';

const PRIMARY = [
  { to: '/app', label: 'Overview', icon: Overview, end: true },
  { to: '/app/inbox', label: 'Inbox', icon: InboxIcon, badge: 'unread' },
  { to: '/app/review', label: 'Needs review', icon: Review, badge: 'review' },
  { to: '/app/board', label: 'Responsibility', icon: Board },
  { to: '/app/lab', label: 'Routing lab', icon: Flask },
  { to: '/app/eval', label: 'Evaluation', icon: Gauge },
];

const SEGMENT_LINKS = ['assistant', 'client', 'waiting', 'none', 'meetings', 'important'];

export function AppShell() {
  const { user, threads, accounts, resetDemo, syncAccount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const match = useMatch('/app/inbox/:threadId');
  const activeThread = match ? threads.find((t) => t.id === match.params.threadId) : null;
  const [askOpen, setAskOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const stats = getStats(threads);
  const currentSegment = new URLSearchParams(location.search).get('segment') || 'all';
  const connected = accounts.filter((a) => a.status === 'connected');
  const lastSync = connected
    .map((a) => a.lastSyncAt)
    .filter(Boolean)
    .sort()
    .pop();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAskOpen((v) => !v);
      }
    };
    const onAsk = () => setAskOpen(true);
    document.addEventListener('keydown', onKey);
    window.addEventListener(ASK_EVENT, onAsk);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener(ASK_EVENT, onAsk);
    };
  }, []);

  const reload = async () => {
    setRefreshing(true);
    await Promise.all(connected.map((a) => syncAccount(a.id)));
    setRefreshing(false);
  };

  const signOut = () => {
    localStorage.removeItem('relay.onboarded');
    navigate('/');
  };

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="rail">
        <div className="rail__brand">
          <Link to="/app" aria-label="Relay home">
            <Logo size={29} />
          </Link>
        </div>

        <nav className="rail__nav" aria-label="Main">
          {PRIMARY.map((item) => {
            const Icon = item.icon;
            const count = item.badge === 'unread' ? stats.unread : item.badge === 'review' ? stats.review : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `rail__link ${isActive ? 'is-active' : ''}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {count > 0 && <span className="rail__badge mono-num">{count}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="rail__group">
          <div className="rail__label">Segments</div>
          <div className="rail__segments">
            {SEGMENT_LINKS.map((id) => {
              const def = SEGMENT_DEFS.find((s) => s.id === id);
              const count = segmentCount(threads, id);
              const active = location.pathname.startsWith('/app/inbox') && currentSegment === id;
              return (
                <Link
                  key={id}
                  to={`/app/inbox?segment=${id}`}
                  className={`rail__seg ${active ? 'is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className={`seg-dot seg-dot--${id}`} />
                  <span className="truncate">{def.label}</span>
                  <span className="rail__count mono-num">{count}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rail__spacer" />

        <div className="rail__bottom">
          <Link to="/app/accounts" className="rail__link rail__link--quiet">
            <AccountsIcon size={17} />
            <span>Mailboxes</span>
            <span className="rail__count mono-num">{connected.length}</span>
          </Link>
          <Link to="/client" className="rail__client">
            <span className="rail__client-icon">
              <Eye size={15} />
            </span>
            <span>
              <strong>Client experience</strong>
              <small>See what Aarav sees</small>
            </span>
          </Link>
          <Popover
            align="left"
            width={248}
            trigger={({ toggle, open }) => (
              <button
                type="button"
                className="rail__user"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
              >
                <Avatar name={user?.name || 'Ananya Rao'} accent="ink" size={30} />
                <span className="rail__user-text">
                  <strong>{user?.name || 'Ananya Rao'}</strong>
                  <small>Personal assistant</small>
                </span>
                <ChevronDown size={14} />
              </button>
            )}
          >
            <MenuItem icon={<AccountsIcon size={15} />} onClick={() => navigate('/app/accounts')}>
              Connected mailboxes
            </MenuItem>
            <MenuItem icon={<Refresh size={15} />} onClick={resetDemo}>
              Restore demo data
            </MenuItem>
            <MenuDivider />
            <MenuItem icon={<LogOut size={15} />} danger onClick={signOut}>
              Sign out
            </MenuItem>
          </Popover>
        </div>
      </aside>

      <main className="main" id="main" tabIndex={-1}>
        <header className="topbar">
          <div className="topbar__brand">
            <Link to="/app" aria-label="Relay home">
              <LogoMark size={27} />
            </Link>
          </div>
          <button className="searchbox" onClick={() => setAskOpen(true)}>
            <Search size={15} />
            <span className="searchbox__placeholder">Search or ask Relay…</span>
            <kbd className="kbd">⌘K</kbd>
          </button>
          <div className="topbar__right">
            <Link to="/app/accounts" className="sync-chip" title="Connection and sync status">
              <StatusDot tone={connected.length ? 'green' : 'clay'} pulse={refreshing} />
              <span className="sync-chip__text">
                {refreshing ? 'Syncing…' : lastSync ? `Synced ${relative(lastSync)}` : 'Not synced'}
              </span>
            </Link>
            <button className="icon-btn topbar__refresh" onClick={reload} aria-label="Sync mailboxes">
              <Refresh size={16} className={refreshing ? 'spin' : ''} />
            </button>
            <SimulateMenu />
            <Popover
              width={232}
              trigger={({ toggle, open }) => (
                <button
                  type="button"
                  className="topbar__avatar"
                  onClick={toggle}
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={open}
                >
                  <Avatar name={user?.name || 'Ananya Rao'} accent="ink" size={30} />
                </button>
              )}
            >
              <div className="topbar__menu-head">
                <div className="topbar__menu-name">{user?.name}</div>
                <div className="topbar__menu-mail">{user?.email}</div>
              </div>
              <MenuDivider />
              <MenuItem icon={<Eye size={15} />} onClick={() => navigate('/client')}>
                Client experience
              </MenuItem>
              <MenuItem icon={<AccountsIcon size={15} />} onClick={() => navigate('/app/accounts')}>
                Connected mailboxes
              </MenuItem>
              <MenuItem icon={<Refresh size={15} />} onClick={resetDemo}>
                Restore demo data
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<LogOut size={15} />} danger onClick={signOut}>
                Sign out
              </MenuItem>
            </Popover>
          </div>
        </header>

        <Outlet />
      </main>

      <nav className="mobile-tabs" aria-label="Main">
        {[
          { to: '/app', label: 'Home', icon: Overview, end: true },
          { to: '/app/inbox', label: 'Inbox', icon: InboxIcon },
          { to: '/app/review', label: 'Review', icon: Review, badge: stats.review },
          { to: '/app/board', label: 'Route', icon: Board },
          { to: '/app/lab', label: 'Lab', icon: Flask },
          { to: '/app/eval', label: 'Eval', icon: Gauge },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `mobile-tab ${isActive ? 'is-active' : ''}`}
            >
              <span className="mobile-tab__icon">
                <Icon size={19} />
                {item.badge > 0 && <span className="mobile-tab__badge">{item.badge}</span>}
              </span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <AskRelay open={askOpen} onClose={() => setAskOpen(false)} thread={activeThread} />
    </div>
  );
}
