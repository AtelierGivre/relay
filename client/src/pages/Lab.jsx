import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { CLASS_META } from '../lib/selectors';
import { percent } from '../lib/format';
import { useToast } from '../components/Toast';
import { ROUTING_POLICY, RULE_COUNT, classify } from '../../../server/src/ai/engine.js';
import { ArrowRight, Flask, Refresh } from '../components/Icons';

const SCORE_KEYS = ['assistant', 'client', 'none'];

const PRESETS = [
  {
    key: 'decision',
    name: 'A client decision',
    fromName: 'Ishaan Verma',
    fromEmail: 'ishaan@northstar-capital.com',
    subject: () => 'Before we finalize: one decision for you',
    body: (c) => `Hi ${c.firstName},

Thank you for the introduction call. Before we take this further, there is one point my team cannot settle without you: the final commercial terms, and how much flexibility you would like built into the agreement.

Could you share your view by Friday? Happy to jump on a call if that is easier. I do not want to assume on your behalf.

Best,
Ishaan`,
  },
  {
    key: 'schedule',
    name: 'A scheduling request',
    fromName: 'Neha · Studio Ops',
    fromEmail: 'ops@studio-calendar.in',
    subject: () => 'Reschedule: shoot prep call',
    body: (c) => `Hi Ananya,

The photographer has a conflict on the original slot. Could we move the prep call to 4:30pm on the same day, or 10:00am the next morning?

Please let me know which works and I will re-send the invite to ${c.firstName}'s team.

Thanks,
Neha`,
  },
  {
    key: 'newsletter',
    name: 'A newsletter',
    fromName: 'Notion',
    fromEmail: 'notifications@notion.so',
    subject: () => 'Your weekly workspace digest',
    body: () => `Here is what changed in your workspace this week: 12 pages updated, 3 comments resolved.

You are receiving this because you are subscribed to weekly digests. Unsubscribe | View in browser.`,
  },
  {
    key: 'ambiguous',
    name: 'An ambiguous intro',
    fromName: 'Aditi Sharma',
    fromEmail: 'aditi@commonroom.vc',
    subject: (c) => `Intro: could be useful for ${c.company}`,
    body: (c) => `Hi both,

A founder in our portfolio is exploring a partnership that might overlap with ${c.company}. Happy to make an intro if it is useful, or we can leave it for now.

No rush, just let me know.

Aditi`,
  },
];

function presetForm(preset, client) {
  return {
    fromName: preset.fromName,
    fromEmail: preset.fromEmail,
    subject: preset.subject(client),
    body: preset.body(client),
  };
}

function initialForm(thread, client) {
  if (thread) {
    const inbound = [...thread.messages].reverse().find((m) => m.direction === 'in') || thread.messages[0];
    return {
      clientId: thread.clientId,
      fromName: inbound.from.name,
      fromEmail: inbound.from.email,
      subject: thread.subject,
      body: inbound.body,
    };
  }
  return { clientId: client.id, ...presetForm(PRESETS[0], client) };
}

function toneOf(cls) {
  return CLASS_META[cls]?.tone || 'none';
}

