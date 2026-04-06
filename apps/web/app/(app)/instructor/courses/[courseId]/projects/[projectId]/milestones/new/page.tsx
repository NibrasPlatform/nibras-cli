'use client';

import { type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useFormSubmit } from '../../../../../../../../lib/use-form-submit';
import styles from '../../../../../../instructor.module.css';

export default function NewMilestonePage({
  params,
}: {
  params: Promise<{ courseId: string; projectId: string }>;
}) {
  const { courseId, projectId } = use(params);
  const router = useRouter();
  const { submitting, error, submit } = useFormSubmit({
    url: `/v1/tracking/projects/${projectId}/milestones`,
    onSuccess: () => router.push(`/instructor/courses/${courseId}/projects/${projectId}`),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const dueAtRaw = form.get('dueAt') as string;
    void submit({
      title: (form.get('title') as string).trim(),
      description: (form.get('description') as string).trim(),
      order: parseInt(form.get('order') as string, 10) || 1,
      dueAt: dueAtRaw ? new Date(dueAtRaw).toISOString() : null,
      isFinal: form.get('isFinal') === 'on',
    });
  }

  return (
    <div className={styles.formPage}>
      <div>
        <p className={styles.breadcrumb}>
          <Link href="/instructor">Instructor</Link> /{' '}
          <Link href={`/instructor/courses/${courseId}`}>Course</Link> /{' '}
          <Link href={`/instructor/courses/${courseId}/projects/${projectId}`}>Project</Link> / New
          Milestone
        </p>
        <h1>Add Milestone</h1>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className={styles.formSection}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" required placeholder="e.g. Checkpoint 1" />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="What students need to submit for this milestone."
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="order">Order</label>
          <input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={1}
            style={{ width: 100 }}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dueAt">Due Date</label>
          <input id="dueAt" name="dueAt" type="datetime-local" />
        </div>

        <div className={styles.formGroup}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input name="isFinal" type="checkbox" />
            Final milestone (marks project completion)
          </label>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Milestone'}
          </button>
          <Link
            href={`/instructor/courses/${courseId}/projects/${projectId}`}
            className={styles.backLink}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
