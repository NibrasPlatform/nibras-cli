'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useFetch } from '../../../lib/use-fetch';
import styles from '../../instructor/instructor.module.css';

type AuditLog = {
  id: string;
  userId: string | null;
  courseId: string | null;
  projectId: string | null;
  milestoneId: string | null;
  submissionAttemptId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  payload: unknown;
  createdAt: string;
};

type AuditLogsResponse = {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AuditLogsPage() {
  const [action, setAction] = useState('');
  const [targetType, setTargetType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 50;

  // Build query string from current filters
  const queryParts: string[] = [`limit=${limit}`, `offset=${offset}`];
  if (action.trim()) queryParts.push(`action=${encodeURIComponent(action.trim())}`);
  if (targetType) queryParts.push(`targetType=${encodeURIComponent(targetType)}`);
  if (fromDate) queryParts.push(`fromDate=${encodeURIComponent(fromDate)}`);
  if (toDate) queryParts.push(`toDate=${encodeURIComponent(toDate)}`);

  const { data, loading, error } = useFetch<AuditLogsResponse>(
    `/v1/admin/audit-logs?${queryParts.join('&')}`
  );

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;

  function applyFilters() {
    setOffset(0);
  }

  const TARGET_TYPES = [
    '',
    'course',
    'project',
    'milestone',
    'submission',
    'user',
    'invite',
    'review',
    'team',
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.breadcrumb}>
            <Link href="/admin">Admin</Link> / Audit Logs
          </p>
          <h1>Audit Logs</h1>
          <p className={styles.subtitle}>System-wide action history.</p>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div className={styles.panel} style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <div className={styles.formGroup}>
            <label>Action</label>
            <input
              type="text"
              placeholder="e.g. course.created"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Target Type</label>
            <select value={targetType} onChange={(e) => setTargetType(e.target.value)}>
              {TARGET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t || 'All types'}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>

          <button type="button" className={styles.btnPrimary} onClick={applyFilters}>
            Apply
          </button>
        </div>
      </div>

      {loading && <p className={styles.muted}>Loading audit logs…</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {!loading && !error && (
        <>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Results</h2>
              <span className={styles.muted}>{total} total entries</span>
            </div>

            {logs.length === 0 ? (
              <p className={styles.muted}>No audit log entries found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.submissionTable}>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Target Type</th>
                      <th>Target ID</th>
                      <th>User ID</th>
                      <th>Course ID</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <code style={{ fontSize: 12 }}>{log.action}</code>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            {log.targetType}
                          </span>
                        </td>
                        <td>
                          <code style={{ fontSize: 11, opacity: 0.7 }}>
                            {log.targetId.slice(0, 12)}…
                          </code>
                        </td>
                        <td>
                          <code style={{ fontSize: 11, opacity: 0.7 }}>
                            {log.userId ? `${log.userId.slice(0, 8)}…` : '—'}
                          </code>
                        </td>
                        <td>
                          <code style={{ fontSize: 11, opacity: 0.7 }}>
                            {log.courseId ? `${log.courseId.slice(0, 8)}…` : '—'}
                          </code>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                          {formatDate(log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Pagination ──────────────────────────────────────────── */}
          {(hasPrev || hasNext) && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
              <button
                type="button"
                className={styles.btnSecondary}
                disabled={!hasPrev}
                onClick={() => setOffset(Math.max(0, offset - limit))}
              >
                ← Previous
              </button>
              <span className={styles.muted} style={{ fontSize: 13 }}>
                {offset + 1}–{Math.min(offset + limit, total)} of {total}
              </span>
              <button
                type="button"
                className={styles.btnSecondary}
                disabled={!hasNext}
                onClick={() => setOffset(offset + limit)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
