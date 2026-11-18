import { Link } from 'react-router-dom';
import { Logo, LogoMark } from '../components/Logo';
import { Avatar } from '../components/Avatar';
import { ClassificationChip } from '../components/Chips';
import { ArrowRight, ArrowUpRight, Check, Google, Microsoft, Sparkles } from '../components/Icons';

const MOCK_ROWS = [
  {
    name: 'Priya Nair',
    subject: 'Northwind: Series A term sheet',
    client: 'Aarav Shah',
    accent: 'clay',
    initials: 'PN',
    cls: 'client',
    time: '42m',
  },
  {
    name: 'Camille Moreau',
    subject: 'Paris showroom: fitting on Friday',
    client: 'Zoya Rahman',
    accent: 'plum',
    initials: 'CM',
    cls: 'assistant',
    time: '1h',
  },
  {
    name: 'Vogue India',
    subject: 'Your November press release',
    client: 'Zoya Rahman',
    accent: 'plum',
    initials: 'VI',
    cls: 'none',
    time: '7h',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Connect the inboxes',
    body: 'Link Gmail or Microsoft 365 with read-and-send access. Relay indexes the last few years so context travels with every conversation.',
  },
  {
    n: '02',
    title: 'Relay decides ownership',
    body: 'Relay reads each thread in full, then routes it to you, your client, or no reply. When the call is unclear, it goes to review instead of being guessed.',
  },
  {
    n: '03',
    title: 'You approve, then it sends',
    body: 'Draft a reply, edit it, and approve. Your client only sees the few threads that genuinely need them, each with a plain reason why.',
  },
];

