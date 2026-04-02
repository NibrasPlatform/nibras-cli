'use client';

import Link from 'next/link';
import CliCodeBlock from '../../_components/cli-code-block';
import TerminalMockup, { type TerminalLine } from '../../_components/terminal-mockup';
import styles from './page.module.css';

const loginOutput: TerminalLine[] = [
  { type: 'cmd', text: 'nibras login' },
  { type: 'blank' },
  { type: 'output', text: '  Open  https://app.nibras.io/device?user_code=ABCD-1234' },
  { type: 'output', text: '  Code  ABCD-1234' },
  { type: 'blank' },
  { type: 'muted', text: '  ⠋ Waiting for browser authorization…' },
  { type: 'blank' },
  { type: 'success', text: '╭─────────────────────────────────────────╮' },
  { type: 'success', text: '│  ✓  Authenticated as jsmith             │' },
  { type: 'muted', text: '│  User:    jsmith                        │' },
  { type: 'muted', text: '│  GitHub:  jsmith                        │' },
  { type: 'muted', text: '│  API:     https://app.nibras.io         │' },
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
  { type: 'muted', text: '│  Repo:    nibras-platform/cs101-jsmith     │' },
  { type: 'muted', text: '│  Next steps:                               │' },
  { type: 'muted', text: '│    nibras task    — view task instructions │' },
  { type: 'muted', text: '│    nibras test    — run local tests        │' },
  { type: 'muted', text: '│    nibras submit  — submit your solution   │' },
  { type: 'success', text: '╰────────────────────────────────────────────╯' },
];

