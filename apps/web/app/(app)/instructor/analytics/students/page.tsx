'use client';

import { useState } from 'react';
import styles from './page.module.css';
import EmptyState from '../../../_components/widgets/EmptyState';

type RiskLevel = 'low' | 'medium' | 'high';

export default function StudentsAnalyticsPage() {
  const [risk, setRisk] = useState<RiskLevel | 'all'>('all');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Students</h1>
          <p className={styles.subtitle}>
            Per-student engagement, grades, and risk classification.
          </p>
        </div>
        <div className={styles.riskFilter} role="tablist" aria-label="Risk filter">
          {(['all', 'low', 'medium', 'high'] as const).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={risk === r}
              className={`${styles.riskChip} ${risk === r ? styles.riskChipActive : ''}`}
              onClick={() => setRisk(r)}
            >
              {r === 'all' ? 'All' : r[0].toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </header>
      <EmptyState title="No student data" description="Student analytics haven't loaded yet." />
    </div>
  );
}
