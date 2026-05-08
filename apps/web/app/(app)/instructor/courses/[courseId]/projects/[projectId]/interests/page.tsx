'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { use } from 'react';
import { useFetch } from '../../../../../../../lib/use-fetch';
import { apiFetch } from '../../../../../../../lib/session';
import styles from '../../../../../instructor.module.css';

type Interest = {
  id: string;
  userId: string;
  userName: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--text-soft)',
  approved: 'var(--success)',
  rejected: 'var(--error, #ef4444)',
};

export default function ProjectInterestsPage({
  params,
}: {
  params: Promise<{ courseId: string; projectId: string }>;
}) {
  const { courseId, projectId } = use(params);
  const [toast, setToast] = useState('');
  const [actionError, setActionError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const {
    data: interests,
    loading,
    error,
    reload,
  } = useFetch<Interest[]>(`/v1/tracking/projects/${projectId}/interests`);

  const handleAction = useCallback(
    async (interestId: string, status: 'approved' | 'rejected') => {
      setUpdating(interestId);
      setActionError('');
      try {
        const res = await apiFetch(
          `/v1/tracking/projects/${projectId}/interests/${interestId}`,
          {
            auth: true,
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ status }),
          }
        );
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Action failed (${res.status})`);
        }
        setToast(`Interest ${status === 'approved' ? 'approved' : 'rejected'} ✓`);
        setTimeout(() => setToast(''), 3500);
        reload();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : String(err));
      } finally {
        setUpdating(null);
      }
    },
    [projectId, reload]
  );

  return (
    <div className={styles.page}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '12px 20px',
            zIndex: 999,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          }}
        >
          {toast}
        </div>
      )}

      <div className={styles.detailHeader}>
        <div>
          <p className={styles.breadcrumb}>
            <Link href="/instructor">Instructor</Link> /{' '}
            <Link href={`/instructor/courses/${courseId}`}>Course</Link> /{' '}
            <Link href={`/instructor/courses/${courseId}/projects/${projectId}`}>Project</Link> /{' '}
            Interest Requests
          </p>
          <h1>Interest Requests</h1>
          <p className={styles.subtitle}>
            Students who expressed interest in joining this project.
          </p>
        </div>
      </div>

      {loading && <p className={styles.muted}>Loading…</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      {actionError && <p className={styles.errorText}>{actionError}</p>}

      {!loading && !error && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Requests</h2>
            <span className={styles.muted}>{interests?.length ?? 0} total</span>
          </div>

          {!interests?.length ? (
            <p className={styles.muted}>No interest requests yet.</p>
          ) : (
            <div className={styles.projectList}>
              {interests.map((interest) => (
                <div key={interest.id} className={styles.projectRow}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong>{interest.userName}</strong>
                      <span
                        style={{
                          fontSize: 12,
                          color: STATUS_COLORS[interest.status] ?? 'var(--text-soft)',
                          fontWeight: 600,
                        }}
                      >
                        {interest.status}
                      </span>
                    </div>
                    {interest.message && (
                      <p className={styles.muted} style={{ marginTop: 4, fontSize: 13 }}>
                        {interest.message}
                      </p>
                    )}
                    <p className={styles.muted} style={{ fontSize: 12, marginTop: 4 }}>
                      {new Date(interest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {interest.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className={styles.btnPrimary}
                        style={{ fontSize: 13, padding: '6px 14px' }}
                        disabled={updating === interest.id}
                        onClick={() => void handleAction(interest.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className={styles.backLink}
                        style={{ fontSize: 13 }}
                        disabled={updating === interest.id}
                        onClick={() => void handleAction(interest.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