export function Lab() {
  const { threads, clients } = useApp();
  const toast = useToast();
  const [params] = useSearchParams();
  const sourceThread = threads.find((t) => t.id === params.get('thread'));
  const firstClient = clients.find((c) => c.id === sourceThread?.clientId) || clients[0];

  const [form, setForm] = useState(() => initialForm(sourceThread, firstClient));
  const [activePreset, setActivePreset] = useState(sourceThread ? null : PRESETS[0].key);
  const [policy, setPolicy] = useState({ ...ROUTING_POLICY });

  const client = clients.find((c) => c.id === form.clientId) || firstClient;

  const thread = useMemo(
    () => ({
      id: 'lab-thread',
      clientId: form.clientId,
      subject: form.subject.trim() || 'Untitled message',
      messages: [
        {
          id: 'lab-message',
          direction: 'in',
          from: {
            name: form.fromName.trim() || 'Unknown sender',
            email: form.fromEmail.trim() || 'unknown@example.com',
          },
          to: [],
          at: new Date().toISOString(),
          body: form.body,
        },
      ],
      events: [],
      deadlines: [],
      tags: [],
    }),
    [form],
  );

  const analysis = useMemo(() => classify(thread, client, policy), [thread, client, policy]);
  const meta = CLASS_META[analysis.classification];
  const ledger = useMemo(
    () => [...analysis.evidence].sort((a, b) => b.w - a.w),
    [analysis],
  );
  const ranked = useMemo(
    () =>
      SCORE_KEYS.map((key) => ({ key, value: analysis.candidates[key] || 0 })).sort(
        (a, b) => b.value - a.value,
      ),
    [analysis],
  );
  const scaleMax = Math.max(policy.minEvidence, ...ranked.map((r) => r.value), 1) * 1.08;
  const floorAt = Math.min(100, Math.max(0, (policy.minEvidence / scaleMax) * 100));

  const tuned =
    policy.minEvidence !== ROUTING_POLICY.minEvidence || policy.minMargin !== ROUTING_POLICY.minMargin;

  const impact = useMemo(() => {
    if (!tuned) return [];
    return threads
      .filter((t) => !t.archived && t.status !== 'done' && !t.ai?.manual)
      .map((t) => {
        const next = classify(t, clients.find((c) => c.id === t.clientId), policy);
        return next.classification !== t.ai.classification ? { thread: t, to: next.classification } : null;
      })
      .filter(Boolean);
  }, [threads, clients, policy, tuned]);

  if (!client) return null;

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const applyPreset = (preset) => {
    setActivePreset(preset.key);
    update(presetForm(preset, client));
  };

  const resetPolicy = () => setPolicy({ ...ROUTING_POLICY });

  const copyReceipt = async () => {
    const lines = [
      'Relay routing decision',
      `Subject: ${thread.subject}`,
      `Verdict: ${meta.label} (${percent(analysis.confidence)} confidence)`,
      `Scores: ${ranked.map((r) => `${CLASS_META[r.key].short} ${r.value.toFixed(1)}`).join(' · ')}`,
      `Margin: ${analysis.margin.toFixed(1)} (review below ${policy.minMargin.toFixed(1)})`,
      `Evidence: ${ledger.map((e) => `+${e.w.toFixed(1)} ${e.label}`).join('; ') || 'none matched'}`,
      `Policy: evidence floor ${policy.minEvidence.toFixed(1)}, required margin ${policy.minMargin.toFixed(1)}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      toast.push('Decision receipt copied.');
    } catch {
      toast.error(new Error('Your browser blocked the clipboard.'));
    }
  };

  return (
    <div className="page page--scroll">
      <div className="page__inner lab">
        <header className="lab-hero">
          <div className="lab-hero__copy">
            <span className="eyebrow">
              <Flask size={12} /> Routing lab
            </span>
            <h1 className="page-title serif">See the router think.</h1>
            <p className="page-sub">
              Every route is a weighted decision. Edit the message, move the bars, and watch the verdict
              change. These are the rules that sort your inbox, not a model you have to take on faith.
            </p>
          </div>
          <div className="lab-hero__facts">
            <span className="lab-fact">
              <strong className="mono-num">{RULE_COUNT}</strong>
              weighted rules
            </span>
            <span className="lab-fact">
              <strong className="mono-num">4</strong>
              possible routes
            </span>
            <span className="lab-fact">
              <strong className="mono-num">1</strong>
              human fallback
            </span>
          </div>
        </header>

        <div className="lab-grid">
          <section className="lab-card lab-compose">
            <header className="lab-card__head">
              <div>
                <h2 className="lab-card__title">Compose a message</h2>
                <p className="lab-card__sub">Start from a sample or write your own. Nothing is sent.</p>
              </div>
            </header>

            <div className="lab-presets" role="group" aria-label="Sample messages">
              {PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  className={`lab-preset ${activePreset === preset.key ? 'is-on' : ''}`}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="lab-fields">
              <div className="lab-row">
                <label className="lab-field">
                  <span>From name</span>
                  <input
                    value={form.fromName}
                    onChange={(e) => update({ fromName: e.target.value })}
                    onFocus={() => setActivePreset(null)}
                  />
                </label>
                <label className="lab-field">
                  <span>From address</span>
                  <input
                    value={form.fromEmail}
                    onChange={(e) => update({ fromEmail: e.target.value })}
                    onFocus={() => setActivePreset(null)}
                  />
                </label>
              </div>
              <div className="lab-row">
                <label className="lab-field">
                  <span>Client</span>
                  <select value={form.clientId} onChange={(e) => update({ clientId: e.target.value })}>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} · {c.company}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="lab-field">
                  <span>Subject</span>
                  <input
                    value={form.subject}
                    onChange={(e) => update({ subject: e.target.value })}
                    onFocus={() => setActivePreset(null)}
                  />
                </label>
              </div>
              <label className="lab-field lab-field--body">
                <span>Message</span>
                <textarea
                  rows={12}
                  value={form.body}
                  onChange={(e) => update({ body: e.target.value })}
                  onFocus={() => setActivePreset(null)}
                />
              </label>
            </div>
          </section>

          <section className={`lab-card lab-verdict lab-verdict--${meta.tone}`}>
            <header className="lab-card__head">
              <span className="eyebrow">Verdict</span>
              <button type="button" className="lab-copy" onClick={copyReceipt}>
                Copy decision receipt
              </button>
            </header>

            <div className="lab-verdict__main">
              <span className="lab-verdict__label">{meta.label}</span>
              <span className="lab-verdict__conf mono-num">
                {percent(analysis.confidence)}
                <small>confidence</small>
              </span>
            </div>
            <p className="lab-verdict__why">{analysis.reason}</p>

            <div className="lab-scores" role="group" aria-label="Weighted evidence by route">
              {ranked.map((r) => (
                <div className="lab-score" key={r.key}>
                  <span className={`lab-score__label lab-score__label--${toneOf(r.key)}`}>
                    {CLASS_META[r.key].short}
                  </span>
                  <span className="lab-score__track">
                    <span
                      className={`lab-score__fill lab-score__fill--${toneOf(r.key)}`}
                      style={{ width: `${Math.round((r.value / scaleMax) * 100)}%` }}
                    />
                    <span className="lab-score__floor" style={{ left: `${floorAt}%` }} aria-hidden="true" />
                  </span>
                  <span className="lab-score__value mono-num">{r.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <p className="lab-scores__caption">
              Weighted evidence per route. The tick marks the automatic routing floor at{' '}
              {policy.minEvidence.toFixed(1)}.
            </p>

            <div className="lab-ledger">
              <div className="lab-ledger__head">
                <span>Evidence considered</span>
                <span className="mono-num">{ledger.length}</span>
              </div>
              {ledger.length ? (
                <div className="lab-ledger__rows">
                  {ledger.map((hit) => (
                    <div className="lab-ledger__row" key={`${hit.cls}-${hit.label}`}>
                      <span className={`seg-dot seg-dot--${toneOf(hit.cls)}`} />
                      <span className="lab-ledger__label">{hit.label}</span>
                      <span className="lab-ledger__w mono-num">+{hit.w.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="lab-ledger__empty">
                  No rule matched this message. With nothing to weigh, Relay will not guess.
                </p>
              )}
            </div>

            <div className="lab-margin">
              <div className="lab-margin__figure">
                <span className="eyebrow">Margin</span>
                <strong className="mono-num">{analysis.margin.toFixed(1)}</strong>
              </div>
              <p>
                Gap between the top two routes. Below {policy.minMargin.toFixed(1)}, Relay sends the
                conversation to review instead of guessing.
              </p>
            </div>
          </section>
        </div>

        <section className="lab-card lab-policy">
          <header className="lab-card__head">
            <div>
              <h2 className="lab-card__title">Calibrate the policy</h2>
              <p className="lab-card__sub">
                Live routing uses the defaults. Use this bench to test what stricter or looser rules would
                do before changing them.
              </p>
            </div>
            <button type="button" className="btn btn--ghost btn--sm" onClick={resetPolicy} disabled={!tuned}>
              <Refresh size={13} /> Reset to defaults
            </button>
          </header>

          <div className="lab-policy__grid">
            <div className="lab-slider">
              <div className="lab-slider__top">
                <label htmlFor="lab-floor">Evidence floor</label>
                <span className="mono-num">{policy.minEvidence.toFixed(1)}</span>
              </div>
              <input
                id="lab-floor"
                type="range"
                min="2"
                max="8"
                step="0.1"
                value={policy.minEvidence}
                onChange={(e) => setPolicy((p) => ({ ...p, minEvidence: Number(e.target.value) }))}
              />
              <p>
                A route must collect at least this much evidence. Raise it to send more borderline mail to
                review.
              </p>
            </div>

            <div className="lab-slider">
              <div className="lab-slider__top">
                <label htmlFor="lab-margin">Required margin</label>
                <span className="mono-num">{policy.minMargin.toFixed(1)}</span>
              </div>
              <input
                id="lab-margin"
                type="range"
                min="0.5"
                max="4"
                step="0.1"
                value={policy.minMargin}
                onChange={(e) => setPolicy((p) => ({ ...p, minMargin: Number(e.target.value) }))}
              />
              <p>
                How far the top route must lead. Raise it to make Relay hesitate when two routes are close.
              </p>
            </div>

            <div className="lab-impact">
              <div className="lab-impact__head">
                <span className="eyebrow">Effect on your inbox</span>
                <span className="mono-num">{tuned ? `${impact.length} would move` : 'defaults'}</span>
              </div>
              {!tuned && <p className="lab-impact__note">Move a bar to see which conversations change hands.</p>}
              {tuned && impact.length === 0 && (
                <p className="lab-impact__note">No conversation changes with these bars.</p>
              )}
              {tuned &&
                impact.slice(0, 4).map(({ thread: t, to }) => (
                  <Link key={t.id} to={`/app/inbox/${t.id}`} className="lab-impact__row">
                    <span className="lab-impact__subject truncate">{t.subject}</span>
                    <span className="lab-impact__move">
                      {CLASS_META[t.ai.classification].short}
                      <ArrowRight size={11} />
                      {CLASS_META[to].short}
                    </span>
                  </Link>
                ))}
              {tuned && impact.length > 4 && (
                <span className="lab-impact__more">and {impact.length - 4} more</span>
              )}
            </div>
          </div>
        </section>

        <footer className="lab-foot">
          <span>
            <Flask size={13} /> Every decision here is reproducible. Same message, same policy, same route.
          </span>
          <Link to="/app/board">
            See live decisions <ArrowRight size={13} />
          </Link>
        </footer>
      </div>
    </div>
  );
}
