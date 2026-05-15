'use client';

import { useState } from 'react';
import styles from './page.module.css';
import EmptyState from '../../_components/widgets/EmptyState';

export default function RecommendationsPage() {
  const [refreshing] = useState(false);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Recommendations</h1>
          <p className={styles.subtitle}>
            Track and specialization suggestions based on your grade sheet, refreshed on demand.
          </p>
        </div>
        <button type="button" className={styles.refreshBtn} disabled>
          {refreshing ? 'Refreshing…' : 'Refresh sheet'}
        </button>
      </header>
      <EmptyState
        title="No recommendation yet"
        description="Click Refresh sheet to pull your latest grades and compute recommendations."
      />
    </div>
  );
}
