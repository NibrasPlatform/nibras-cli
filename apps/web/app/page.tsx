'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import NibrasLogo from './_components/nibras-logo';
import { discoverApiBaseUrl } from './lib/session';
import styles from './signin.module.css';

const starField = [
  { top: '8%', left: '12%', size: 2, opacity: 0.34 },
  { top: '10%', left: '38%', size: 4, opacity: 0.4 },
  { top: '14%', left: '69%', size: 3, opacity: 0.36 },
  { top: '18%', left: '82%', size: 5, opacity: 0.42 },
  { top: '24%', left: '16%', size: 4, opacity: 0.38 },
  { top: '28%', left: '52%', size: 2, opacity: 0.3 },
  { top: '31%', left: '78%', size: 3, opacity: 0.42 },
  { top: '36%', left: '9%', size: 2, opacity: 0.28 },
  { top: '40%', left: '31%', size: 5, opacity: 0.48 },
  { top: '44%', left: '61%', size: 3, opacity: 0.35 },
  { top: '48%', left: '87%', size: 2, opacity: 0.3 },
  { top: '54%', left: '18%', size: 4, opacity: 0.38 },
  { top: '58%', left: '43%', size: 2, opacity: 0.28 },
  { top: '61%', left: '71%', size: 4, opacity: 0.44 },
  { top: '66%', left: '90%', size: 6, opacity: 0.48 },
  { top: '72%', left: '12%', size: 3, opacity: 0.32 },
  { top: '76%', left: '34%', size: 5, opacity: 0.46 },
  { top: '81%', left: '58%', size: 2, opacity: 0.26 },
  { top: '84%', left: '76%', size: 3, opacity: 0.38 },
  { top: '88%', left: '22%', size: 2, opacity: 0.26 },
];

const workflowSteps = [
  {
    number: '01',
    title: 'Plan',
    subtitle: 'Structure the workflow',
    body: 'Start from reusable templates, define roles, team shape, and planner requirements before the course starts moving.',
  },
  {
    number: '02',
    title: 'Purpose',
    subtitle: 'Set the operating model',
    body: 'Collect role applications, choose the right academic path, and route petitions, approvals, and team decisions through one system.',
  },
  {
    number: '03',
    title: 'Fill',
    subtitle: 'Run the course',
    body: 'Students submit through GitHub, instructors lock teams and review work, and program planning stays visible all semester.',
  },
];

const capabilities = [
  {
    eyebrow: 'Templates',
    title: 'Reusable project blueprints',
    body: 'Define repeatable project structure, delivery mode, team size, and role setup once.',
  },
  {
    eyebrow: 'Team Formation',
    title: 'Role applications to locked teams',
    body: 'Students rank preferences, instructors generate suggestions, and final team rosters are locked cleanly.',
  },
  {
    eyebrow: 'Planner',
    title: 'University-style program planning',
    body: 'Tracks, petitions, approvals, and printable sheets live in one student-facing planning workspace.',
  },
  {
    eyebrow: 'CLI + GitHub',
    title: 'Still built for real developer workflows',
    body: 'Setup, testing, and submission stay GitHub-native while the web app handles coordination and review.',
  },
];

function AuthBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get('auth') !== 'required') return null;
  return (
    <div className={styles.authBanner} role="alert">
      Authentication required. Please sign in to access the dashboard.
    </div>
  );
}

