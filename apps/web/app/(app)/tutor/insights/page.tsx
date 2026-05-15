'use client';

import styles from './page.module.css';
import EmptyState from '../../_components/widgets/EmptyState';

export default function LearningInsightsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Learning Insights</h1>
        <p className={styles.subtitle}>
          Personalized summaries of where you're strong, where you're struggling, and what to study next.
        </p>
      </header>
      <EmptyState
        title="No insights yet"
        description="Spend some time on the platform and the tutor will summarize your activity here."
      />
    </div>
  );
}
