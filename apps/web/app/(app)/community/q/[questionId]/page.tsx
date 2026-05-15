'use client';

import { useParams } from 'next/navigation';
import styles from './page.module.css';
import EmptyState from '../../../_components/widgets/EmptyState';

export default function QuestionPage() {
  const params = useParams<{ questionId: string }>();
  const questionId = params?.questionId;

  return (
    <div className={styles.page}>
      <header className={styles.breadcrumb}>
        <a href="/community">← Back to community</a>
      </header>
      <div className={styles.placeholder}>
        <EmptyState
          title={`Question ${questionId ?? ''}`}
          description="The question hasn't been loaded yet."
        />
      </div>
    </div>
  );
}