export function Landing() {
  return (
    <div className="landing landing--cinema">
      <header className="landing-nav landing-nav--glass">
        <Link to="/" className="landing-nav__brand">
          <Logo size={28} />
        </Link>
        <nav className="landing-nav__links">
          <a href="#how">How it works</a>
          <a href="#split">Assistant &amp; client</a>
          <Link to="/app">Live demo</Link>
        </nav>
        <div className="landing-nav__actions">
          <Link to="/connect" className="btn btn--glass btn--sm">
            Sign in
          </Link>
          <Link to="/connect" className="btn btn--paper btn--sm">
            Get started
          </Link>
        </div>
      </header>

      <main>
        <section className="hero hero--cinema">
          <div className="hero-stage">
            <img className="hero-stage__img" src="/hero-dusk.jpg" alt="" />
            <div className="hero-stage__scrim" />

            <div className="hero__copy">
              <span className="pill pill--glass">
                <span className="pill__dot" /> Built for personal assistants
              </span>
              <h1 className="hero__title">
                Every reply lands with the <em>right person</em>
                <span className="hero__dot" />
              </h1>
              <p className="hero__sub">
                Relay reads the inboxes you manage, then routes each reply to you or your client. No more late-night
                screenshots.
              </p>
              <div className="hero__cta">
                <Link to="/connect" className="btn btn--paper btn--lg">
                  Connect a mailbox
                  <span className="hero-cta__disc">
                    <ArrowRight size={15} />
                  </span>
                </Link>
                <Link to="/app" className="btn btn--glass btn--lg">
                  Explore the demo
                </Link>
              </div>
              <p className="hero__note">
                <Check size={13} />
                <span>Sample mail included · Nothing sends without your approval</span>
              </p>
            </div>

            <div className="hero-proof" aria-hidden="true">
              <span className="hero-proof__value">24</span>
              <span className="hero-proof__label">
                conversations routed across three clients, before lunch
              </span>
              <span className="hero-proof__people">
                <Avatar name="Ananya Rao" accent="ink" size={34} />
                <Avatar name="Aarav Shah" accent="clay" size={34} />
                <Avatar name="Zoya Rahman" accent="plum" size={34} />
              </span>
            </div>

            <div className="hero-cards" aria-hidden="true">
              <div className="hero-mock hero-mock--cinema">
                <header className="hero-mock__bar">
                  <span className="hero-mock__dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="hero-mock__title">Inbox · 3 mailboxes</span>
                  <span className="hero-mock__live">
                    <span /> Synced
                  </span>
                </header>
                <div className="hero-mock__tabs">
                  <span className="is-on">Assistant <b>9</b></span>
                  <span>Client <b>8</b></span>
                  <span>Review <b>2</b></span>
                  <span>No reply <b>4</b></span>
                </div>
                <div className="hero-mock__list">
                  {MOCK_ROWS.map((r, i) => (
                    <div key={r.subject} className={`hero-row ${i === 0 ? 'is-active' : ''}`}>
                      <span className={`hero-row__avatar avatar--${r.accent}`}>{r.initials}</span>
                      <span className="hero-row__body">
                        <span className="hero-row__top">
                          <span>{r.name}</span>
                          <span className="hero-row__time">{r.time}</span>
                        </span>
                        <span className="hero-row__subject">{r.subject}</span>
                        <span className="hero-row__meta">
                          <span className="hero-row__client">{r.client}</span>
                          <ClassificationChip classification={r.cls} size="xs" />
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hero-float hero-float--cinema">
                <div className="hero-float__head">
                  <span className="hero-float__icon">
                    <Sparkles size={14} />
                  </span>
                  <span>Relay routing</span>
                  <span className="hero-float__conf">96%</span>
                </div>
                <p className="hero-float__title">Needs Aarav personally</p>
                <p className="hero-float__body">Legal commitment, addressed to him, decision requested by Thursday.</p>
                <div className="hero-float__signals">
                  <span>Term sheet</span>
                  <span>Addressed to Aarav</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="logo-strip">
          <span className="logo-strip__label">Connects to</span>
          <span className="logo-strip__item">
            <Google size={17} /> Gmail
          </span>
          <span className="logo-strip__sep" />
          <span className="logo-strip__item">
            <Microsoft size={16} /> Microsoft 365
          </span>
          <span className="logo-strip__sep" />
          <span className="logo-strip__item">
            <Check size={16} /> Calendar events
          </span>
        </section>

        <section className="how" id="how">
          <div className="section-head">
            <span className="eyebrow">How Relay works</span>
            <h2 className="section-title serif">Three decisions, handled quietly.</h2>
            <p className="section-sub">
              The work happens between messages, not in another dashboard you have to keep tidy.
            </p>
          </div>
          <div className="how-grid">
            {STEPS.map((s) => (
              <article key={s.n} className="how-card">
                <span className="how-card__num mono-num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="split" id="split">
          <div className="split__copy">
            <span className="eyebrow">Two experiences, one thread</span>
            <h2 className="section-title serif">You get the cockpit. They get two minutes.</h2>
            <p className="section-sub">
              Assistants get the full workspace: segments, a responsibility board, briefs and drafts. Clients never
              see any of it. They see the few conversations that genuinely need their judgment, with the reason
              spelled out.
            </p>
            <ul className="split__list">
              <li>
                <Check size={15} />
                <span>
                  <strong>Assistant view:</strong> every mailbox, every classification, full conversation history.
                </span>
              </li>
              <li>
                <Check size={15} />
                <span>
                  <strong>Client view:</strong> only “Client to reply”, a short summary and two clear actions.
                </span>
              </li>
              <li>
                <Check size={15} />
                <span>
                  <strong>Shared state:</strong> when a client marks something handled, the assistant sees it instantly.
                </span>
              </li>
            </ul>
            <div className="split__actions">
              <Link to="/app" className="btn btn--ink">
                Open assistant view <ArrowUpRight size={15} />
              </Link>
              <Link to="/client" className="btn btn--outline">
                See the client view <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="split__visual" aria-hidden="true">
            <div className="client-mock">
              <div className="client-mock__top">
                <LogoMark size={24} />
                <span>Client view</span>
                <span className="client-mock__avatar">AS</span>
              </div>
              <p className="client-mock__kicker">Tuesday, 17 November</p>
              <h3 className="client-mock__title serif">Three replies need you, Aarav.</h3>
              <p className="client-mock__sub">Ananya has already handled the rest of your inbox.</p>
              <div className="client-mock__card">
                <div className="client-mock__sender">
                  <span className="client-mock__avatar avatar--clay">PN</span>
                  <span>
                    <strong>Priya Nair</strong>
                    <small>Meridian Ventures · 42m ago</small>
                  </span>
                </div>
                <div className="client-mock__subject">Series A term sheet</div>
                <p className="client-mock__summary">
                  Meridian sent a $6M term sheet with 48-hour exclusivity. They need your read before Thursday.
                </p>
                <div className="client-mock__why">
                  <Sparkles size={12} /> You’re the only one who can approve the terms.
                </div>
                <div className="client-mock__actions">
                  <span className="client-mock__btn">Open conversation</span>
                  <span className="client-mock__link">Ananya can handle this</span>
                </div>
              </div>
            </div>
            <div className="split__badge">
              <Sparkles size={14} />
              <div>
                <strong>Client marked handled</strong>
                <span>Reflected in Ananya&apos;s dashboard</span>
              </div>
            </div>
          </div>
        </section>

        <section className="closing">
          <div className="closing__inner">
            <span className="eyebrow">Less triage. More doing.</span>
            <h2 className="closing__title serif">
              The inbox is your job.
              <br />
              Deciding who replies shouldn&apos;t be.
            </h2>
            <div className="closing__cta">
              <Link to="/connect" className="btn btn--primary btn--lg">
                Set up a demo workspace <ArrowRight size={16} />
              </Link>
              <Link to="/app" className="btn btn--ghost">
                Skip to the dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-foot">
        <div className="landing-foot__brand">
          <Logo size={24} />
          <span>Reply routing for personal assistants.</span>
        </div>
        <div className="landing-foot__meta">
          <span>Gmail and Outlook · Approval on every reply</span>
          <Avatar name="Ananya Rao" accent="ink" size={24} />
        </div>
      </footer>
    </div>
  );
}
