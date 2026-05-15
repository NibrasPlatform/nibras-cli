'use client';

import styles from './page.module.css';
import EmptyState from '../../../_components/widgets/EmptyState';

export default function EngagementPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Engagement</h1>
        <p className={styles.subtitle}>
          Time spent on the platform broken down by day of week and course.
        </p>
      </header>
      <EmptyState title="No engagement data" description="The signal will appear once students log activity." />
    </div>
  );
}
