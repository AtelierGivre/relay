import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Avatar } from './Avatar';
import { useApp } from '../store/AppStore';
import { Sparkles } from './Icons';

export function TakeoverModal({ open, onClose, thread, client }) {
  const { clientAction } = useApp();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setNote('');
      setBusy(false);
    }
  }, [open]);

  if (!thread) return null;

  const confirm = async () => {
    setBusy(true);
    const updated = await clientAction(thread.id, 'takeover', note.trim());
    setBusy(false);
    if (updated) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={480}
      title="Ask Ananya to handle this"
      subtitle="Ananya will take ownership of the reply. The conversation moves to Ananya's queue right away."
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" disabled={busy} onClick={confirm}>
            {busy ? 'Handing over…' : 'Hand this to Ananya'}
          </button>
        </>
      }
    >
      <div className="takeover-thread">
        <Avatar name={client?.name} accent={client?.accent} size={30} />
        <div>
          <strong>{thread.subject}</strong>
          <span>
            {client?.firstName} · routed to you
          </span>
        </div>
      </div>

      <label className="field">
        <span>Optional note for Ananya</span>
        <textarea
          className="textarea"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Please reply that I'm comfortable with the terms, subject to counsel review."
          maxLength={280}
        />
      </label>

      <p className="takeover-hint">
        <Sparkles size={13} /> Ananya keeps the full conversation, so nothing needs forwarding.
      </p>
    </Modal>
  );
}
