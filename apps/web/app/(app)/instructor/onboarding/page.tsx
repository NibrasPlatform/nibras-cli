'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CliCodeBlock from '../../_components/cli-code-block';
import TerminalMockup, { type TerminalLine } from '../../_components/terminal-mockup';
import { prefs } from '../../../lib/prefs';
import styles from './page.module.css';

// ── OS type ──────────────────────────────────────────────────────────────────
type OS = 'mac' | 'linux' | 'windows';

type CommandReferenceItem = {
  command: string;
  description: string;
  note?: string;
};

type CommandReferenceGroup = {
  title: string;
  items: CommandReferenceItem[];
};

function detectOS(): OS {
  if (typeof navigator === 'undefined') return 'mac';
  const p = navigator.platform?.toLowerCase() ?? '';
  const ua = navigator.userAgent?.toLowerCase() ?? '';
  if (p.includes('win') || ua.includes('windows')) return 'windows';
  if (p.includes('linux') || ua.includes('linux')) return 'linux';
  return 'mac';
}

// ── OS-aware code block ───────────────────────────────────────────────────────
function OsCode({
  os,
  mac,
  linux,
  windows,
}: {
  os: OS;
  mac: string;
  linux?: string;
  windows?: string;
}) {
  const code = os === 'windows' ? (windows ?? mac) : os === 'linux' ? (linux ?? mac) : mac;
  return <CliCodeBlock code={code} />;
}

// ── Terminal outputs ──────────────────────────────────────────────────────────
const loginOutput: TerminalLine[] = [
  { type: 'cmd', text: 'nibras login' },
  { type: 'blank' },
  { type: 'success', text: '╭──────────────────────────────────────────────────────────────╮' },
  { type: 'success', text: '│  ℹ  Authorize this device                                   │' },
  { type: 'muted', text: '│  Open in browser: https://nibras-web.fly.dev/dev/approve?...│' },
  { type: 'muted', text: '│  Code:            ABCD-1234                                 │' },
  { type: 'muted', text: '│  Browser launch: automatic                                  │' },
  { type: 'success', text: '╰──────────────────────────────────────────────────────────────╯' },
  { type: 'blank' },
  { type: 'muted', text: '  ⠋ Waiting for browser authorization…' },
  { type: 'blank' },
  { type: 'success', text: '╭─────────────────────────────────────────╮' },
  { type: 'success', text: '│  ✓  Authenticated as Zied               │' },
  { type: 'muted', text: '│  User:    Zied                          │' },
  { type: 'muted', text: '│  GitHub:  Zied                          │' },
  { type: 'muted', text: '│  API:     https://nibras-api.fly.dev    │' },
  { type: 'success', text: '╰─────────────────────────────────────────╯' },
];

const setupOutput: TerminalLine[] = [
  { type: 'cmd', text: 'nibras setup --project cs101/assignment-1' },
  { type: 'blank' },
  { type: 'muted', text: '  ⠋ Setting up project cs101/assignment-1…' },
  { type: 'muted', text: '  ⠋ Writing project manifest…' },
  { type: 'success', text: '  ✓ Project set up' },
  { type: 'blank' },
  { type: 'success', text: '╭────────────────────────────────────────────╮' },
  { type: 'success', text: '│  ✓  Project ready: cs101/assignment-1      │' },
  { type: 'muted', text: '│  Project: cs101/assignment-1               │' },
  { type: 'muted', text: '│  Repo:    nibras-platform/cs101-Zied       │' },
  { type: 'muted', text: '│  Next steps:                               │' },
  { type: 'muted', text: '│    nibras task    — view task instructions │' },
  { type: 'muted', text: '│    nibras test    — run local tests        │' },
  { type: 'muted', text: '│    nibras submit  — submit your solution   │' },
  { type: 'success', text: '╰────────────────────────────────────────────╯' },
];

