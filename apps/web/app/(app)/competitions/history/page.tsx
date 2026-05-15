'use client';

import styles from './page.module.css';
import EmptyState from '../../_components/widgets/EmptyState';

export default function HistoryPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Contest History</h1>
        <p className={styles.subtitle}>
          Your past contest performance — rank, rating delta, and trend.
        </p>
      </header>
      <EmptyState title="No history yet" description="Participate in a contest to see your history here." />
    </div>
  );
}
