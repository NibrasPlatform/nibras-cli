'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import type {
  DashboardHomeResponse,
  InstructorHomeDashboard,
  StudentHomeDashboard,
} from '@nibras/contracts';
import { apiFetch } from '../../lib/session';
import { formatHoursMinutes } from '../../lib/utils';
import { loadDashboardData } from './load-dashboard-data';
import styles from './page.module.css';

function formatAgeLabel(value: string | null | undefined): string {
  if (!value) return '—';
  const minutes = Math.max(0, Math.ceil((Date.now() - new Date(value).getTime()) / 60_000));
  return `${formatHoursMinutes(minutes)} ago`;
}

function formatDueLabel(value: string | null | undefined): string {
  if (!value) return 'No due date';
  const minutes = Math.round((new Date(value).getTime() - Date.now()) / 60_000);
  if (minutes < 0) return `Overdue by ${formatHoursMinutes(minutes)}`;
  if (minutes === 0) return 'Due now';
  return `Due in ${formatHoursMinutes(minutes)}`;
}

function toneClass(status: string): string {
  if (status === 'approved' || status === 'graded' || status === 'passed')
    return styles.toneSuccess;
  if (status === 'failed' || status === 'changes_requested') return styles.toneDanger;
  if (status === 'needs_review' || status === 'submitted') return styles.toneWarning;
  return styles.toneNeutral;
}