const submitOutput: TerminalLine[] = [
  { type: 'cmd', text: 'nibras submit' },
  { type: 'blank' },
  { type: 'muted', text: '  Running tests: npm test' },
  { type: 'blank' },
  { type: 'success', text: '  ✓ Staged 3 files' },
  { type: 'success', text: '  ✓ Pushed commit a3f7c1d' },
  { type: 'output', text: '  Verifying  ████████████████░░░░  80%' },
  { type: 'blank' },
  { type: 'success', text: '╭──────────────────────────────╮' },
  { type: 'success', text: '│  ✓  Submission passed ✓      │' },
  { type: 'muted', text: '│  Status:  passed             │' },
  { type: 'success', text: '╰──────────────────────────────╯' },
];

// ── Step definition ───────────────────────────────────────────────────────────
const STEPS = [
  { id: 'step-01', number: '01', label: 'Prerequisites' },
  { id: 'step-02', number: '02', label: 'Install the CLI' },
  { id: 'step-03', number: '03', label: 'Authenticate' },
  { id: 'step-04', number: '04', label: 'Create a course' },
  { id: 'step-05', number: '05', label: 'Set up a project' },
  { id: 'step-06', number: '06', label: 'Run tests' },
  { id: 'step-07', number: '07', label: 'Submit' },
  { id: 'step-08', number: '08', label: 'Check status' },
  { id: 'step-09', number: '09', label: 'Share with students' },
];

const COMMAND_REFERENCE_GROUPS: CommandReferenceGroup[] = [
  {
    title: 'Core workflow',
    items: [
      { command: 'nibras login', description: 'Start hosted device login.' },
      {
        command: 'nibras setup --project <key>',
        description: 'Bootstrap or refresh a local project.',
      },
      {
        command: 'nibras task',
        description: 'Print cached task text or fetch it if missing.',
      },
      { command: 'nibras test', description: 'Run the manifest test command.' },
      {
        command: 'nibras submit',
        description: 'Test, stage allowed files, commit, push, and wait for verification.',
      },
    ],
  },
  {
    title: 'Session and diagnostics',
    items: [
      {
        command: 'nibras whoami',
        description: 'Show the signed-in user and linked GitHub account.',
      },
      {
        command: 'nibras ping',
        description: 'Show API, auth, GitHub, GitHub App, and project status.',
        note: 'Inside a project, it also reports the project key and origin remote.',
      },
      { command: 'nibras logout', description: 'Clear the local session.' },
    ],
  },
  {
    title: 'Install lifecycle',
    items: [
      {
        command: 'nibras update --version <tag>',
        description: 'Reinstall a pinned Git-tag release.',
        note: '--check is not currently reliable; use an explicit --version.',
      },
      {
        command: 'nibras update --force --version <tag>',
        description: 'Force reinstall the same pinned tag.',
      },
      {
        command: 'nibras uninstall',
        description: 'Remove the global CLI install and keep local config.',
      },
    ],
  },
  {
    title: 'Advanced / compatibility',
    items: [
      {
        command: 'nibras update-buildpack --node <version>',
        description: 'Edit the Node buildpack version in .nibras/project.json.',
        note: 'Advanced manifest maintenance only; standard students usually do not need this.',
      },
      {
        command: 'nibras legacy ...',
        description: 'Run the older CLI entrypoint for compatibility.',
        note: 'Compatibility-only. It is not part of the hosted default workflow.',
      },
    ],
  },
];

// ── Section with collapsible + scroll anchor ──────────────────────────────────
function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section id={id} className={styles.section}>
      <button
        className={styles.sectionHeader}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className={styles.stepBadge}>{number}</div>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </section>
  );
}

function CheckItem({ label }: { label: React.ReactNode }) {
  return (
    <div className={styles.checkItem}>
      <span className={styles.checkIcon}>○</span>
      <span>{label}</span>
    </div>
  );
}

