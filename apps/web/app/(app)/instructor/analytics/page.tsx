'use client';

import { useState } from 'react';
import styles from './page.module.css';
import EmptyState from '../../_components/widgets/EmptyState';

type Range = '7d' | '30d' | '90d' | 'term';

export default function AnalyticsOverviewPage() {
  const [range, setRange] = useState<Range>('30d');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics Overview</h1>
          <p className={styles.subtitle}>
            Aggregate signal across courses — submissions, pass rate, and rising topics.
          </p>
        </div>
        <div className={styles.rangePicker} role="tablist" aria-label="Date range">
          {(['7d', '30d', '90d', 'term'] as const).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={range === r}
              className={`${styles.rangeChip} ${range === r ? styles.rangeChipActive : ''}`}
              onClick={() => setRange(r)}
            >
              {r === 'term' ? 'Term' : r.replace('d', ' days')}
            </button>
          ))}
        </div>
      </header>
      <EmptyState
        title="Analytics not loaded"
        description="The analytics service hasn't returned data yet."
      />
    </div>
  );
}
