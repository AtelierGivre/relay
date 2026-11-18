import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { getStats } from '../lib/selectors';
import { Logo, LogoMark } from '../components/Logo';
import { Avatar } from '../components/Avatar';
import { StatusDot } from '../components/Chips';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Google,
  Lock,
  Microsoft,
  Shield,
  Sparkles,
} from '../components/Icons';

const STEPS = [
  { id: 0, label: 'Your account' },
  { id: 1, label: 'Mailbox provider' },
  { id: 2, label: 'Access' },
  { id: 3, label: 'First sync' },
];

const SYNC_LOG = [
  { at: 400, text: 'Exchanging authorization code with provider…' },
  { at: 1100, text: 'Reading recent conversations from 3 mailboxes…' },
  { at: 1900, text: 'Indexing 2,869 messages and 14 labels…' },
  { at: 2700, text: 'Classifying reply responsibility for 24 conversations…' },
  { at: 3500, text: 'Extracting meetings, deadlines and pending replies…' },
];

const PROVIDERS = [
  {
    id: 'google',
    name: 'Google Gmail',
    sub: 'Personal and Google Workspace mailboxes',
    icon: Google,
  },
  {
    id: 'microsoft',
    name: 'Microsoft Outlook',
    sub: 'Outlook.com and Microsoft 365 accounts',
    icon: Microsoft,
  },
];

const SCOPES = [
  { label: 'Read messages and conversation history', detail: 'gmail.readonly · mail.read' },
  { label: 'Send replies after your approval', detail: 'gmail.send · mail.send' },
  { label: 'Read calendar events linked to email', detail: 'calendar.events · calendars.readwrite' },
];