// ── OS Tab bar ────────────────────────────────────────────────────────────────
function OsTabs({ os, setOs }: { os: OS; setOs: (v: OS) => void }) {
  const tabs: { value: OS; label: string; icon: string }[] = [
    { value: 'mac', label: 'macOS', icon: '' },
    { value: 'linux', label: 'Linux', icon: '🐧' },
    { value: 'windows', label: 'Windows', icon: '⊞' },
  ];
  return (
    <div className={styles.osTabs}>
      {tabs.map((t) => (
        <button
          key={t.value}
          className={`${styles.osTab} ${os === t.value ? styles.osTabActive : ''}`}
          onClick={() => setOs(t.value)}
        >
          <span className={styles.osTabIcon}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [os, setOs] = useState<OS>('mac');
  const [activeStep, setActiveStep] = useState('step-01');

  // Detect OS on mount
  useEffect(() => {
    const saved = prefs.getOnboardingOs() as OS | null;
    setOs(saved ?? detectOS());
  }, []);

  // Persist OS selection
  function handleSetOs(v: OS) {
    setOs(v);
    prefs.setOnboardingOs(v);
  }

  // IntersectionObserver — track active section
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    STEPS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveStep(id);
        },
        { rootMargin: '-20% 0px -70% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const configPath =
    os === 'windows' ? '%APPDATA%\\nibras\\config.json' : '~/.config/nibras/config.json';

  const dirExample =
    os === 'windows'
      ? 'nibras setup --project cs101/a1 --dir C:\\projects\\a1'
      : 'nibras setup --project cs101/a1 --dir ~/projects/a1';

  return (
    <div className={styles.pageWrapper}>
      {/* ── Step nav sidebar ─────────────────────────────────────────────── */}
      <nav className={styles.stepNav} aria-label="Steps">
        {STEPS.map(({ id, number, label }) => (
          <button
            key={id}
            className={`${styles.stepNavItem} ${activeStep === id ? styles.stepNavItemActive : ''}`}
            onClick={() => scrollTo(id)}
          >
            <span className={styles.stepNavNum}>{number}</span>
            <span className={styles.stepNavLabel}>{label}</span>
          </button>
        ))}
      </nav>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className={styles.page}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroBadge}>CLI Setup Guide</div>
          <h1 className={styles.heroTitle}>Get the Nibras CLI running</h1>
          <p className={styles.heroSub}>
            Install the CLI, authenticate with GitHub, create a project, and make your first
            submission — step by step, for your OS.
          </p>
          <OsTabs os={os} setOs={handleSetOs} />
          <div className={styles.heroActions}>
            <Link href="/instructor/courses/new" className={styles.btnPrimary}>
              Create a course first →
            </Link>
            <a
              href="https://github.com/nibras-platform/nibras-cli"
              target="_blank"
              rel="noreferrer"
              className={styles.btnGhost}
            >
              GitHub →
            </a>
          </div>
        </div>

        <div className={styles.content}>
          {/* 01 Prerequisites */}
          <Section id="step-01" number="01" title="Prerequisites">
            <p className={styles.bodyText}>
              Make sure you have these tools installed before continuing.
            </p>

            {os === 'windows' && (
              <div className={`${styles.callout} ${styles.calloutInfo}`}>
                <span className={styles.calloutIcon}>⊞</span>
                <p>
                  We recommend using <strong>Git Bash</strong> or <strong>WSL</strong> for the best
                  experience. PowerShell works but some commands and paths may differ.
                </p>
              </div>
            )}

            <div className={styles.checkList}>
              <CheckItem
                label={
                  <>
                    <strong>Node.js ≥ 18</strong> —{' '}
                    {os === 'linux' ? (
                      <>
                        install via{' '}
                        <a
                          href="https://github.com/nvm-sh/nvm"
                          target="_blank"
                          rel="noreferrer"
                          className={styles.link}
                        >
                          nvm
                        </a>{' '}
                        or{' '}
                        <a
                          href="https://nodejs.org"
                          target="_blank"
                          rel="noreferrer"
                          className={styles.link}
                        >
                          nodejs.org
                        </a>
                      </>
                    ) : os === 'windows' ? (
                      <>
                        download the Windows installer from{' '}
                        <a
                          href="https://nodejs.org"
                          target="_blank"
                          rel="noreferrer"
                          className={styles.link}
                        >
                          nodejs.org
                        </a>
                      </>
                    ) : (
                      <>
                        download from{' '}
                        <a
                          href="https://nodejs.org"
                          target="_blank"
                          rel="noreferrer"
                          className={styles.link}
                        >
                          nodejs.org
                        </a>{' '}
                        or use <code className={styles.inlineCode}>brew install node</code>
                      </>
                    )}
                  </>
                }
              />
              <CheckItem
                label={
                  <>
                    <strong>Git</strong> — installed and configured with{' '}
                    <code className={styles.inlineCode}>
                      git config --global user.name &quot;Your Name&quot;
                    </code>
                    {os === 'windows' && (
                      <span style={{ color: 'var(--text-soft)', fontSize: 13 }}>
                        {' '}
                        (run in Git Bash or WSL)
                      </span>
                    )}
                  </>
                }
              />
              <CheckItem
                label={
                  <>
                    <strong>GitHub account</strong> — you&apos;ll authenticate with GitHub OAuth in
                    step 3
                  </>
                }
              />
            </div>
          </Section>

          {/* 02 Install */}
          <Section id="step-02" number="02" title="Install the CLI">
            <p className={styles.bodyText}>
              Install the current CLI release directly from GitHub. This pins the onboarding flow to{' '}
              <code className={styles.inlineCode}>v1.0.2</code> and makes the{' '}
              <code className={styles.inlineCode}>nibras</code> command available anywhere.
            </p>

            <div className={`${styles.callout} ${styles.calloutInfo}`}>
              <span className={styles.calloutIcon}>ℹ</span>
              <p>
                The npm package is not published yet. Right now{' '}
                <code className={styles.inlineCode}>npm install -g @nibras/cli</code> and{' '}
                <code className={styles.inlineCode}>npx @nibras/cli</code> will fail with a 404.
                Until that is fixed, install from the Git tag instead.
              </p>
            </div>

            {os === 'windows' && (
              <div className={`${styles.callout} ${styles.calloutInfo}`}>
                <span className={styles.calloutIcon}>💡</span>
                <p>
                  On Windows, run your terminal (<strong>PowerShell</strong> or{' '}
                  <strong>Git Bash</strong>) as <strong>Administrator</strong> when installing
                  global npm packages.
                </p>
              </div>
            )}

            <OsCode
              os={os}
              mac="npm install -g git+https://github.com/NibrasPlatform/nibras-cli.git#v1.0.2"
              linux="npm install -g git+https://github.com/NibrasPlatform/nibras-cli.git#v1.0.2"
              windows="npm install -g git+https://github.com/NibrasPlatform/nibras-cli.git#v1.0.2"
            />
            <p className={styles.hint}>
              Verify the install: <code className={styles.inlineCode}>nibras --version</code> should
              start with <code className={styles.inlineCode}>v1.0.2</code>, for example{' '}
              <code className={styles.inlineCode}>v1.0.2-499d7f9</code>.
            </p>
            <p className={styles.bodyText}>
              To reinstall the pinned release later, run{' '}
              <code className={styles.inlineCode}>nibras update --version v1.0.2</code>.
            </p>
            <p className={styles.bodyText}>
              To remove the CLI from this machine later, run{' '}
              <code className={styles.inlineCode}>nibras uninstall</code>.
            </p>
            <p className={styles.hint}>
              Avoid <code className={styles.inlineCode}>nibras update --check</code> for now. The
              latest-release lookup is not configured yet.
            </p>
            <div className={`${styles.callout} ${styles.calloutInfo}`}>
              <span className={styles.calloutIcon}>⚠</span>
              <div>
                <p>
                  If the install fails with <code className={styles.inlineCode}>EEXIST</code> or{' '}
                  <code className={styles.inlineCode}>ENOTDIR</code>, you probably have an older
                  global <code className={styles.inlineCode}>nibras</code> link. Remove it and
                  reinstall:
                </p>
                <OsCode
                  os={os}
                  mac={`npm uninstall -g nibras @nibras/cli || true
rm -f "$(npm config get prefix)/bin/nibras"
rm -rf "$(npm root -g)/nibras"
npm install -g git+https://github.com/NibrasPlatform/nibras-cli.git#v1.0.2`}
                  linux={`npm uninstall -g nibras @nibras/cli || true
rm -f "$(npm config get prefix)/bin/nibras"
rm -rf "$(npm root -g)/nibras"
npm install -g git+https://github.com/NibrasPlatform/nibras-cli.git#v1.0.2`}
                  windows={`npm uninstall -g nibras @nibras/cli
Remove-Item "$env:APPDATA\\npm\\nibras.cmd" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\\npm\\node_modules\\nibras" -Recurse -Force -ErrorAction SilentlyContinue
npm install -g git+https://github.com/NibrasPlatform/nibras-cli.git#v1.0.2`}
                />
              </div>
            </div>
          </Section>

          {/* 03 Authenticate */}
          <Section id="step-03" number="03" title="Authenticate with GitHub">
            <p className={styles.bodyText}>
              Run <code className={styles.inlineCode}>nibras login</code> to start the device
              authorization flow. It prints a URL and short code, then tries to open the browser
              automatically unless you pass <code className={styles.inlineCode}>--no-open</code>.
            </p>
            <CliCodeBlock code="nibras login" />
            <div className={styles.terminalWrapper}>
              <TerminalMockup title="nibras login" lines={loginOutput} />
            </div>
            <p className={styles.hint}>
              Credentials are stored in <code className={styles.inlineCode}>{configPath}</code>. Run{' '}
              <code className={styles.inlineCode}>nibras whoami</code> after login to confirm the
              active session and linked GitHub account.
            </p>
          </Section>

          {/* 04 Create a course */}
          <Section id="step-04" number="04" title="Create a course (web)">
            <p className={styles.bodyText}>
              Before students can use the CLI, create a course and at least one project from the web
              dashboard.
            </p>
            <ol className={styles.steps}>
              <li>
                Go to <strong>Instructor → New Course</strong>
              </li>
              <li>
                Enter the course code (e.g. <code className={styles.inlineCode}>cs101</code>),
                title, and term
              </li>
              <li>Add a project with an allowed file path pattern</li>
              <li>
                Copy the project key (e.g.{' '}
                <code className={styles.inlineCode}>cs101/assignment-1</code>)
              </li>
            </ol>
            <Link href="/instructor/courses/new" className={styles.btnPrimary}>
              Open course creator →
            </Link>
          </Section>

          {/* 05 Setup */}
          <Section id="step-05" number="05" title="Set up a project locally">
            <p className={styles.bodyText}>
              Run <code className={styles.inlineCode}>nibras setup</code> with the project key to
              bootstrap the local directory. It writes{' '}
              <code className={styles.inlineCode}>.nibras/project.json</code> and{' '}
              <code className={styles.inlineCode}>.nibras/task.md</code>, initialises git if needed,
              and adds <code className={styles.inlineCode}>origin</code> for the student repo.
            </p>
            <CliCodeBlock code="nibras setup --project cs101/assignment-1" />
            <div className={styles.terminalWrapper}>
              <TerminalMockup title="nibras setup" lines={setupOutput} />
            </div>
            <p className={styles.bodyText}>
              For bundle-backed projects, setup may download starter files and create the initial
              commit. If the target directory already has{' '}
              <code className={styles.inlineCode}>.git</code>, setup refreshes the{' '}
              <code className={styles.inlineCode}>.nibras</code> metadata instead of re-extracting
              starter files.
            </p>
            <p className={styles.hint}>
              Specify a target directory: <code className={styles.inlineCode}>{dirExample}</code>
            </p>
          </Section>

          {/* 06 Tests */}
          <Section id="step-06" number="06" title="Run local tests">
            <p className={styles.bodyText}>
              Use <code className={styles.inlineCode}>nibras test</code> to run the command in{' '}
              <code className={styles.inlineCode}>.nibras/project.json → test.command</code>. Pass{' '}
              <code className={styles.inlineCode}>--previous</code> only when the project manifest
              supports it.
            </p>
            <CliCodeBlock
              code={`nibras test\nnibras test --previous   # include previous milestone tests`}
            />
            <p className={styles.hint}>
              A non-zero exit means the configured test command failed. Projects that do not opt in
              to previous-milestone runs will reject{' '}
              <code className={styles.inlineCode}>--previous</code>.
            </p>
          </Section>

          {/* 07 Submit */}
          <Section id="step-07" number="07" title="Submit your solution">
            <p className={styles.bodyText}>
              <code className={styles.inlineCode}>nibras submit</code> runs the configured local
              test command first, stages only allowed files, creates a commit, pushes to{' '}
              <code className={styles.inlineCode}>origin</code>, registers the submission, and polls
              for verification.
            </p>
            <CliCodeBlock code="nibras submit" />
            <div className={styles.terminalWrapper}>
              <TerminalMockup title="nibras submit" lines={submitOutput} />
            </div>
            <div className={styles.callout}>
              <span className={styles.calloutIcon}>💡</span>
              <p>
                Only files matching{' '}
                <code className={styles.inlineCode}>submission.allowedPaths</code> in your manifest
                are included — students can&apos;t accidentally submit test or grading files.
              </p>
            </div>
            <p className={styles.hint}>
              A failing local test run does not automatically abort submission. The CLI still sends
              the local result with the submission so verification can continue.
            </p>
          </Section>

          {/* 08 Status */}
          <Section id="step-08" number="08" title="Check status">
            <p className={styles.bodyText}>Two diagnostic commands are available at any time:</p>
            <CliCodeBlock
              code={`nibras ping    # check API, auth, GitHub, GitHub App, and project status\nnibras whoami  # show signed-in user and linked GitHub account`}
            />
            <p className={styles.hint}>
              <code className={styles.inlineCode}>nibras ping</code> checks API, auth, GitHub, and
              GitHub App status. When you run it inside a project, it also shows the project key and{' '}
              <code className={styles.inlineCode}>origin</code> remote.
            </p>
          </Section>

          {/* 09 Share */}
          <Section id="step-09" number="09" title="Share with students">
            <p className={styles.bodyText}>
              Students follow the same flow: install the CLI, run{' '}
              <code className={styles.inlineCode}>nibras login</code>, and{' '}
              <code className={styles.inlineCode}>nibras setup --project &lt;key&gt;</code>. Share
              the project key with your class.
            </p>

            {os === 'windows' && (
              <div className={`${styles.callout} ${styles.calloutInfo}`}>
                <span className={styles.calloutIcon}>⊞</span>
                <p>
                  Remind Windows students to run the commands in <strong>Git Bash</strong>,{' '}
                  <strong>WSL</strong>, or <strong>PowerShell (Admin)</strong>.
                </p>
              </div>
            )}

            <div className={styles.shareCard}>
              <div className={styles.shareCardTitle}>Student quick-start</div>
              <CliCodeBlock
                code={`npm install -g git+https://github.com/NibrasPlatform/nibras-cli.git#v1.0.2\nnibras --version\nnibras login\nnibras setup --project cs101/assignment-1\nnibras test\nnibras submit`}
              />
            </div>
            <p className={styles.hint}>
              Students can view task instructions at any time with{' '}
              <code className={styles.inlineCode}>nibras task</code>.
            </p>
          </Section>

          <section className={styles.referenceSection} aria-labelledby="cli-command-reference">
            <div className={styles.referenceIntro}>
              <h2 id="cli-command-reference" className={styles.referenceTitle}>
                CLI Command Reference
              </h2>
              <p className={styles.bodyText}>
                Use this appendix for commands outside the main onboarding path or when you need the
                rest of the current CLI surface at a glance.
              </p>
            </div>

            <div className={styles.referenceGroups}>
              {COMMAND_REFERENCE_GROUPS.map((group) => (
                <section key={group.title} className={styles.referenceGroup}>
                  <h3 className={styles.referenceGroupTitle}>{group.title}</h3>
                  <div className={styles.referenceList}>
                    {group.items.map((item) => (
                      <div key={item.command} className={styles.referenceRow}>
                        <div className={styles.referenceCommand}>
                          <code className={styles.inlineCode}>{item.command}</code>
                        </div>
                        <div className={styles.referenceCopy}>
                          <p className={styles.referenceDescription}>{item.description}</p>
                          {item.note ? <p className={styles.referenceNote}>{item.note}</p> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>

          {/* Footer CTA */}
          <div className={styles.footerCta}>
            <h3>Ready to create your first course?</h3>
            <p>Set up a course and project on the web, then share the project key with students.</p>
            <div className={styles.footerCtaActions}>
              <Link href="/instructor/courses/new" className={styles.btnPrimary}>
                Create a course →
              </Link>
              <Link href="/instructor" className={styles.btnGhost}>
                Back to Instructor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
