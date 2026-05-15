'use client';

import { useState } from 'react';
import styles from './page.module.css';
import EmptyState from '../_components/widgets/EmptyState';

export default function AchievementsPage() {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton} aria-hidden="true">
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <EmptyState
          title="Couldn't load achievements"
          description={error}
          tone="error"
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Achievements</h1>
          <p className={styles.subtitle}>Track the badges you've earned and the ones still ahead.</p>
        </div>
      </header>
      <EmptyState
        title="No badges yet"
        description="Complete projects, submit milestones, and contribute to the community to start unlocking badges."
      />
    </div>
  );
}
