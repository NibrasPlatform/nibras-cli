'use client';

import styles from './page.module.css';
import EmptyState from '../../_components/widgets/EmptyState';

export default function SmartRoutingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Smart Routing</h1>
        <p className={styles.subtitle}>
          The tutor maps your goal to the right material, picking the shortest path through prerequisites.
        </p>
      </header>
      <EmptyState
        title="No route computed"
        description="Describe a goal below and the tutor will plan a path through topics and exercises."
      />
    </div>
  );
}