export function Connect() {
  const { user, clients, threads, status } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('signup');
  const [name, setName] = useState('Ananya Rao');
  const [email, setEmail] = useState('ananya@relay.studio');
  const [workspace, setWorkspace] = useState('Relay Studio');
  const [provider, setProvider] = useState('google');
  const [consent, setConsent] = useState(true);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const timers = useRef([]);

  const stats = status === 'ready' ? getStats(threads) : { total: 24, needsClient: 8, needsYou: 9, review: 2, noReply: 5 };
  const onboarded = typeof localStorage !== 'undefined' && localStorage.getItem('relay.onboarded') === '1';
  const providerName = provider === 'microsoft' ? 'Microsoft' : 'Google';

  useEffect(() => {
    if (step !== 3) return undefined;
    setProgress(4);
    setLogs([]);
    SYNC_LOG.forEach((entry) => {
      timers.current.push(
        window.setTimeout(() => {
          setLogs((list) => [...list, entry.text]);
          setProgress(Math.round(((SYNC_LOG.indexOf(entry) + 1) / SYNC_LOG.length) * 100));
        }, entry.at),
      );
    });
    timers.current.push(
      window.setTimeout(() => {
        setProgress(100);
        setStep(4);
      }, 4600),
    );
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [step]);

  const finish = () => {
    localStorage.setItem('relay.onboarded', '1');
    navigate('/app');
  };

  const canContinue = mode === 'signin' ? email.includes('@') : name.trim() && email.includes('@');

  return (
    <div className="connect">
      <aside className="connect__side">
        <Link to="/" className="connect__brand" aria-label="Relay home">
          <Logo size={30} />
        </Link>

        <div className="connect__side-body">
          <span className="pill pill--dark">
            <span className="pill__dot" /> Set up in about a minute
          </span>
          <h1 className="connect__title serif">
            Two inboxes.
            <br />
            One clear owner.
          </h1>
          <p className="connect__sub">
            Relay connects the mailboxes you manage, reads every conversation in full, and decides who owes the
            reply: you or your client.
          </p>

          <ol className="connect-steps">
            {STEPS.map((s) => {
              const state = step > s.id || step === 4 ? 'is-done' : step === s.id ? 'is-active' : '';
              return (
                <li key={s.id} className={`connect-step ${state}`}>
                  <span className="connect-step__mark">
                    {step > s.id || step === 4 ? <Check size={12} /> : String(s.id + 1).padStart(2, '0')}
                  </span>
                  <span>{s.label}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="connect__side-foot">
          <Shield size={15} />
          <span>Read-and-send access only. Nothing sends without your approval.</span>
        </div>
      </aside>

      <main className="connect__main">
        <div className="connect__main-top">
          {onboarded ? (
            <Link to="/app" className="connect__back">
              <ArrowLeft size={14} /> Back to workspace
            </Link>
          ) : (
            <Link to="/" className="connect__back">
              <ArrowLeft size={14} /> Back to overview
            </Link>
          )}
          <span className="connect__secure">
            <Lock size={12} /> Demo mode · no real mailbox is accessed
          </span>
        </div>

        <div className="connect-card">
          {step === 0 && (
            <div className="connect-panel">
              <div className="connect-panel__head">
                <span className="eyebrow">{mode === 'signup' ? 'Create your workspace' : 'Welcome back'}</span>
                <h2 className="connect-panel__title serif">
                  {mode === 'signup' ? 'Let\u2019s set up Relay' : 'Sign in to Relay'}
                </h2>
                <p className="connect-panel__sub">
                  {mode === 'signup'
                    ? 'This becomes the home for every client mailbox you look after.'
                    : 'Use the demo account below. The details are already filled in.'}
                </p>
              </div>

              <div className="connect-toggle" role="tablist" aria-label="Sign up or sign in">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  className={mode === 'signup' ? 'is-on' : ''}
                  onClick={() => setMode('signup')}
                >
                  Sign up
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signin'}
                  className={mode === 'signin' ? 'is-on' : ''}
                  onClick={() => setMode('signin')}
                >
                  Sign in
                </button>
              </div>

              <div className="connect-fields">
                {mode === 'signup' && (
                  <div className="field">
                    <label htmlFor="onboard-name">Your name</label>
                    <input
                      id="onboard-name"
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ananya Rao"
                      autoComplete="name"
                    />
                  </div>
                )}
                <div className="field">
                  <label htmlFor="onboard-email">Work email</label>
                  <input
                    id="onboard-email"
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@studio.com"
                    autoComplete="email"
                  />
                </div>
                {mode === 'signup' && (
                  <div className="field">
                    <label htmlFor="onboard-workspace">Workspace name</label>
                    <input
                      id="onboard-workspace"
                      className="input"
                      value={workspace}
                      onChange={(e) => setWorkspace(e.target.value)}
                      placeholder="Relay Studio"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                className="btn btn--primary btn--lg btn--block"
                disabled={!canContinue}
                onClick={() => setStep(1)}
              >
                {mode === 'signup' ? 'Continue' : 'Sign in'} <ArrowRight size={15} />
              </button>

              <p className="connect-fineprint">
                {mode === 'signup' ? (
                  <>
                    Already have a workspace?{' '}
                    <button type="button" className="link-btn" onClick={() => setMode('signin')}>
                      Sign in instead
                    </button>
                  </>
                ) : (
                  <>
                    New to Relay?{' '}
                    <button type="button" className="link-btn" onClick={() => setMode('signup')}>
                      Create a workspace
                    </button>
                  </>
                )}
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="connect-panel">
              <div className="connect-panel__head">
                <span className="eyebrow">Step 2 of 4</span>
                <h2 className="connect-panel__title serif">Connect a mailbox</h2>
                <p className="connect-panel__sub">
                  Choose where your clients&apos; mail lives. You can add more mailboxes later from settings.
                </p>
              </div>

              <div className="provider-grid">
                {PROVIDERS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`provider-card ${provider === p.id ? 'is-on' : ''}`}
                      onClick={() => setProvider(p.id)}
                    >
                      <span className="provider-card__icon">
                        <Icon size={26} />
                      </span>
                      <span className="provider-card__name">{p.name}</span>
                      <span className="provider-card__sub">{p.sub}</span>
                      <span className="provider-card__radio">{provider === p.id && <Check size={12} />}</span>
                    </button>
                  );
                })}
              </div>

              <div className="connect-sample">
                <div className="connect-sample__head">
                  <Sparkles size={14} />
                  <span>Demo workspace included</span>
                </div>
                <p>
                  We&apos;ll connect three sample client mailboxes: Aarav at Northwind Labs, Zoya at Atelier Rasa,
                  and Dr. Karan at Meridian Heart Clinic.
                </p>
                <div className="connect-sample__clients">
                  {clients.map((c) => (
                    <span key={c.id} className="connect-sample__client">
                      <Avatar name={c.name} accent={c.accent} size={20} />
                      {c.firstName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="connect-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setStep(0)}>
                  Back
                </button>
                <button type="button" className="btn btn--primary" onClick={() => setStep(2)}>
                  Continue with {providerName} <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="connect-panel">
              <div className="consent">
                <div className="consent__bar">
                  <span className={`consent__provider consent__provider--${provider}`}>
                    {provider === 'microsoft' ? <Microsoft size={20} /> : <Google size={20} />}
                  </span>
                  <span className="consent__host">{provider === 'microsoft' ? 'login.microsoftonline.com' : 'accounts.google.com'}</span>
                  <span className="consent__lock">
                    <Lock size={12} /> Secure
                  </span>
                </div>

                <div className="consent__body">
                  <LogoMark size={34} />
                  <h2 className="consent__title">Relay wants to access your {providerName} account</h2>
                  <div className="consent__account">
                    <Avatar name={user?.name || name} accent="ink" size={30} />
                    <div>
                      <strong>{email || 'ananya@relay.studio'}</strong>
                      <span>{workspace || 'Relay Studio'} workspace</span>
                    </div>
                  </div>

                  <ul className="consent__scopes">
                    {SCOPES.map((s) => (
                      <li key={s.label}>
                        <span className="consent__check">
                          <Check size={12} />
                        </span>
                        <span>
                          <strong>{s.label}</strong>
                          <small>{s.detail}</small>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <label className="consent__allow">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                    <span>
                      Allow Relay to read and prepare replies on my behalf. I approve every message before it is sent.
                    </span>
                  </label>

                  <div className="consent__actions">
                    <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary"
                      disabled={!consent}
                      onClick={() => setStep(3)}
                    >
                      Allow access
                    </button>
                  </div>
                  <p className="consent__note">
                    Demo consent screen. Relay never receives real credentials.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="connect-panel connect-panel--sync">
              <div className="sync-anim">
                <span className="sync-anim__ring" />
                <span className="sync-anim__ring sync-anim__ring--2" />
                <span className="sync-anim__mark">
                  <LogoMark size={40} />
                </span>
              </div>
              <h2 className="connect-panel__title serif">Reading the inboxes</h2>
              <p className="connect-panel__sub">Relay is indexing history and routing each conversation. This takes a few seconds.</p>

              <div className="sync-progress">
                <div className="sync-progress__bar">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <span className="sync-progress__pct mono-num">{progress}%</span>
              </div>

              <ul className="sync-log">
                {logs.map((entry) => (
                  <li key={entry}>
                    <Check size={12} /> {entry}
                  </li>
                ))}
                <li className="sync-log__pending">
                  <span className="sync-log__spinner" /> Working…
                </li>
              </ul>
            </div>
          )}

          {step === 4 && (
            <div className="connect-panel connect-panel--done">
              <div className="done-mark">
                <Check size={22} />
              </div>
              <span className="eyebrow">You&apos;re set up</span>
              <h2 className="connect-panel__title serif">
                {stats.total} conversations, already routed.
              </h2>
              <p className="connect-panel__sub">
                Three mailboxes are connected and Relay has made a first call on every open thread. Here&apos;s how the
                inbox landed.
              </p>

              <div className="done-stats">
                <div className="done-stat done-stat--assistant">
                  <span className="done-stat__value mono-num">{stats.needsYou}</span>
                  <span className="done-stat__label">Assistant to reply</span>
                </div>
                <div className="done-stat done-stat--client">
                  <span className="done-stat__value mono-num">{stats.needsClient}</span>
                  <span className="done-stat__label">Client to reply</span>
                </div>
                <div className="done-stat done-stat--review">
                  <span className="done-stat__value mono-num">{stats.review}</span>
                  <span className="done-stat__label">Needs review</span>
                </div>
                <div className="done-stat done-stat--none">
                  <span className="done-stat__value mono-num">{stats.noReply}</span>
                  <span className="done-stat__label">No reply needed</span>
                </div>
              </div>

              <div className="done-accounts">
                {clients.map((c) => (
                  <span key={c.id} className="done-account">
                    <StatusDot tone="green" />
                    <Avatar name={c.name} accent={c.accent} size={20} />
                    <span className="truncate">{c.name}</span>
                    <strong>Synced</strong>
                  </span>
                ))}
                <span className="done-account done-account--self">
                  <StatusDot tone="green" />
                  <Avatar name={name} accent="ink" size={20} />
                  <span className="truncate">Your assistant inbox</span>
                  <strong>Synced</strong>
                </span>
              </div>

              <div className="connect-actions connect-actions--done">
                <button type="button" className="btn btn--primary btn--lg" onClick={finish}>
                  Open my workspace <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--lg"
                  onClick={() => {
                    localStorage.setItem('relay.onboarded', '1');
                    navigate('/client');
                  }}
                >
                  See the client view
                </button>
              </div>
              <p className="connect-fineprint">
                Demo workspace · sample mail from Northwind Labs, Atelier Rasa and Meridian Heart Clinic.
              </p>
            </div>
          )}
        </div>

        <p className="connect__foot">
          In a hurry? <Link to="/app">Skip setup and open the workspace</Link>
        </p>
      </main>
    </div>
  );
}
