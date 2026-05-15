'use client';

import { useState } from 'react';
import styles from './page.module.css';
import EmptyState from '../../_components/widgets/EmptyState';

type Host = 'all' | 'codeforces' | 'leetcode' | 'atcoder';

export default function RankingPage() {
  const [host, setHost] = useState<Host>('all');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Ranking</h1>
          <p className={styles.subtitle}>
            How you rank against the cohort across linked competitive platforms.
          </p>
        </div>
        <div className={styles.hostPicker} role="tablist" aria-label="Host">
          {(['all', 'codeforces', 'leetcode', 'atcoder'] as const).map((h) => (
            <button
              key={h}
              type="button"
              role="tab"
              aria-selected={host === h}
              className={`${styles.hostChip} ${host === h ? styles.hostChipActive : ''}`}
              onClick={() => setHost(h)}
            >
              {h === 'all' ? 'All' : h[0].toUpperCase() + h.slice(1)}
            </button>
          ))}
        </div>
      </header>
      <EmptyState title="No ranking data" description="Linked accounts will populate the leaderboard here." />
    </div>
  );
}
