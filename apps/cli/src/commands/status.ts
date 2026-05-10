import { apiRequest } from '@nibras/core';
import picocolors from 'picocolors';

type SubmissionSummary = {
  id: string;
  projectKey: string;
  status: string;
  summary: string;
  createdAt: string;
  submittedAt: string | null;
};

const STATUS_COLORS: Record<string, (s: string) => string> = {
  passed: picocolors.green,
  failed: picocolors.red,
  needs_review: picocolors.yellow,
  queued: picocolors.dim,
  running: picocolors.cyan,
  cancelled: picocolors.dim,
};

const STATUS_LABELS: Record<string, string> = {
  passed: 'passed',
  failed: 'failed',
  needs_review: 'under review',
  queued: 'queued',
  running: 'running',
  cancelled: 'cancelled',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function commandStatus(plain: boolean): Promise<void> {
  const res = (await apiRequest('/v1/me/submissions')) as {
    submissions?: SubmissionSummary[];
  };
  const submissions = res.submissions ?? [];

  if (submissions.length === 0) {
    if (plain) {
      console.log('No submissions found.');
    } else {
      console.log('\n  ' + picocolors.dim('No submissions yet.') + '\n');
    }
    return;
  }

  if (!plain) {
    console.log();
    console.log(
      '  ' +
        picocolors.dim('Project'.padEnd(30)) +
        picocolors.dim('Status'.padEnd(16)) +
        picocolors.dim('Date')
    );
    console.log('  ' + picocolors.dim('─'.repeat(55)));
  }

  for (const sub of submissions.slice(0, 20)) {
    const statusLabel = STATUS_LABELS[sub.status] ?? sub.status;
    const colorFn = STATUS_COLORS[sub.status] ?? ((s: string) => s);
    const date = formatDate(sub.submittedAt ?? sub.createdAt);

    if (plain) {
      console.log(`${sub.projectKey.padEnd(32)} ${statusLabel.padEnd(14)} ${date}`);
    } else {
      const projectCol = picocolors.white(sub.projectKey.padEnd(30));
      const statusCol = colorFn(statusLabel.padEnd(16));
      const dateCol = picocolors.dim(date);
      console.log(`  ${projectCol}${statusCol}${dateCol}`);
    }
  }

  if (!plain) {
    console.log();
  }
}
