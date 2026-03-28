"use client";

import { useEffect, useMemo, useState } from "react";
import type { StudentProjectsDashboardResponse, TrackingMilestone } from "@nibras/contracts";
import { apiFetch } from "../../lib/session";
import styles from "./page.module.css";

type MePayload = {
  user: {
    username: string;
    email: string;
    githubLogin: string;
    githubLinked: boolean;
    githubAppInstalled: boolean;
  };
  apiBaseUrl: string;
};

type InstallUrlPayload = {
  installUrl: string;
};

function formatShortDate(value: string | null): string {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function sortByDueDate(left: TrackingMilestone, right: TrackingMilestone): number {
  if (!left.dueAt && !right.dueAt) return 0;
  if (!left.dueAt) return 1;
  if (!right.dueAt) return -1;
  return left.dueAt.localeCompare(right.dueAt);
}

export default function DashboardPage() {
  const [me, setMe] = useState<MePayload | null>(null);
  const [installUrl, setInstallUrl] = useState("");
  const [dashboard, setDashboard] = useState<StudentProjectsDashboardResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    void (async () => {
      try {
        const [meResponse, installResponse, dashboardResponse] = await Promise.all([
          apiFetch("/v1/web/session", { auth: true }),
          apiFetch("/v1/github/install-url", { auth: true }),
          apiFetch("/v1/tracking/dashboard/student", { auth: true })
        ]);

        const mePayload = await meResponse.json() as MePayload;
        const installPayload = await installResponse.json() as InstallUrlPayload;
        const dashboardPayload = await dashboardResponse.json() as StudentProjectsDashboardResponse;

        if (!alive) return;

        setMe(mePayload);
        setInstallUrl(installPayload.installUrl || "");
        setDashboard(dashboardPayload);
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const allMilestones = useMemo(() => {
    if (!dashboard) return [];
    return Object.values(dashboard.milestonesByProject).flat();
  }, [dashboard]);

  const datedMilestones = useMemo(
    () => [...allMilestones].filter((item) => item.dueAt).sort(sortByDueDate),
    [allMilestones]
  );

  const nearestDeadline = useMemo(() => {
    const now = new Date().toISOString();
    return datedMilestones.find((item) => item.dueAt && item.dueAt >= now) || datedMilestones[0] || null;
  }, [datedMilestones]);

  const totals = useMemo(() => {
    if (!dashboard) {
      return { approved: 0, underReview: 0 };
    }

    return Object.values(dashboard.statsByProject).reduce(
      (accumulator, stats) => ({
        approved: accumulator.approved + stats.approved,
        underReview: accumulator.underReview + stats.underReview
      }),
      { approved: 0, underReview: 0 }
    );
  }, [dashboard]);

  const activeProjects = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.projects.slice(0, 4).map((project) => ({
      project,
      stats: dashboard.statsByProject[project.id]
    }));
  }, [dashboard]);

  return (
    <main className="pageSection">
      <section className={`${styles.hero} pageHero`}>
        <div className={styles.heroCopy}>
          <span className="sectionEyebrow">Dashboard</span>
          <h1>Keep the CLI moving with a web surface built around real project state.</h1>
          <p className="bodyMuted">
            Review account status, milestone progress, deadlines, and recent activity
            without leaving the hosted workflow.
          </p>
        </div>

        <div className={styles.heroActions}>
          {installUrl ? <a className="buttonPrimary" href={installUrl}>Install GitHub App</a> : null}
          <a className="buttonSecondary" href="/projects">Open Projects</a>
        </div>
      </section>

      {error ? (
        <section className={`${styles.stateCard} surfaceCard`}>
          <h2>Session Error</h2>
          <p className="statusMessage">{error}</p>
        </section>
      ) : null}

      {dashboard?.pageError ? (
        <section className={`${styles.stateCard} surfaceCard`}>
          <h2>Nothing Published Yet</h2>
          <p className="statusMessage">{dashboard.pageError}</p>
        </section>
      ) : null}

      <section className={styles.statsGrid}>
        <article className={`${styles.statCard} surfaceCard`}>
          <span className={styles.statLabel}>Active Projects</span>
          <strong>{loading ? "..." : dashboard?.projects.length || 0}</strong>
          <p className="cardHint">Projects currently visible in the hosted tracker.</p>
        </article>
        <article className={`${styles.statCard} surfaceCard`}>
          <span className={styles.statLabel}>Approved Milestones</span>
          <strong>{loading ? "..." : totals.approved}</strong>
          <p className="cardHint">Milestones already approved or graded.</p>
        </article>
        <article className={`${styles.statCard} surfaceCard`}>
          <span className={styles.statLabel}>Under Review</span>
          <strong>{loading ? "..." : totals.underReview}</strong>
          <p className="cardHint">Milestones currently waiting on reviewer action.</p>
        </article>
        <article className={`${styles.statCard} surfaceCard`}>
          <span className={styles.statLabel}>Nearest Deadline</span>
          <strong>{loading ? "..." : nearestDeadline ? formatShortDate(nearestDeadline.dueAt) : "None"}</strong>
          <p className="cardHint">{nearestDeadline ? nearestDeadline.title : "No due dates are currently published."}</p>
        </article>
      </section>

      <section className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          <section className={`${styles.panel} surfaceCard`}>
            <div className={styles.panelHead}>
              <div>
                <h2>Recent Activity</h2>
                <p className="cardHint">Latest coursework and submission events.</p>
              </div>
            </div>
            <div className={styles.activityList}>
              {loading ? <p className="statusMessage">Loading activity…</p> : null}
              {!loading && !dashboard?.activity.length ? <p className="statusMessage">No activity has been recorded yet.</p> : null}
              {dashboard?.activity.slice(0, 6).map((entry) => (
                <article key={entry.id} className={styles.activityItem}>
                  <div>
                    <strong>{entry.summary}</strong>
                    <span>{entry.action.replace(/_/g, " ")}</span>
                  </div>
                  <time>{formatShortDate(entry.createdAt)}</time>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.panel} surfaceCard`}>
            <div className={styles.panelHead}>
              <div>
                <h2>Learning Progress</h2>
                <p className="cardHint">Completion across published projects.</p>
              </div>
            </div>
            <div className={styles.progressList}>
              {loading ? <p className="statusMessage">Loading progress…</p> : null}
              {!loading && !activeProjects.length ? <p className="statusMessage">No projects are available yet.</p> : null}
              {activeProjects.map(({ project, stats }) => (
                <article key={project.id} className={styles.progressItem}>
                  <div className={styles.progressHead}>
                    <strong>{project.title}</strong>
                    <span>{stats ? `${stats.completion}%` : "0%"}</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <span className={styles.progressFill} style={{ width: `${stats?.completion || 0}%` }} />
                  </div>
                  <p className="cardHint">{stats ? `${stats.approved}/${stats.total} milestones approved` : "No milestone stats yet."}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.rightColumn}>
          <section className={`${styles.panel} surfaceCard`}>
            <div className={styles.panelHead}>
              <div>
                <h2>Active Projects</h2>
                <p className="cardHint">Published project cards with completion status.</p>
              </div>
            </div>
            <div className={styles.projectList}>
              {loading ? <p className="statusMessage">Loading projects…</p> : null}
              {!loading && !activeProjects.length ? <p className="statusMessage">No active projects available.</p> : null}
              {activeProjects.map(({ project, stats }) => (
                <article key={project.id} className={styles.projectItem}>
                  <div className={styles.projectTop}>
                    <strong>{project.title}</strong>
                    <span>{project.status}</span>
                  </div>
                  <p className="cardHint">{project.description || "No description provided."}</p>
                  <div className={styles.projectMeta}>
                    <span>{project.type}</span>
                    <span>{stats ? `${stats.daysRemaining} days remaining` : "No due date"}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.panel} surfaceCard`}>
            <div className={styles.panelHead}>
              <div>
                <h2>Upcoming Deadlines</h2>
                <p className="cardHint">Nearest milestones across your current course.</p>
              </div>
            </div>
            <div className={styles.deadlineList}>
              {loading ? <p className="statusMessage">Loading deadlines…</p> : null}
              {!loading && !datedMilestones.length ? <p className="statusMessage">No dated milestones have been published yet.</p> : null}
              {datedMilestones.slice(0, 5).map((milestone) => (
                <article key={milestone.id} className={styles.deadlineItem}>
                  <span className={styles.deadlineBullet} />
                  <div>
                    <strong>{milestone.title}</strong>
                    <span>{milestone.statusLabel}</span>
                    <time>{formatShortDate(milestone.dueAt)}</time>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={`${styles.panel} surfaceCard`}>
            <div className={styles.panelHead}>
              <div>
                <h2>GitHub App Status</h2>
                <p className="cardHint">Hosted account and installation state.</p>
              </div>
            </div>
            <div className={styles.statusPanel}>
              <dl>
                <div>
                  <dt>Username</dt>
                  <dd>{me?.user.username || "Loading..."}</dd>
                </div>
                <div>
                  <dt>GitHub login</dt>
                  <dd>{me?.user.githubLogin || "Loading..."}</dd>
                </div>
                <div>
                  <dt>GitHub linked</dt>
                  <dd>{me?.user.githubLinked ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt>App installed</dt>
                  <dd>{me?.user.githubAppInstalled ? "Yes" : "No"}</dd>
                </div>
              </dl>
              <div className={styles.statusActions}>
                <a className="buttonSecondary" href="/install/complete">Finish setup</a>
                {installUrl ? <a className="buttonPrimary" href={installUrl}>Open install flow</a> : null}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