export default function HomePage() {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn() {
    setError('');
    setSubmitting(true);
    try {
      const apiBaseUrl = await discoverApiBaseUrl();
      const configRes = await fetch(`${apiBaseUrl}/v1/github/config`);
      if (configRes.ok) {
        const config = (await configRes.json()) as { configured: boolean };
        if (!config.configured) {
          setError(
            'GitHub App is not configured. Set GITHUB_APP_ID, GITHUB_APP_CLIENT_ID, and related environment variables, then restart the API.'
          );
          setSubmitting(false);
          return;
        }
      }
      const returnTo = `${window.location.origin}/auth/complete`;
      window.location.href = `${apiBaseUrl}/v1/github/oauth/start?return_to=${encodeURIComponent(returnTo)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <Suspense>
        <AuthBanner />
      </Suspense>

      <div className={styles.ambientGlow} />
      <div className={styles.gridOverlay} />
      <div className={styles.starField} aria-hidden="true">
        {starField.map((star, index) => (
          <span
            key={`${star.top}-${star.left}-${index}`}
            className={styles.star}
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <nav className={styles.nav}>
        <div className={styles.brand}>
          <NibrasLogo variant="inverse" width={118} priority />
          <span className={styles.betaPill}>Beta</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#how-it-works">How it works</a>
          <a href="#transformation">Transformation</a>
          <a href="#features">Features</a>
          <button
            className={styles.navAction}
            onClick={() => void handleSignIn()}
            disabled={submitting}
          >
            {submitting ? 'Connecting…' : 'Sign in'}
          </button>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.heroBadge}>
            Beta • Academic workflows that organize themselves
          </span>
          <h1>
            Other tools render course pages.
            <span> Nibras designs the system.</span>
          </h1>
          <p className={styles.heroText}>
            Blueprint-first academic operations for project templates, team formation, role
            applications, and university-style program planning.
          </p>

          <div className={styles.heroActions}>
            <button
              className={styles.primaryButton}
              onClick={() => void handleSignIn()}
              disabled={submitting}
            >
              {submitting ? 'Connecting…' : 'Start with GitHub'}
            </button>
            <a href="#features" className={styles.secondaryButton}>
              Explore system
            </a>
          </div>

          <div className={styles.trustRow}>
            <div className={styles.avatarStack} aria-hidden="true">
              <span>A</span>
              <span>B</span>
              <span>C</span>
              <span>D</span>
              <span>E</span>
            </div>
            <p>
              Trusted by teams running templates, team projects, and planner-first academic flows.
            </p>
          </div>

          {error ? <p className={styles.errorBox}>{error}</p> : null}
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.blueprintCard}>
            <div className={styles.browserBar}>
              <div className={styles.windowDots}>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.browserAddress}>nibras.app/course-ops/blueprint</div>
            </div>
            <div className={styles.blueprintShell}>
              <aside className={styles.leftRail}>
                <div className={styles.railSection}>
                  <span className={styles.railLabel}>Course Blueprint</span>
                  <strong>Applied Systems</strong>
                  <small>4 structured workspaces</small>
                </div>
                <div className={styles.railList}>
                  <span className={styles.activeRailItem}>Introduction</span>
                  <span>Templates</span>
                  <span>Team Formation</span>
                  <span>Program Planner</span>
                  <span>Petitions</span>
                </div>
              </aside>

              <div className={styles.workspace}>
                <div className={styles.workspaceHeader}>
                  <div>
                    <span className={styles.workspaceEyebrow}>Overview</span>
                    <h2>Blueprint Overview</h2>
                  </div>
                  <span className={styles.statusChip}>On this page</span>
                </div>

                <div className={styles.skeletonRows}>
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className={styles.docPanel}>
                  <article className={styles.infoPanel}>
                    <span className={styles.panelEyebrow}>Templates</span>
                    <strong>Reusable project blueprints</strong>
                    <p>Roles, team size, milestones, and delivery mode defined once.</p>
                  </article>
                  <article className={styles.infoPanel}>
                    <span className={styles.panelEyebrow}>Formation</span>
                    <strong>Applications to locked teams</strong>
                    <p>Suggested teams, waitlists, and final lock state stay readable.</p>
                  </article>
                  <article className={styles.infoPanel}>
                    <span className={styles.panelEyebrow}>Planner</span>
                    <strong>Track, petitions, printable sheet</strong>
                    <p>University-style planning built into the same product surface.</p>
                  </article>
                </div>
              </div>

              <aside className={styles.contextRail}>
                <span className={styles.contextLabel}>On this page</span>
                <div className={styles.contextList}>
                  <span>Introduction</span>
                  <span>Templates</span>
                  <span>Use Cases</span>
                  <span>Getting Started</span>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>How It Works</span>
          <h2>From blank workflow to complete academic operations.</h2>
          <p>
            Three simple steps to a product surface that actually makes academic coordination make
            sense.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {workflowSteps.map((step) => (
            <article key={step.number} className={styles.stepCard}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3>{step.title}</h3>
              <strong>{step.subtitle}</strong>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="transformation" className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>Transformation</span>
          <h2>From scattered course operations to one coherent system.</h2>
          <p>
            Nibras now covers more than submissions. The UI should make the before-and-after
            obvious.
          </p>
        </div>

        <div className={styles.compareGrid}>
          <article className={styles.compareCard}>
            <span className={styles.compareLabel}>Before</span>
            <strong>Course ops scattered across tools</strong>
            <ul>
              <li>Templates hidden inside course setup</li>
              <li>Team applications feel bolted onto submissions</li>
              <li>Program planning lives outside the main product story</li>
              <li>Navigation mixes unrelated workflows together</li>
            </ul>
          </article>

          <article className={`${styles.compareCard} ${styles.compareCardAccent}`}>
            <span className={styles.compareLabel}>After</span>
            <strong>Blueprint-driven academic workflows</strong>
            <ul>
              <li>Templates are first-class reusable blueprints</li>
              <li>Role applications lead naturally into team formation</li>
              <li>Planner, tracks, petitions, and printable sheets are visible</li>
              <li>Role-based workspaces organize the app around real jobs</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="features" className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>Everything You Need</span>
          <h2>Four product areas, one design language.</h2>
          <p>
            The UI is now organized around the actual shipped feature surface instead of the older
            grading-only story.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {capabilities.map((capability) => (
            <article key={capability.title} className={styles.featureCard}>
              <span>{capability.eyebrow}</span>
              <h3>{capability.title}</h3>
              <p>{capability.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div>
          <span className={styles.eyebrow}>Ready To Open Nibras?</span>
          <h2>Start from the blueprint, not the chaos.</h2>
          <p>
            Sign in to access the redesigned platform with grouped navigation, planner workspaces,
            template flows, and team formation UI.
          </p>
        </div>
        <div className={styles.heroActions}>
          <button
            className={styles.primaryButton}
            onClick={() => void handleSignIn()}
            disabled={submitting}
          >
            {submitting ? 'Connecting…' : 'Sign in with GitHub'}
          </button>
          <Link href="/device" className={styles.secondaryButton}>
            CLI guide
          </Link>
        </div>
      </section>
    </main>
  );
}
