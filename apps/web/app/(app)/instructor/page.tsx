'use client';

import Link from 'next/link';
import { useFetch } from '../../lib/use-fetch';
import styles from './instructor.module.css';

type Course = {
  id: string;
  slug: string;
  title: string;
  termLabel: string;
  courseCode: string;
  isActive: boolean;
};

function QuickStartStep({
  number,
  title,
  desc,
  href,
  linkLabel,
}: {
  number: string;
  title: string;
  desc: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className={styles.quickStep}>
      <div className={styles.quickStepNumber}>{number}</div>
      <div className={styles.quickStepContent}>
        <strong>{title}</strong>
        <p>{desc}</p>
        <Link href={href} className={styles.quickStepLink}>
          {linkLabel} →
        </Link>
      </div>
    </div>
  );
}

export default function InstructorPage() {
  const { data: courses, loading, error } = useFetch<Course[]>('/v1/tracking/courses');

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Instructor</h1>
          <p className={styles.subtitle}>Manage your courses and review student submissions.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/instructor/onboarding" className={styles.btnSecondary}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <rect
                x="1"
                y="3"
                width="13"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M4 7h7M4 10h5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <path d="M1 6h13" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            CLI Setup Guide
          </Link>
          <Link href="/instructor/courses/new" className={styles.btnPrimary}>
            + New Course
          </Link>
        </div>
      </div>

      {loading && (
        <div className={styles.courseGrid}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.courseCardSkeleton}>
              <div
                className="skeletonLine"
                style={{ width: '40%', height: 12, marginBottom: 10 }}
              />
              <div className="skeletonLine" style={{ width: '75%', height: 16, marginBottom: 8 }} />
              <div className="skeletonLine" style={{ width: '55%', height: 12 }} />
            </div>
          ))}
        </div>
      )}

      {error && <p className={styles.errorText}>{error}</p>}

      {/* Empty state: rich quick-start */}
      {!loading && !error && (courses ?? []).length === 0 && (
        <div className={styles.emptyStateRich}>
          <div className={styles.emptyStateHeader}>
            <div className={styles.emptyStateIcon}>🎓</div>
            <h2>Create your first course</h2>
            <p>
              Follow these three steps to get your course up and running — web setup, CLI install,
              and your first student submission.
            </p>
          </div>

          <div className={styles.quickSteps}>
            <QuickStartStep
              number="01"
              title="Create a course"
              desc="Define your course code, title, term, and add your first project milestone."
              href="/instructor/courses/new"
              linkLabel="Create course"
            />
            <QuickStartStep
              number="02"
              title="Set up the CLI"
              desc="Install the Nibras CLI, authenticate with GitHub, and bootstrap a project locally."
              href="/instructor/onboarding"
              linkLabel="View CLI guide"
            />
            <QuickStartStep
              number="03"
              title="Invite students"
              desc="Share your course join link. Students install the CLI and start submitting immediately."
              href="/instructor/courses/new"
              linkLabel="Create course first"
            />
          </div>

          <Link
            href="/instructor/courses/new"
            className={styles.btnPrimary}
            style={{ alignSelf: 'center', marginTop: 8 }}
          >
            Get started — create a course
          </Link>
        </div>
      )}

      {/* Course grid */}
      {(courses ?? []).length > 0 && (
        <div className={styles.courseGrid}>
          {(courses ?? []).map((course) => (
            <Link
              key={course.id}
              href={`/instructor/courses/${course.id}`}
              className={styles.courseCard}
            >
              <div className={styles.courseCardTop}>
                <span className={styles.courseCode}>{course.courseCode}</span>
                <span
                  className={`${styles.courseBadge} ${course.isActive ? styles.courseBadgeActive : styles.courseBadgeArchived}`}
                >
                  {course.isActive ? 'Active' : 'Archived'}
                </span>
              </div>
              <strong className={styles.courseTitle}>{course.title}</strong>
              <span className={styles.muted}>{course.termLabel}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
