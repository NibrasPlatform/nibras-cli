'use client';

import { useState } from 'react';
import styles from './page.module.css';
import EmptyState from '../../_components/widgets/EmptyState';

export default function PracticePage() {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Practice</h1>
        <p className={styles.subtitle}>
          Browse problems from Codeforces, LeetCode, and others. Filter by tag and difficulty.
        </p>
      </header>
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search problems"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
      </div>
      <div className={styles.tagsRow}>
        {['dp', 'graphs', 'greedy', 'math', 'strings', 'two-pointers'].map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.tagChip} ${tag === t ? styles.tagChipActive : ''}`}
            onClick={() => setTag(tag === t ? null : t)}
          >
            {t}
          </button>
        ))}
      </div>
      <EmptyState title="No problems loaded" description="Practice problems will appear once they're fetched." />
    </div>
  );
}
