'use client';

import styles from './page.module.css';
import EmptyState from '../../_components/widgets/EmptyState';

export default function DiscussionsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Course Discussions</h1>
          <p className={styles.subtitle}>
            Long-form threads scoped to your courses — announcements, study groups, project chatter.
          </p>
        </div>
        <button type="button" className={styles.startBtn} disabled>
          Start a thread
        </button>
      </header>
      <EmptyState
        title="No threads yet"
        description="Threads from your enrolled courses will appear here."
      />
    </div>
  );
}
