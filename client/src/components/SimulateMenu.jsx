import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppStore';
import { Avatar } from './Avatar';
import { Popover } from './Popover';
import { Sparkles, ChevronDown } from './Icons';

const OPTIONS = [
  {
    kind: 'client',
    title: 'A client decision',
    hint: 'Investor asks for your client\u2019s call',
    tone: 'client',
  },
  {
    kind: 'assistant',
    title: 'A scheduling request',
    hint: 'Coordinator needs a new time',
    tone: 'assistant',
  },
  {
    kind: 'review',
    title: 'An ambiguous intro',
    hint: 'Low confidence, lands in review',
    tone: 'review',
  },
  {
    kind: 'none',
    title: 'A newsletter',
    hint: 'Filed with no reply needed',
    tone: 'none',
  },
];

export function SimulateMenu() {
  const { clients, simulate } = useApp();
  const navigate = useNavigate();
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [busy, setBusy] = useState(null);

  const run = async (kind) => {
    setBusy(kind);
    const thread = await simulate(kind, clientId);
    setBusy(null);
    if (thread) navigate(`/app/inbox/${thread.id}`);
  };

  return (
    <Popover
      width={300}
      trigger={({ toggle, open }) => (
        <button
          type="button"
          className={`btn btn--outline btn--sm demo-trigger ${open ? 'is-open' : ''}`}
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <Sparkles size={14} />
          <span className="demo-trigger__label">Simulate</span>
          <ChevronDown size={13} />
        </button>
      )}
    >
      <div className="simulate">
        <div className="simulate__head">
          <div className="simulate__title">See routing live</div>
          <p className="simulate__sub">Drop a sample email into a client&apos;s inbox and watch Relay sort it.</p>
        </div>
        <div className="simulate__clients">
          {clients.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`simulate__client ${clientId === c.id ? 'is-on' : ''}`}
              onClick={() => setClientId(c.id)}
            >
              <Avatar name={c.name} accent={c.accent} size={20} />
              <span>{c.firstName}</span>
            </button>
          ))}
        </div>
        <div className="simulate__list">
          {OPTIONS.map((o) => (
            <button
              key={o.kind}
              type="button"
              className="simulate__option"
              disabled={busy !== null}
              onClick={() => run(o.kind)}
            >
              <span className={`simulate__spark chip--${o.tone}`}>
                <Sparkles size={13} />
              </span>
              <span className="simulate__option-text">
                <span className="simulate__option-title">{busy === o.kind ? 'Routing…' : o.title}</span>
                <span className="simulate__option-hint">{o.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Popover>
  );
}
