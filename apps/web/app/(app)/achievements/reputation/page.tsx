'use client';

import styles from './page.module.css';
import EmptyState from '../../_components/widgets/EmptyState';

export default function ReputationPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Reputation</h1>
        <p className={styles.subtitle}>
          Your reputation grows as you submit projects, help peers in the community, and earn badges.
        </p>
      </header>
      <EmptyState
        title="No reputation data yet"
        description="Once your account starts accruing points, you'll see the breakdown here."
      />
    </div>
  );
}
