'use client';

import { useState } from 'react';
import { apiFetch } from '../../../lib/session';
import s from './apply-modal.module.css';

type Role = {
  id: string;
  key: string;
  label: string;
  count: number;
};

type Props = {
  projectId: string;
  templateTitle: string;
  roles: Role[];
  onClose: () => void;
  onSuccess: () => void;
};

type Preference = {
  rank: number;
  templateRoleId: string;
};

export default function ApplyModal({ projectId, templateTitle, roles, onClose, onSuccess }: Props) {
  const [statement, setStatement] = useState('');
  const [availabilityNote, setAvailabilityNote] = useState('');
  const [preferences, setPreferences] = useState<Preference[]>(
    roles.map((role, index) => ({ rank: index + 1, templateRoleId: role.id }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updatePreference(rank: number, templateRoleId: string) {
    setPreferences((prev) => {
      const next = prev.filter((p) => p.rank !== rank);
      next.push({ rank, templateRoleId });
      return next.sort((a, b) => a.rank - b.rank);
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await apiFetch(`/v1/tracking/projects/${projectId}/applications`, {
        auth: true,
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          statement: statement.trim(),
          availabilityNote: availabilityNote.trim(),
          preferences: preferences.filter((p) => p.templateRoleId).sort((a, b) => a.rank - b.rank),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Failed to submit application (${res.status})`);
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
      className={s.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="apply-modal-title">
        {/* Header */}
        <div className={s.header}>
          <div className={s.headerText}>
            <h2 id="apply-modal-title" className={s.title}>
              Apply for Roles
            </h2>
            <p className={s.subtitle}>{templateTitle} · rank your preferred roles below.</p>
          </div>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* How it works */}
        <div className={s.howItWorks}>
          <p className={s.howItWorksTitle}>How this works</p>
          <ol className={s.howItWorksList}>
            <li>Rank the roles you want most (1 = top choice).</li>
            <li>Briefly describe your skills and any scheduling constraints.</li>
            <li>Instructors review applications, generate teams, then lock the roster.</li>
          </ol>
        </div>

        {/* Role preferences */}
        <div className={s.field}>
          <label className={s.label}>Rank your preferred roles</label>
          <div className={s.prefList}>
            {roles.map((_, index) => (
              <div key={index} className={s.prefRow}>
                <span className={s.prefRank}>Choice {index + 1}</span>
                <select
                  className={s.prefSelect}
                  value={preferences.find((p) => p.rank === index + 1)?.templateRoleId ?? ''}
                  onChange={(e) => updatePreference(index + 1, e.target.value)}
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label} ({role.count} spot{role.count !== 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <p className={s.prefHint}>
            Preferences guide team generation — required role slots are filled first.
          </p>
        </div>

        {/* Statement */}
        <div className={s.field}>
          <label htmlFor="apply-statement" className={s.label}>
            Motivation / skills{' '}
            <span style={{ fontWeight: 400, color: 'var(--text-soft)' }}>(optional)</span>
          </label>
          <textarea
            id="apply-statement"
            className={s.textarea}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            maxLength={1000}
            placeholder="Briefly describe what you can contribute to the team."
          />
        </div>

        {/* Availability note */}
        <div className={s.field}>
          <label htmlFor="apply-availability" className={s.label}>
            Availability note{' '}
            <span style={{ fontWeight: 400, color: 'var(--text-soft)' }}>(optional)</span>
          </label>
          <textarea
            id="apply-availability"
            className={s.textarea}
            value={availabilityNote}
            onChange={(e) => setAvailabilityNote(e.target.value)}
            maxLength={500}
            placeholder="Any scheduling constraints or collaboration preferences."
            style={{ minHeight: 64 }}
          />
        </div>

        {error && <p className={s.errorMsg}>{error}</p>}

        {/* Actions */}
        <div className={s.actions}>
          <button type="button" className={s.cancelBtn} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className={s.submitBtn}
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
