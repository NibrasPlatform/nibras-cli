'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import EmptyState from '../../../../_components/widgets/EmptyState';

export default function AssignmentDetailPage() {
  const params = useParams<{ courseId: string; assignmentId: string }>();
  const courseId = params?.courseId ?? '';

  return (
    <div className={styles.page}>
      <header className={styles.breadcrumb}>
        <Link href={`/catalog/${courseId}/assignments`}>← Back to assignments</Link>
      </header>
      <EmptyState title="Assignment not loaded" description="Details will appear once they're fetched." />
    </div>
  );
}