function Skeleton() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.skeletonLine} style={{ width: '18%', height: 12 }} />
        <div className={styles.skeletonLine} style={{ width: '42%', height: 40 }} />
        <div className={styles.skeletonLine} style={{ width: '54%', height: 16 }} />
      </section>
      <section className={styles.panel}>
        <div className={styles.skeletonLine} style={{ width: '24%', height: 18 }} />
        <div className={styles.cardGrid}>
          {[1, 2, 3].map((key) => (
            <div key={key} className={styles.skeletonCard}>
              <div className={styles.skeletonLine} style={{ width: '55%', height: 12 }} />
              <div className={styles.skeletonLine} style={{ width: '88%', height: 22 }} />
              <div className={styles.skeletonLine} style={{ width: '72%', height: 12 }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptyState({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className={styles.emptyState}>
      <h3>{title}</h3>
      <p>{body}</p>
      {href && label ? (
        <Link href={href} className={styles.primaryButton}>
          {label}
        </Link>
      ) : null}
    </div>
  );
}

function SectionHeader({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionCopy}>{copy}</p>
      </div>
      {action}
    </div>
  );
}

function StudentView({
  dashboard,
  selectedCourseId,
  onSelectCourse,
}: {
  dashboard: StudentHomeDashboard;
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string) => void;
}) {
  const currentSnapshot =
    dashboard.courseSnapshots.find((entry) => entry.courseId === selectedCourseId) ||
    dashboard.courseSnapshots[0] ||
    null;

  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <SectionHeader
          title="Needs Attention"
          copy="The three most useful things to act on right now."
        />
        {dashboard.attentionItems.length === 0 ? (
          <EmptyState
            title="Nothing urgent right now"
            body="You do not have overdue work, failed submissions, or pending changes that need action."
            href="/projects"
            label="Open Projects"
          />
        ) : (
          <div className={styles.cardGrid}>
            {dashboard.attentionItems.map((item) => (
              <article key={item.id} className={styles.attentionCard}>
                <div className={styles.cardTop}>
                  <span className={`${styles.pill} ${toneClass(item.kind)}`}>
                    {item.statusText}
                  </span>
                  <span className={styles.mutedTiny}>{item.courseTitle}</span>
                </div>
                <h3>{item.projectTitle}</h3>
                <p className={styles.cardMeta}>
                  {item.milestoneTitle ? `${item.milestoneTitle} · ` : ''}
                  {item.reason}
                </p>
                <div className={styles.cardFoot}>
                  <span className={styles.mutedTiny}>
                    {item.reviewedAt
                      ? `Reviewed ${formatAgeLabel(item.reviewedAt)}`
                      : item.submittedAt
                        ? `Submitted ${formatAgeLabel(item.submittedAt)}`
                        : formatDueLabel(item.dueAt)}
                  </span>
                  <Link href={item.cta.href} className={styles.inlineLink}>
                    {item.cta.label} →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <SectionHeader
          title="Current Course Snapshot"
          copy="See progress, upcoming milestones, and where to continue."
          action={
            dashboard.courses.length > 1 ? (
              <div className={styles.switchRow}>
                {dashboard.courses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    className={`${styles.switchButton} ${
                      course.id === selectedCourseId ? styles.switchButtonActive : ''
                    }`}
                    onClick={() => onSelectCourse(course.id)}
                  >
                    {course.courseCode}
                  </button>
                ))}
              </div>
            ) : null
          }
        />
        {!currentSnapshot ? (
          <EmptyState
            title="No student course data yet"
            body="Join a course or wait for your instructor to publish work."
          />
        ) : (
          <div className={styles.snapshotLayout}>
            <div className={styles.metricGrid}>
              <div className={styles.metricCard}>
                <span>Completion</span>
                <strong>{currentSnapshot.completion}%</strong>
              </div>
              <div className={styles.metricCard}>
                <span>Approved</span>
                <strong>{currentSnapshot.approved}</strong>
              </div>
              <div className={styles.metricCard}>
                <span>In Review</span>
                <strong>{currentSnapshot.underReview}</strong>
              </div>
              <div className={styles.metricCard}>
                <span>Open</span>
                <strong>{currentSnapshot.open}</strong>
              </div>
            </div>

            <div className={styles.snapshotGrid}>
              <div className={styles.subpanel}>
                <h3>Next Milestones</h3>
                {currentSnapshot.nextMilestones.length === 0 ? (
                  <p className={styles.subtle}>Nothing upcoming in this course right now.</p>
                ) : (
                  <div className={styles.list}>
                    {currentSnapshot.nextMilestones.map((milestone) => (
                      <div key={milestone.milestoneId} className={styles.listRow}>
                        <div>
                          <strong>{milestone.title}</strong>
                          <p>
                            {milestone.projectTitle} · {formatDueLabel(milestone.dueAt)}
                          </p>
                        </div>
                        <span className={`${styles.pill} ${toneClass(milestone.status)}`}>
                          {milestone.statusLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.subpanel}>
                <h3>Projects</h3>
                {currentSnapshot.projects.length === 0 ? (
                  <p className={styles.subtle}>No published projects in this course yet.</p>
                ) : (
                  <div className={styles.projectList}>
                    {currentSnapshot.projects.map((project) => (
                      <div key={project.projectId} className={styles.projectRow}>
                        <div className={styles.projectInfo}>
                          <div className={styles.projectHeader}>
                            <strong>{project.title}</strong>
                            <span className={styles.mutedTiny}>{project.completion}% complete</span>
                          </div>
                          <div className={styles.progressTrack}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${project.completion}%` }}
                            />
                          </div>
                          <p className={styles.subtle}>
                            {project.nextMilestoneTitle
                              ? `Next: ${project.nextMilestoneTitle}`
                              : 'No upcoming milestone'}{' '}
                            · {project.approved} approved · {project.underReview} in review ·{' '}
                            {project.open} open
                          </p>
                        </div>
                        <Link href={project.href} className={styles.inlineLink}>
                          Open →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <SectionHeader
          title="Submission Health"
          copy="A compact summary of checks, review state, and your latest work."
          action={
            <Link href="/submissions" className={styles.inlineLink}>
              All submissions →
            </Link>
          }
        />
        <div className={styles.metricGrid}>
          <div className={styles.metricCard}>
            <span>Failed Checks</span>
            <strong>{dashboard.submissionHealth.failedChecks}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>Needs Review</span>
            <strong>{dashboard.submissionHealth.needsReview}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>Awaiting Grader</span>
            <strong>{dashboard.submissionHealth.awaitingReview}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>Recently Passed</span>
            <strong>{dashboard.submissionHealth.recentlyPassed}</strong>
          </div>
        </div>
        {dashboard.recentSubmissions.length === 0 ? (
          <EmptyState
            title="No submissions yet"
            body="Submit your first milestone from the Projects page to start tracking progress here."
            href="/projects"
            label="Open Projects"
          />
        ) : (
          <div className={styles.table}>
            {dashboard.recentSubmissions.map((submission) => (
              <Link key={submission.id} href={submission.href} className={styles.tableRow}>
                <div>
                  <strong>{submission.projectTitle}</strong>
                  <p>
                    {submission.milestoneTitle ? `${submission.milestoneTitle} · ` : ''}
                    {submission.statusLabel}
                  </p>
                </div>
                <span className={styles.mutedTiny}>
                  {formatAgeLabel(submission.submittedAt || submission.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {dashboard.blockers.length > 0 ? (
        <section className={styles.panel}>
          <SectionHeader
            title="Setup / Blocking Issues"
            copy="Only the blockers that can prevent submissions or useful progress are shown."
          />
          <div className={styles.cardGrid}>
            {dashboard.blockers.map((blocker) => (
              <article key={blocker.id} className={styles.blockerCard}>
                <h3>{blocker.title}</h3>
                <p>{blocker.body}</p>
                <Link href={blocker.cta.href} className={styles.inlineLink}>
                  {blocker.cta.label} →
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function InstructorView({ dashboard }: { dashboard: InstructorHomeDashboard }) {
  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <SectionHeader
          title="Review Now"
          copy="Triage the queue first, then drill into the course with the highest pressure."
          action={
            <Link href="/instructor" className={styles.inlineLink}>
              Instructor home →
            </Link>
          }
        />
        <div className={styles.metricGrid}>
          <div className={styles.metricCard}>
            <span>Awaiting Review</span>
            <strong>{dashboard.reviewSummary.totalAwaitingReview}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>Oldest Waiting</span>
            <strong>
              {dashboard.reviewSummary.oldestWaitingMinutes === null
                ? '—'
                : formatHoursMinutes(dashboard.reviewSummary.oldestWaitingMinutes)}
            </strong>
          </div>
          <div className={styles.metricCard}>
            <span>Submitted 24h</span>
            <strong>{dashboard.reviewSummary.submittedLast24Hours}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>Courses With Queue</span>
            <strong>{dashboard.reviewSummary.byCourse.length}</strong>
          </div>
        </div>
        {dashboard.urgentQueue.length === 0 ? (
          <EmptyState
            title="No reviews waiting"
            body="Your review queue is clear. Use the course sections below for the next best actions."
          />
        ) : (
          <div className={styles.table}>
            {dashboard.urgentQueue.map((item) => (
              <div key={item.submissionId} className={styles.tableRowStatic}>
                <div>
                  <strong>{item.projectTitle}</strong>
                  <p>
                    {item.studentName} · {item.courseTitle}
                  </p>
                </div>
                <div className={styles.rowMeta}>
                  <span className={styles.mutedTiny}>{formatAgeLabel(item.submittedAt)}</span>
                  <Link href={item.cta.href} className={styles.inlineLink}>
                    {item.cta.label} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <SectionHeader
          title="Courses Needing Attention"
          copy="Courses are ordered by queue urgency first, then by low recent activity."
        />
        {dashboard.courseSummaries.length === 0 ? (
          <EmptyState
            title="No instructor courses yet"
            body="Create your first course to unlock review triage, invites, and course operations."
            href="/instructor/courses/new"
            label="Create Course"
          />
        ) : (
          <div className={styles.courseList}>
            {dashboard.courseSummaries.map((course) => (
              <article key={course.courseId} className={styles.courseRow}>
                <div className={styles.courseMain}>
                  <div>
                    <strong>{course.title}</strong>
                    <p>
                      {course.courseCode} · {course.termLabel}
                    </p>
                  </div>
                  <div className={styles.courseStats}>
                    <span>{course.pendingReviewCount} pending</span>
                    <span>{course.publishedProjectCount} published</span>
                    <span>{course.memberCount} members</span>
                    <span>
                      {course.lastActivityAt
                        ? `Active ${formatAgeLabel(course.lastActivityAt)}`
                        : 'No recent activity'}
                    </span>
                  </div>
                </div>
                <div className={styles.courseActions}>
                  <Link
                    href={`/instructor/courses/${course.courseId}/submissions`}
                    className={styles.actionLink}
                  >
                    Open submissions
                  </Link>
                  <Link
                    href={`/instructor/courses/${course.courseId}/members`}
                    className={styles.actionLink}
                  >
                    Members
                  </Link>
                  <Link
                    href={`/instructor/courses/${course.courseId}`}
                    className={styles.actionLink}
                  >
                    Projects
                  </Link>
                  <Link
                    href={`/instructor/courses/${course.courseId}/members`}
                    className={styles.actionLink}
                  >
                    Invite
                  </Link>
                  <a
                    href={`/v1/tracking/courses/${course.courseId}/export.csv`}
                    className={styles.actionLink}
                  >
                    Export
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <SectionHeader
          title="Operations"
          copy="Fast access to the recurring tasks you reach for most."
        />
        <div className={styles.cardGrid}>
          {dashboard.operations.map((operation) =>
            operation.href.startsWith('/v1/') ? (
              <a key={operation.id} href={operation.href} className={styles.operationCard}>
                <h3>{operation.label}</h3>
                <p>{operation.description}</p>
              </a>
            ) : (
              <Link key={operation.id} href={operation.href} className={styles.operationCard}>
                <h3>{operation.label}</h3>
                <p>{operation.description}</p>
              </Link>
            )
          )}
        </div>
      </section>

      <section className={styles.panel}>
        <SectionHeader
          title="Recent Activity"
          copy="Recent course events for the courses you manage."
        />
        {dashboard.recentActivity.length === 0 ? (
          <EmptyState
            title="No recent activity"
            body="Once students submit work or staff update courses, the latest events will appear here."
          />
        ) : (
          <div className={styles.table}>
            {dashboard.recentActivity.map((entry) =>
              entry.href ? (
                <Link key={entry.id} href={entry.href} className={styles.tableRow}>
                  <div>
                    <strong>{entry.summary}</strong>
                    <p>
                      {entry.courseTitle ? `${entry.courseTitle} · ` : ''}
                      {statusText(entry.action)}
                    </p>
                  </div>
                  <span className={styles.mutedTiny}>{formatAgeLabel(entry.createdAt)}</span>
                </Link>
              ) : (
                <div key={entry.id} className={styles.tableRowStatic}>
                  <div>
                    <strong>{entry.summary}</strong>
                    <p>
                      {entry.courseTitle ? `${entry.courseTitle} · ` : ''}
                      {statusText(entry.action)}
                    </p>
                  </div>
                  <span className={styles.mutedTiny}>{formatAgeLabel(entry.createdAt)}</span>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function statusText(value: string): string {
  return value.replace(/\./g, ' ').replace(/_/g, ' ');
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedMode = searchParams.get('mode');

  const [dashboard, setDashboard] = useState<DashboardHomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMode, setActiveMode] = useState<'student' | 'instructor'>('student');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    void (async () => {
      try {
        const payload = await loadDashboardData({
          mode:
            requestedMode === 'student' || requestedMode === 'instructor' ? requestedMode : null,
          fetchJson: async (path, init) => {
            const response = await apiFetch(path, { ...(init || {}), auth: init?.auth ?? true });
            if (!response.ok) {
              const body = (await response.json().catch(() => ({}))) as { error?: string };
              throw new Error(body.error || `Request failed (${response.status})`);
            }
            return response.json();
          },
        });
        if (!alive) return;
        setDashboard(payload);
        setActiveMode(payload.defaultMode);
        setSelectedCourseId(payload.student?.selectedCourseId ?? null);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [requestedMode]);

  const headerCopy = useMemo(() => {
    if (activeMode === 'instructor') {
      return {
        eyebrow: 'Instructor Home',
        title: 'Review pressure, course health, and fast operations',
        body: 'The dashboard prioritizes queue pressure first, then the courses and actions that most need attention.',
      };
    }
    return {
      eyebrow: 'Student Home',
      title: 'The work, blockers, and submissions that matter now',
      body: 'Open the next milestone, handle failing work quickly, and keep setup problems visible until they are resolved.',
    };
  }, [activeMode]);

  function updateMode(nextMode: 'student' | 'instructor') {
    setActiveMode(nextMode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', nextMode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (loading) return <Skeleton />;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>{headerCopy.eyebrow}</span>
        <h1 className={styles.heroTitle}>{headerCopy.title}</h1>
        <p className={styles.heroBody}>{headerCopy.body}</p>
        {dashboard && dashboard.availableModes.length > 1 ? (
          <div className={styles.switchRow}>
            {dashboard.availableModes.map((mode) => (
              <button
                key={mode}
                type="button"
                className={`${styles.modeToggle} ${activeMode === mode ? styles.modeToggleActive : ''}`}
                onClick={() => updateMode(mode)}
              >
                {mode === 'instructor' ? 'Instructor' : 'Student'}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {error ? (
        <section className={styles.panel}>
          <EmptyState
            title="Dashboard unavailable"
            body={error}
            href={activeMode === 'instructor' ? '/instructor' : '/projects'}
            label={activeMode === 'instructor' ? 'Open Instructor' : 'Open Projects'}
          />
        </section>
      ) : dashboard ? (
        activeMode === 'instructor' && dashboard.instructor ? (
          <InstructorView dashboard={dashboard.instructor} />
        ) : dashboard.student ? (
          <StudentView
            dashboard={dashboard.student}
            selectedCourseId={selectedCourseId}
            onSelectCourse={setSelectedCourseId}
          />
        ) : (
          <section className={styles.panel}>
            <EmptyState
              title="No dashboard data yet"
              body="There is no role-specific dashboard content available for this account yet."
            />
          </section>
        )
      ) : null}
    </div>
  );
}
