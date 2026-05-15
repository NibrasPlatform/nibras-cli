'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import EmptyState from '../../../_components/widgets/EmptyState';

export default function ThreadPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = params?.threadId;

  return (
    <div className={styles.page}>
      <header className={styles.breadcrumb}>
        <Link href="/community/discussions">← Back to discussions</Link>
      </header>
      <EmptyState
        title={`Thread ${threadId ?? ''}`}
        description="The thread hasn't been loaded yet."
      />
    </div>
  );
}
