'use client';

import styles from './page.module.css';
import EmptyState from '../../../_components/widgets/EmptyState';

export default function CoursesAnalyticsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Course Analytics</h1>
        <p className={styles.subtitle}>
          Per-course completion, average grade, and pass rate.
        </p>
      </header>
      <EmptyState
        title="No data"
        description="Course analytics haven't loaded yet."
      />
    </div>
  );
}
