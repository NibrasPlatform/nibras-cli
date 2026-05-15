'use client';

import { useState } from 'react';
import styles from './page.module.css';
import EmptyState from '../../_components/widgets/EmptyState';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'all' | 'month' | 'week' | 'today'>('week');
  const [scope, setScope] = useState<'global' | 'course' | 'cohort'>('global');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Leaderboard</h1>
          <p className={styles.subtitle}>See where you stand against the community.</p>
        </div>
        <div className={styles.filters}>
          <div role="tablist" aria-label="Period" className={styles.tabGroup}>
            {(['today', 'week', 'month', 'all'] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={period === p}
                className={`${styles.tab} ${period === p ? styles.tabActive : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p === 'all' ? 'All-time' : p[0].toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className={styles.scopePicker}>
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value as typeof scope)}
              className={styles.select}
              aria-label="Scope"
            >
              <option value="global">Global</option>
              <option value="course">My course</option>
              <option value="cohort">My cohort</option>
            </select>
          </div>
        </div>
      </header>
      <EmptyState
        title="Leaderboard unavailable"
        description="The leaderboard service hasn't returned data yet."
      />
    </div>
  );
}
