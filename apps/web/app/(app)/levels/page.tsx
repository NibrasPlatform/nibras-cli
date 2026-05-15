'use client';

import styles from './page.module.css';
import EmptyState from '../_components/widgets/EmptyState';

const LEVELS = [
  { tier: 1, label: 'Beginner', threshold: 0, color: '#94a3b8' },
  { tier: 2, label: 'Apprentice', threshold: 250, color: '#22c55e' },
  { tier: 3, label: 'Practitioner', threshold: 750, color: '#38bdf8' },
  { tier: 4, label: 'Specialist', threshold: 1500, color: '#a78bfa' },
  { tier: 5, label: 'Expert', threshold: 3000, color: '#f59e0b' },
  { tier: 6, label: 'Master', threshold: 6000, color: '#ef4444' },
];

export default function LevelsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Levels</h1>
        <p className={styles.subtitle}>
          Climb through tiers by earning reputation, completing milestones, and helping peers.
        </p>
      </header>

      <div className={styles.summaryCard}>
        <EmptyState
          title="Level data not loaded"
          description="Sign in and wait for the platform to compute your tier."
        />
      </div>

      <section className={styles.tiers}>
        <h2 className={styles.sectionTitle}>All tiers</h2>
        <ul className={styles.tierList}>
          {LEVELS.map((tier) => (
            <li key={tier.tier} className={styles.tierRow}>
              <span className={styles.tierBadge} style={{ background: tier.color }}>
                {tier.tier}
              </span>
              <div className={styles.tierBody}>
                <strong>{tier.label}</strong>
                <span>{tier.threshold.toLocaleString()} points</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
