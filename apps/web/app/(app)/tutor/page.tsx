'use client';

import styles from './page.module.css';
import EmptyState from '../_components/widgets/EmptyState';

export default function TutorPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>AI Tutor</h1>
          <p className={styles.subtitle}>
            Ask any question about your courses, projects, or concepts you're stuck on.
          </p>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sectionLabel}>Conversations</h2>
          <EmptyState
            title="No history yet"
            description="Your past tutor conversations will appear here."
          />
        </aside>
        <div className={styles.main}>
          <EmptyState
            title="Tutor is offline"
            description="The chatbot service hasn't loaded yet."
          />
        </div>
      </div>
    </div>
  );
}
