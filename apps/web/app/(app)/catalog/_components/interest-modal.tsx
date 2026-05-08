'use client';

import { useState } from 'react';
import { apiFetch } from '../../../lib/session';

type Props = {
  projectId: string;
  templateTitle: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function InterestModal({ projectId, templateTitle, onClose, onSuccess }: Props) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await apiFetch(`/v1/tracking/projects/${projectId}/interests`, {
        auth: true,
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Failed to submit interest (${res.status})`);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 32,
          maxWidth: 480,
          width: '100%',
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Express Interest</h2>
        <p style={{ color: 'var(--text-soft)', margin: '0 0 20px', fontSize: 14 }}>
          You&apos;re expressing interest in <strong>{templateTitle}</strong>. The instructor will
          be notified and can approve or decline your request.
        </p>

        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
          Message <span style={{ fontWeight: 400, color: 'var(--text-soft)' }}>(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Why are you interested in this project? Any relevant experience?"
          style={{
            width: '100%',
            resize: 'vertical',
            borderRadius: 8,
            border: '1px solid var(--border)',
            padding: '10px 12px',
            fontSize: 14,
            background: 'var(--surface-strong)',
            color: 'var(--text)',
            boxSizing: 'border-box',
          }}
        />
        <p
          style={{
            fontSize: 12,
            color: 'var(--text-soft)',
            margin: '4px 0 16px',
            textAlign: 'right',
          }}
        >
          {message.length}/500
        </p>

        {error && (
          <p style={{ color: 'var(--error, #ef4444)', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-soft)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {submitting ? 'Sending…' : 'Send Interest'}
          </button>
        </div>
      </div>
    </div>
  );
}
