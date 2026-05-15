'use client';

import styles from './page.module.css';
import EmptyState from '../_components/widgets/EmptyState';

export default function CompetitionsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Competitions</h1>
          <p className={styles.subtitle}>
            Upcoming contests, linked accounts, and quick access to your competitive history.
          </p>
        </div>
        <button type="button" className={styles.linkBtn} disabled>
          Link account
        </button>
      </header>
      <EmptyState
        title="No upcoming contests"
        description="Linked accounts will surface upcoming Codeforces, LeetCode, and AtCoder rounds here."
      />
    </div>
  );
}
