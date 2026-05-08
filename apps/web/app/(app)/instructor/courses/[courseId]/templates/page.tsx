'use client';

import Link from 'next/link';
import { use } from 'react';
import { useFetch } from '../../../../../lib/use-fetch';
import styles from '../../../instructor.module.css';

type Template = {
  id: string;
  title: string;
  description: string;
  status: string;
  deliveryMode: string;
  teamSize: number | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  tags: string[];
  estimatedDuration: string | null;
  roles: Array<{ id: string }>;
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'var(--success)',
  intermediate: 'var(--warning, #f59e0b)',
  advanced: 'var(--error, #ef4444)',
};

export default function CourseTemplatesPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const {
    data: templates,
    loading,
    error,
  } = useFetch<Template[]>(`/v1/tracking/courses/${courseId}/templates`);

  return (
    <div className={styles.page}>
      <div className={styles.detailHeader}>
        <div>
          <p className={styles.breadcrumb}>
            <Link href="/instructor">Instructor</Link> /{' '}
            <Link href={`/instructor/courses/${courseId}`}>Course</Link> / Templates
          </p>
          <h1>Project Templates</h1>
          <p className={styles.subtitle}>
            Reusable project blueprints that carry team size, role structure, and repeatable setup
            into future project launches.
          </p>
        </div>
        <Link href={`/instructor/courses/${courseId}/templates/new`} className={styles.btnPrimary}>
          + New Template
        </Link>
      </div>

      {loading && <p className={styles.muted}>Loading…</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {!loading && !error && (
        <>
          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Templates</span>
              <strong>{templates?.length ?? 0}</strong>
              <p>Reusable blueprints in this course</p>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Team-ready</span>
              <strong>{(templates ?? []).filter((template) => template.deliveryMode === 'team').length}</strong>
              <p>Include team size or role configuration</p>
            </article>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Templates</h2>
              <span className={styles.muted}>{templates?.length ?? 0} total</span>
            </div>
            {!templates?.length ? (
              <p className={styles.muted}>No templates created for this course yet.</p>
            ) : (
              <div className={styles.projectList}>
                {templates.map((template) => (
                  <div key={template.id} className={`${styles.projectRow} ${styles.templateRow}`}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span className={styles.statusBadge}>{template.status}</span>
                        {template.difficulty && (
                          <span
                            className={styles.statusBadge}
                            style={{
                              background: DIFFICULTY_COLORS[template.difficulty] ?? 'var(--surface-muted)',
                              color: '#fff',
                            }}
                          >
                            {template.difficulty}
                          </span>
                        )}
                        {template.estimatedDuration && (
                          <span className={styles.muted} style={{ fontSize: 12 }}>
                            ⏱ {template.estimatedDuration}
                          </span>
                        )}
                      </div>
                      <strong style={{ display: 'block', marginTop: 8 }}>{template.title}</strong>
                      {template.description && (
                        <p className={styles.muted} style={{ marginTop: 2, fontSize: 13 }}>
                          {template.description.length > 80
                            ? `${template.description.slice(0, 80)}…`
                            : template.description}
                        </p>
                      )}
                      <p className={styles.muted}>
                        {template.deliveryMode === 'team'
                          ? `${template.teamSize ?? '?'} students · ${template.roles.length} roles`
                          : 'Individual blueprint'}
                      </p>
                      {(template.tags ?? []).length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                          {template.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 99,
                                background: 'var(--surface-strong)',
                                color: 'var(--text-soft)',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <span className={styles.muted}>
                        {template.deliveryMode === 'team' ? 'Team template' : 'Individual template'}
                      </span>
                      <Link
                        href={`/instructor/courses/${courseId}/templates/${template.id}/edit`}
                        className={styles.backLink}
                        style={{ fontSize: 13 }}
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
