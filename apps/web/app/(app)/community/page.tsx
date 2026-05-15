'use client';

import styles from './page.module.css';
import EmptyState from '../_components/widgets/EmptyState';

export default function CommunityPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Community</h1>
          <p className={styles.subtitle}>Ask, answer, and learn from your classmates.</p>
        </div>
        <button type="button" className={styles.askBtn} disabled>
          Ask a question
        </button>
      </header>
      <EmptyState
        title="No questions yet"
        description="When peers post questions, they'll appear here."
      />
    </div>
  );
}
