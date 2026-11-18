import { useState } from 'react';
import { useApp } from '../store/AppStore';
import { relative } from '../lib/format';
import { Avatar } from '../components/Avatar';
import { Modal } from '../components/Modal';
import { StatusDot } from '../components/Chips';
import {
  Check,
  Google,
  Link,
  Lock,
  Microsoft,
  Plus,
  Refresh,
  Shield,
  Sparkles,
} from '../components/Icons';

function providerName(provider) {
  return provider === 'microsoft' ? 'Microsoft Outlook' : 'Google Gmail';
}

export function Accounts() {
  const { accounts, clients, syncAccount, setAccountStatus, addAccount } = useApp();
  const [adding, setAdding] = useState(false);
  const [provider, setProvider] = useState('google');
  const [address, setAddress] = useState('ananya@relay.studio');
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(null);

  const clientOf = (account) => clients.find((c) => c.id === account.clientId);

  const sync = async (id) => {
    setSyncing(id);
    await syncAccount(id);
    window.setTimeout(() => setSyncing(null), 400);
  };

  const connect = async (e) => {
    e.preventDefault();
    setBusy(true);
    await new Promise((r) => window.setTimeout(r, 900));
    const next = await addAccount(provider, address);
    setBusy(false);
    if (next) {
      setAdding(false);
      setAddress('ananya@relay.studio');
    }
  };

  return (
    <div className="page page--scroll">
      <div className="page__inner accounts-page">
        <header className="page-head">
          <div className="page-head__text">
            <span className="eyebrow">Mailboxes</span>
            <h1 className="page-title serif">Connections &amp; sync</h1>
            <p className="page-sub">
              Relay reads each client&apos;s mailbox with read and send access. Every reply still needs your approval
              before it leaves.
            </p>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => setAdding(true)}>
            <Plus size={15} /> Connect mailbox
          </button>
        </header>

        <section className="account-grid">
          {accounts.map((account) => {
            const client = clientOf(account);
            const connected = account.status === 'connected';
            return (
              <article key={account.id} className={`acct-card ${connected ? '' : 'is-off'}`}>
                <header className="acct-card__head">
                  <span className="acct-card__provider">
                    {account.provider === 'microsoft' ? <Microsoft size={20} /> : <Google size={20} />}
                  </span>
                  <div className="acct-card__id">
                    <h3>{account.label}</h3>
                    <p>{account.address}</p>
                  </div>
                  <span className={`acct-status ${connected ? 'is-on' : 'is-off'}`}>
                    <StatusDot tone={connected ? 'green' : 'clay'} />
                    {connected ? 'Connected' : 'Disconnected'}
                  </span>
                </header>

                {account.health === 'expiring' && connected && (
                  <div className="acct-card__warn">
                    <Refresh size={13} />
                    <span>{account.note || 'Access token expires soon'}.</span>
                    <button
                      type="button"
                      className="acct-card__renew"
                      title="Refresh access and sync now"
                      onClick={() => setAccountStatus(account.id, 'connected')}
                    >
                      Renew access
                    </button>
                  </div>
                )}

                <dl className="acct-meta">
                  <div>
                    <dt>Last sync</dt>
                    <dd>{account.lastSyncAt ? relative(account.lastSyncAt) : 'Never'}</dd>
                  </div>
                  <div>
                    <dt>Messages indexed</dt>
                    <dd className="mono-num">{account.messageCount.toLocaleString('en-US')}</dd>
                  </div>
                  <div>
                    <dt>Client</dt>
                    <dd>{client ? client.name : 'Assistant mailbox'}</dd>
                  </div>
                  <div>
                    <dt>Provider</dt>
                    <dd>{providerName(account.provider)}</dd>
                  </div>
                </dl>

                <div className="acct-scopes">
                  {account.scopes.map((scope) => (
                    <code key={scope}>{scope}</code>
                  ))}
                </div>

                <footer className="acct-card__foot">
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    disabled={!connected || syncing === account.id}
                    onClick={() => sync(account.id)}
                  >
                    <Refresh size={13} className={syncing === account.id ? 'spin' : ''} />
                    {syncing === account.id ? 'Syncing…' : 'Sync now'}
                  </button>
                  {connected ? (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm acct-disconnect"
                      onClick={() => setAccountStatus(account.id, 'disconnected')}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--soft btn--sm"
                      onClick={() => setAccountStatus(account.id, 'connected')}
                    >
                      <Link size={13} /> Reconnect
                    </button>
                  )}
                  {client && (
                    <span className="acct-card__client">
                      <Avatar name={client.name} accent={client.accent} size={18} />
                      {client.firstName}
                    </span>
                  )}
                </footer>
              </article>
            );
          })}

          <button type="button" className="acct-add" onClick={() => setAdding(true)}>
            <span className="acct-add__icon">
              <Plus size={18} />
            </span>
            <span className="acct-add__title">Connect another mailbox</span>
            <span className="acct-add__sub">Gmail or Microsoft 365</span>
          </button>
        </section>

        <div className="accounts-grid-2">
          <section className="info-panel">
            <span className="info-panel__icon">
              <Shield size={17} />
            </span>
            <h3>Scoped, read-and-send access</h3>
            <p>
              Relay requests the narrowest scopes it needs: read mail, send on approval, and read calendar events for
              meeting extraction. Messages and drafts stay inside the workspace.
            </p>
            <ul className="info-list">
              <li>
                <Check size={13} /> No email is sent without an explicit approval
              </li>
              <li>
                <Lock size={13} /> Tokens are stored per mailbox, never shared across clients
              </li>
              <li>
                <Refresh size={13} /> New messages trigger an ownership re-check
              </li>
            </ul>
          </section>

          <section className="info-panel info-panel--sim">
            <span className="info-panel__icon">
              <Sparkles size={17} />
            </span>
            <h3>Demo data</h3>
            <p>
              Sample mail is loaded, and sign-in is simulated. Routing, summaries, drafts, and hand-offs all work end
              to end.
            </p>
            <div className="sim-tags">
              <span>Gmail / Outlook sign-in</span>
              <span>Mail sync</span>
              <span>Sending</span>
              <span>Sample mailbox data</span>
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Connect a mailbox"
        subtitle="You'll be asked to approve read and send access for this address."
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn--primary" disabled={busy || !address} onClick={connect}>
              {busy ? 'Authorizing…' : `Continue with ${provider === 'microsoft' ? 'Microsoft' : 'Google'}`}
            </button>
          </>
        }
      >
        <div className="provider-pick">
          {[
            { id: 'google', label: 'Gmail', icon: <Google size={20} /> },
            { id: 'microsoft', label: 'Outlook', icon: <Microsoft size={20} /> },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              className={`provider-option ${provider === p.id ? 'is-on' : ''}`}
              onClick={() => setProvider(p.id)}
            >
              <span className="provider-option__icon">{p.icon}</span>
              <span className="provider-option__label">{p.label}</span>
              {provider === p.id && (
                <span className="provider-option__check">
                  <Check size={13} />
                </span>
              )}
            </button>
          ))}
        </div>

        <label className="field">
          <span>Mailbox address</span>
          <input
            className="input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="you@example.com"
            type="email"
          />
        </label>

        <ul className="perm-list">
          <li>
            <Check size={13} /> Read messages and conversation history
          </li>
          <li>
            <Check size={13} /> Send replies after your approval
          </li>
          <li>
            <Check size={13} /> Read calendar events connected to email
          </li>
        </ul>
        <p className="perm-note">
          <Lock size={12} /> Demo mode: the provider sign-in is simulated and no real mailbox is accessed.
        </p>
      </Modal>
    </div>
  );
}
