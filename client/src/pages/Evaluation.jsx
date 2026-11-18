import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { CLASS_META } from '../lib/selectors';
import { ROUTING_POLICY } from '../../../server/src/ai/engine.js';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCheck,
  Gauge,
  Refresh,
} from '../components/Icons';

const CLASSES = ['assistant', 'client', 'none', 'review'];
const ACCURACY_GATE = 0.9;

const pct = (value) => `${(value * 100).toFixed(1)}%`;

const wrongAutoRoutes = (failures) => failures.filter((f) => f.predicted !== 'review').length;

function missLabel(count, wrongCount) {
  if (count === 0) return 'misses';
  if (wrongCount > 0) return count === 1 ? 'miss' : 'misses';
  return count === 1 ? 'miss, held for review' : 'misses, all to review';
}

function Stat({ label, value, note, tone }) {
  return (
    <div className="eval-stat">
      <span className="eyebrow">{label}</span>
      <strong className={`eval-stat__value serif ${tone ? `is-${tone}` : ''}`}>{value}</strong>
      <span className="eval-stat__note">{note}</span>
    </div>
  );
}

export function Evaluation() {
  const { evaluate } = useApp();
  const [policy, setPolicy] = useState(() => ({
    minEvidence: ROUTING_POLICY.minEvidence,
    minMargin: ROUTING_POLICY.minMargin,
  }));
  const [report, setReport] = useState(null);
  const [pending, setPending] = useState(true);
  const [attempt, setAttempt] = useState(0);

  // The store action is stable, but a ref keeps the debounce honest if it is not.
  const evaluateRef = useRef(evaluate);
  useEffect(() => {
    evaluateRef.current = evaluate;
  }, [evaluate]);

  useEffect(() => {
    let cancelled = false;
    setPending(true);
    const timer = setTimeout(async () => {
      const next = await evaluateRef.current(policy);
      if (cancelled) return;
      if (next) setReport(next);
      setPending(false);
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [policy.minEvidence, policy.minMargin, attempt]);

  const tuned =
    policy.minEvidence !== ROUTING_POLICY.minEvidence ||
    policy.minMargin !== ROUTING_POLICY.minMargin;

  const wrong = useMemo(() => (report ? wrongAutoRoutes(report.failures) : 0), [report]);
  const gatePass = Boolean(report) && report.accuracy >= ACCURACY_GATE && wrong === 0;
  const reviewSent = report ? Math.round(report.reviewRate * report.total) : 0;

  const hero = (
    <header className="eval-hero">
      <div className="eval-hero__copy">
        <span className="eyebrow">
          <Gauge size={12} /> Evaluation
        </span>
        <h1 className="page-title serif">Measure the router.</h1>
        <p className="page-sub">
          A fixed suite of 51 hand-labeled messages, scored on every change. This is a regression
          check, not proof the router is right about your mail. The point is that a bad edit shows up
          here before it reaches a client.
        </p>
      </div>
      {report && (
        <div className="eval-hero__facts">
          <span className="eval-fact">
            <strong className="mono-num">{report.total}</strong>
            labeled cases
          </span>
          <span className="eval-fact">
            <strong className="mono-num">{pct(report.accuracy)}</strong>
            matched
          </span>
          <span className="eval-fact">
            <strong className="mono-num">{report.failures.length}</strong>
            {missLabel(report.failures.length, wrong)}
          </span>
        </div>
      )}
    </header>
  );

  if (!report) {
    return (
      <div className="page page--scroll">
        <div className="page__inner eval">
          {hero}
          <section className="eval-card eval-empty">
            {pending ? 'Running the 51-case suite…' : 'The suite could not run.'}
            {!pending && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => setAttempt((n) => n + 1)}
              >
                <Refresh size={13} /> Try again
              </button>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--scroll">
      <div className="page__inner eval">
        {hero}

        <div className="eval-stats">
          <Stat
            label="Accuracy"
            value={pct(report.accuracy)}
            note={`${report.correct} of ${report.total} matched the label`}
          />
          <Stat
            label="Sent to review"
            value={pct(report.reviewRate)}
            note={`${reviewSent} of ${report.total} asked for a human`}
          />
          <Stat
            label="Wrong auto-routes"
            value={wrong}
            tone={wrong ? 'bad' : 'good'}
            note={wrong ? 'A miss went out on its own' : 'Every miss stopped at review'}
          />
          <Stat label="Routes covered" value="4" note="Assistant, client, no reply, review" />
        </div>

        <div className="eval-top">
          <section className="eval-card eval-classes">
            <header className="eval-card__head">
              <div>
                <h2 className="eval-card__title">Per-route scores</h2>
                <p className="eval-card__sub">
                  Precision is how much of the mail routed here belonged here. Recall is how much of
                  the mail that belonged here was caught.
                </p>
              </div>
            </header>
            <table className="eval-table">
              <thead>
                <tr>
                  <th scope="col">Route</th>
                  <th scope="col">Cases</th>
                  <th scope="col">Precision</th>
                  <th scope="col">Recall</th>
                  <th scope="col">F1</th>
                </tr>
              </thead>
              <tbody>
                {report.perClass.map((row) => (
                  <tr key={row.cls}>
                    <th scope="row">
                      <span className={`seg-dot seg-dot--${CLASS_META[row.cls].tone}`} />
                      {CLASS_META[row.cls].short}
                    </th>
                    <td className="mono-num">{row.support}</td>
                    <td className="mono-num">{pct(row.precision)}</td>
                    <td className="mono-num">{pct(row.recall)}</td>
                    <td className="mono-num">{pct(row.f1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className={`eval-card eval-gate ${gatePass ? 'is-pass' : 'is-fail'}`}>
            <header className="eval-card__head">
              <span className="eyebrow">Release gate</span>
              <span className="eval-gate__state">{gatePass ? 'Passing' : 'Failing'}</span>
            </header>
            <ul className="eval-gate__checks">
              <li className={report.accuracy >= ACCURACY_GATE ? 'is-ok' : 'is-bad'}>
                {report.accuracy >= ACCURACY_GATE ? <Check size={14} /> : <AlertTriangle size={14} />}
                <span>Accuracy of at least 90%</span>
                <span className="mono-num">{pct(report.accuracy)}</span>
              </li>
              <li className={wrong === 0 ? 'is-ok' : 'is-bad'}>
                {wrong === 0 ? <Check size={14} /> : <AlertTriangle size={14} />}
                <span>No confident wrong routes</span>
                <span className="mono-num">{wrong}</span>
              </li>
            </ul>
            <p className="eval-gate__note">
              When the router is unsure it sends the thread to review, so a miss costs a click, not a
              wrong reply.
            </p>
          </section>
        </div>

        <div className="eval-split">
          <section className="eval-card eval-matrix-card">
            <header className="eval-card__head">
              <div>
                <h2 className="eval-card__title">Confusion matrix</h2>
                <p className="eval-card__sub">
                  Rows are the human label, columns are what the router chose. The diagonal is
                  correct. Every other number is a miss, kept in the set on purpose.
                </p>
              </div>
            </header>
            <div className="eval-matrix__wrap">
              <table className="eval-matrix">
                <thead>
                  <tr>
                    <th scope="col" className="eval-matrix__corner">
                      Expected ↓ / routed →
                    </th>
                    {CLASSES.map((cls) => (
                      <th scope="col" key={cls}>
                        <span className={`seg-dot seg-dot--${CLASS_META[cls].tone}`} />
                        {CLASS_META[cls].short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CLASSES.map((expected) => (
                    <tr key={expected}>
                      <th scope="row">
                        <span className={`seg-dot seg-dot--${CLASS_META[expected].tone}`} />
                        {CLASS_META[expected].short}
                      </th>
                      {CLASSES.map((predicted) => {
                        const count = report.confusion[expected][predicted];
                        const hit = expected === predicted;
                        const states = [
                          'eval-cell',
                          count === 0 ? 'is-zero' : '',
                          hit ? 'is-hit' : '',
                          !hit && count > 0 ? 'is-miss' : '',
                        ]
                          .filter(Boolean)
                          .join(' ');
                        return (
                          <td
                            key={predicted}
                            className={states}
                            title={`${count} expected ${CLASS_META[expected].short}, routed ${CLASS_META[predicted].short}`}
                          >
                            <span className="mono-num">{count}</span>
                            <span className="sr-only">
                              {' '}
                              expected {CLASS_META[expected].short}, routed {CLASS_META[predicted].short}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row">Routed</th>
                    {report.perClass.map((row) => (
                      <td key={row.cls} className="mono-num">
                        {row.predicted}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className="eval-card eval-misses">
            <header className="eval-card__head">
              <div>
                <h2 className="eval-card__title">Misses at these settings</h2>
                <p className="eval-card__sub">
                  Hard cases stay in the suite so tuning cannot quietly forget them.
                </p>
              </div>
              <span className="eval-count mono-num">{report.failures.length}</span>
            </header>
            {report.failures.length === 0 ? (
              <p className="eval-misses__empty">
                Nothing missed at this policy. Check the defaults before trusting that.
              </p>
            ) : (
              <div className="eval-misses__rows">
                {report.failures.map((miss) => (
                  <article className="eval-miss" key={miss.id}>
                    <div className="eval-miss__top">
                      <span className="eval-miss__id mono-num">{miss.id}</span>
                      <span className="eval-miss__subject truncate">{miss.subject}</span>
                      <span className="eval-miss__conf mono-num">
                        {pct(miss.confidence)}
                        <span className="sr-only">
                          {' '}
                          confidence in {CLASS_META[miss.predicted].label}
                        </span>
                      </span>
                    </div>
                    <div className="eval-miss__meta">
                      <span className={`eval-chip eval-chip--${CLASS_META[miss.expected].tone}`}>
                        {CLASS_META[miss.expected].short}
                      </span>
                      <ArrowRight size={11} />
                      <span className={`eval-chip eval-chip--${CLASS_META[miss.predicted].tone}`}>
                        {CLASS_META[miss.predicted].short}
                      </span>
                      <span className="eval-miss__client">{miss.client}</span>
                    </div>
                    <p className="eval-miss__signals">
                      {miss.signals.length
                        ? `Saw ${miss.signals.join(' and ')}.`
                        : 'No rule matched this message.'}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="eval-card eval-policy">
          <header className="eval-card__head">
            <div>
              <h2 className="eval-card__title">Threshold check</h2>
              <p className="eval-card__sub">
                Re-run the whole suite under a different policy. The live router keeps the defaults.
              </p>
            </div>
            <div className="eval-policy__actions">
              {!tuned && <span className="eval-tag">Defaults</span>}
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setPolicy({ ...ROUTING_POLICY })}
                disabled={!tuned}
              >
                <Refresh size={13} /> Reset to defaults
              </button>
            </div>
          </header>

          <div className="eval-policy__grid">
            <div className="eval-slider">
              <div className="eval-slider__top">
                <label htmlFor="eval-floor">Evidence floor</label>
                <span className="mono-num">{policy.minEvidence.toFixed(1)}</span>
              </div>
              <input
                id="eval-floor"
                type="range"
                min="2"
                max="8"
                step="0.1"
                value={policy.minEvidence}
                onChange={(e) => setPolicy((p) => ({ ...p, minEvidence: Number(e.target.value) }))}
              />
              <p>
                A route must collect at least this much evidence. Raise it to send more borderline
                mail to review.
              </p>
            </div>

            <div className="eval-slider">
              <div className="eval-slider__top">
                <label htmlFor="eval-margin">Required margin</label>
                <span className="mono-num">{policy.minMargin.toFixed(1)}</span>
              </div>
              <input
                id="eval-margin"
                type="range"
                min="0.5"
                max="4"
                step="0.1"
                value={policy.minMargin}
                onChange={(e) => setPolicy((p) => ({ ...p, minMargin: Number(e.target.value) }))}
              />
              <p>
                How far the top route must lead before Relay commits. Raise it to make the router
                hesitate when two routes are close.
              </p>
            </div>

            <div className={`eval-outcome ${gatePass ? 'is-pass' : 'is-fail'}`}>
              <div className="eval-outcome__row">
                <span>Accuracy</span>
                <strong className="mono-num">{pct(report.accuracy)}</strong>
              </div>
              <div className="eval-outcome__row">
                <span>Wrong auto-routes</span>
                <strong className="mono-num">{wrong}</strong>
              </div>
              <div className="eval-outcome__row">
                <span>Sent to review</span>
                <strong className="mono-num">
                  {reviewSent} of {report.total}
                </strong>
              </div>
              <p aria-live="polite">
                {pending
                  ? 'Recalculating…'
                  : gatePass
                    ? 'This policy clears the release gate.'
                    : 'This policy would fail the release gate.'}
              </p>
            </div>
          </div>
        </section>

        <footer className="eval-foot">
          <span>
            <CheckCheck size={13} /> The same suite runs in the API tests, so a regression fails the
            build too.
          </span>
          <Link to="/app/lab">
            Try one message by hand <ArrowRight size={13} />
          </Link>
        </footer>
      </div>
    </div>
  );
}
