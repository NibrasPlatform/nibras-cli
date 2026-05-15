'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import EmptyState from '../../../_components/widgets/EmptyState';

export default function CourseVideosPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId ?? '';

  return (
    <div className={styles.page}>
      <header className={styles.breadcrumb}>
        <Link href={`/catalog/${courseId}`}>← Back to course</Link>
      </header>
      <h1 className={styles.title}>Videos</h1>
      <EmptyState title="No videos" description="Lecture videos will appear here." />
    </div>
  );
}