const submitOutput: TerminalLine[] = [
  { type: 'cmd', text: 'nibras submit' },
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

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.stepBadge}>{number}</div>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function CheckItem({ done, label }: { done: boolean; label: React.ReactNode }) {
  return (
    <div className={`${styles.checkItem} ${done ? styles.checkItemDone : ''}`}>
      <span className={styles.checkIcon}>{done ? '✓' : '○'}</span>
      <span>{label}</span>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className={styles.page}>
      {/* Page hero */}
      <div className={styles.hero}>
        <div className={styles.heroBadge}>CLI Setup Guide</div>
        <h1 className={styles.heroTitle}>Get the Nibras CLI running</h1>
        <p className={styles.heroSub}>
          Follow this guide to install the CLI, authenticate with GitHub, create a project, and make
          your first submission — step by step.
        </p>
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
        {/* ── 1. Prerequisites ──────────────────────────────────────────────── */}
        <Section number="01" title="Prerequisites">
          <p className={styles.bodyText}>
            Before installing the CLI, make sure you have these tools available on your machine.
          </p>
          <div className={styles.checkList}>
            <CheckItem
              done={false}
              label={
                <>
                  <strong>Node.js ≥ 18</strong> —{' '}
                  <a
                    href="https://nodejs.org"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.link}
                  >
                    download at nodejs.org
                  </a>
                </>
              }
            />
            <CheckItem
              done={false}
              label={
                <>
                  <strong>Git</strong> — installed and configured with{' '}
                  <code className={styles.inlineCode}>git config --global user.name</code>
                </>
              }
            />
            <CheckItem
              done={false}
              label={
                <>
                  <strong>GitHub account</strong> — you&apos;ll authenticate with GitHub OAuth in
                  step 3
                </>
              }
            />
          </div>
        </Section>

        {/* ── 2. Install ────────────────────────────────────────────────────── */}
        <Section number="02" title="Install the CLI">
          <p className={styles.bodyText}>
            Install the <code className={styles.inlineCode}>@nibras/cli</code> package globally via
            npm. This gives you the <code className={styles.inlineCode}>nibras</code> command
            anywhere in your terminal.
          </p>
          <CliCodeBlock code="npm install -g @nibras/cli" />
          <p className={styles.bodyText} style={{ marginTop: 12 }}>
            Or run without installing using npx:
          </p>
          <CliCodeBlock code="npx @nibras/cli --help" />
          <p className={styles.hint}>
            Verify the install by running{' '}
            <code className={styles.inlineCode}>nibras --version</code>.
          </p>
        </Section>

        {/* ── 3. Authenticate ───────────────────────────────────────────────── */}
        <Section number="03" title="Authenticate with GitHub">
          <p className={styles.bodyText}>
            Run <code className={styles.inlineCode}>nibras login</code> to start the device
            authorization flow. A URL and a short code will be printed. Open the URL in your
            browser, enter the code, and approve access.
          </p>
          <CliCodeBlock code="nibras login" />
          <div className={styles.terminalWrapper}>
            <TerminalMockup title="nibras login" lines={loginOutput} />
          </div>
          <p className={styles.hint}>
            Your credentials are stored in{' '}
            <code className={styles.inlineCode}>~/.config/nibras/config.json</code>. Run{' '}
            <code className={styles.inlineCode}>nibras whoami</code> to confirm.
          </p>
        </Section>

        {/* ── 4. Create a course ────────────────────────────────────────────── */}
        <Section number="04" title="Create a course (web)">
          <p className={styles.bodyText}>
            Before students can use the CLI, you need to create a course and at least one project
            from the web dashboard.
          </p>
          <ol className={styles.steps}>
            <li>
              Go to <strong>Instructor → New Course</strong> in the dashboard
            </li>
            <li>
              Fill in the course code (e.g. <code className={styles.inlineCode}>cs101</code>),
              title, and term
            </li>
            <li>Add a project milestone with an allowed file path pattern</li>
            <li>
              Copy the project key (e.g.{' '}
              <code className={styles.inlineCode}>cs101/assignment-1</code>)
            </li>
          </ol>
          <Link href="/instructor/courses/new" className={styles.btnPrimary}>
            Open course creator →
          </Link>
        </Section>

        {/* ── 5. Set up a project ───────────────────────────────────────────── */}
        <Section number="05" title="Set up a project locally">
          <p className={styles.bodyText}>
            Run <code className={styles.inlineCode}>nibras setup</code> with the project key to
            bootstrap the local project directory. This creates a{' '}
            <code className={styles.inlineCode}>.nibras/project.json</code> manifest and initialises
            a git repository.
          </p>
          <CliCodeBlock code="nibras setup --project cs101/assignment-1" />
          <div className={styles.terminalWrapper}>
            <TerminalMockup title="nibras setup" lines={setupOutput} />
          </div>
          <p className={styles.hint}>
            You can also specify a target directory:{' '}
            <code className={styles.inlineCode}>
              nibras setup --project cs101/a1 --dir ~/projects/a1
            </code>
          </p>
        </Section>

        {/* ── 6. Run tests ──────────────────────────────────────────────────── */}
        <Section number="06" title="Run local tests">
          <p className={styles.bodyText}>
            Use <code className={styles.inlineCode}>nibras test</code> to run the public test suite
            defined in the project manifest. Pass{' '}
            <code className={styles.inlineCode}>--previous</code> to include tests from earlier
            milestones.
          </p>
          <CliCodeBlock
            code={`nibras test\nnibras test --previous   # include previous milestone tests`}
          />
          <p className={styles.hint}>
            Tests run the command defined in{' '}
            <code className={styles.inlineCode}>.nibras/project.json → test.command</code>. A
            non-zero exit code means tests failed.
          </p>
        </Section>

        {/* ── 7. Submit ─────────────────────────────────────────────────────── */}
        <Section number="07" title="Submit your solution">
          <p className={styles.bodyText}>
            <code className={styles.inlineCode}>nibras submit</code> stages the allowed files,
            creates a commit, pushes to the origin, and waits for automated verification.
          </p>
          <CliCodeBlock code="nibras submit" />
          <div className={styles.terminalWrapper}>
            <TerminalMockup title="nibras submit" lines={submitOutput} />
          </div>
          <div className={styles.callout}>
            <span className={styles.calloutIcon}>💡</span>
            <p>
              Only files matching <code className={styles.inlineCode}>submission.allowedPaths</code>{' '}
              in your manifest are included. Students cannot accidentally submit test infrastructure
              or grading files.
            </p>
          </div>
        </Section>

        {/* ── 8. Check status ───────────────────────────────────────────────── */}
        <Section number="08" title="Check status">
          <p className={styles.bodyText}>Two diagnostic commands are available at any time:</p>
          <CliCodeBlock
            code={`nibras ping    # check API, auth, GitHub, and repo state\nnibras whoami  # show signed-in user and linked GitHub account`}
          />
          <p className={styles.hint}>
            <code className={styles.inlineCode}>nibras ping</code> shows a colour-coded status
            table. Green means all systems go; red means something needs attention.
          </p>
        </Section>

        {/* ── 9. Share with students ────────────────────────────────────────── */}
        <Section number="09" title="Share with students">
          <p className={styles.bodyText}>
            Students follow the exact same flow: install the CLI, run{' '}
            <code className={styles.inlineCode}>nibras login</code>, and{' '}
            <code className={styles.inlineCode}>nibras setup --project &lt;key&gt;</code>. Share the
            project key with your class.
          </p>
          <div className={styles.shareCard}>
            <div className={styles.shareCardTitle}>Student quick-start</div>
            <CliCodeBlock
              code={`npm install -g @nibras/cli\nnibras login\nnibras setup --project cs101/assignment-1\nnibras test\nnibras submit`}
            />
          </div>
          <p className={styles.hint}>
            Students can view the full task instructions at any time with{' '}
            <code className={styles.inlineCode}>nibras task</code>.
          </p>
        </Section>

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
  );
}
