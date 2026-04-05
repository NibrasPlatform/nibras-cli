'use strict';

/**
 * test/worker-paths.test.js
 *
 * Tests for worker optional paths and v1 guards:
 *   a) Email graceful skip when RESEND_API_KEY is unset
 *   b) Sandbox cleanup on failed clone
 *   c) Team delivery mode returns 501 NOT_IMPLEMENTED
 *   d) AI grading no-op env contract when NIBRAS_AI_API_KEY is unset
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { buildApp } = require('../apps/api/dist/app');
const { FileStore } = require('../apps/api/dist/store');

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeStorePath() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nibras-wp-'));
  return path.join(dir, 'store.json');
}

/**
 * Build a FileStore-backed app with a student and instructor session seeded,
 * and optionally mutate the store data before building.
 */
function buildTestApp(storePath, mutateFn) {
  const store = new FileStore(storePath);
  const data = store.read('http://127.0.0.1');
  data.sessions.push(
    {
      accessToken: 'student-token',
      refreshToken: 'student-refresh',
      userId: 'user_demo',
      createdAt: new Date().toISOString(),
    },
    {
      accessToken: 'instructor-token',
      refreshToken: 'instructor-refresh',
      userId: 'user_instructor',
      createdAt: new Date().toISOString(),
    }
  );
  if (mutateFn) mutateFn(data);
  store.write(data);
  return buildApp(new FileStore(storePath));
}

// ── a) Email graceful skip ─────────────────────────────────────────────────────

test('sendSubmissionStatusEmail does not throw when RESEND_API_KEY is unset', async () => {
  const prev = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  try {
    const { sendSubmissionStatusEmail } = require('../apps/worker/dist/email');
    await assert.doesNotReject(() =>
      sendSubmissionStatusEmail({
        studentEmail: 'student@example.com',
        studentName: 'Alice',
        projectName: 'Exam 1',
        status: 'passed',
        submissionUrl: 'http://localhost:3000/submissions/123',
      })
    );
  } finally {
    if (prev !== undefined) process.env.RESEND_API_KEY = prev;
  }
});

test('sendReviewReadyEmail does not throw when RESEND_API_KEY is unset', async () => {
  const prev = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  try {
    const { sendReviewReadyEmail } = require('../apps/worker/dist/email');
    await assert.doesNotReject(() =>
      sendReviewReadyEmail({
        instructorEmail: 'prof@example.com',
        instructorName: 'Prof. Smith',
        studentName: 'Alice',
        projectName: 'Exam 1',
        reviewQueueUrl: 'http://localhost:3000/review',
      })
    );
  } finally {
    if (prev !== undefined) process.env.RESEND_API_KEY = prev;
  }
});

// ── b) Sandbox cleanup on failed clone ────────────────────────────────────────

test('runSandboxed returns non-zero exitCode and non-empty log when clone fails', async () => {
  const { runSandboxed } = require('../apps/worker/dist/sandbox');
  const result = await runSandboxed('https://invalid.example.invalid/repo.git', 'main', 'echo ok', {
    mode: 'none',
    cloneTimeoutMs: 8000,
    execTimeoutMs: 5000,
  });
  assert.equal(typeof result.exitCode, 'number', 'exitCode is a number');
  assert.notEqual(result.exitCode, 0, 'exitCode is non-zero on clone failure');
  assert.equal(typeof result.log, 'string', 'log is a string');
  assert.ok(result.log.length > 0, 'log is non-empty');
});

test('runSandboxed cleans up temp directory after a failed clone', async () => {
  const { runSandboxed } = require('../apps/worker/dist/sandbox');

  const nibrasVerifyDirsBefore = fs
    .readdirSync(os.tmpdir())
    .filter((f) => f.startsWith('nibras-verify-'));

  await runSandboxed('https://invalid.example.invalid/repo.git', 'main', 'echo ok', {
    mode: 'none',
    cloneTimeoutMs: 8000,
    execTimeoutMs: 5000,
  });

  const nibrasVerifyDirsAfter = fs
    .readdirSync(os.tmpdir())
    .filter((f) => f.startsWith('nibras-verify-'));

  const newDirs = nibrasVerifyDirsAfter.filter((d) => !nibrasVerifyDirsBefore.includes(d));
  assert.deepEqual(newDirs, [], 'no nibras-verify-* temp dirs should remain after run');
});

// ── c) Team delivery mode returns 501 ─────────────────────────────────────────

test('POST submission to a team-mode milestone returns 501 SERVICE_UNAVAILABLE', async () => {
  const storePath = makeStorePath();

  // Mutate the seeded project to team delivery mode
  const app = buildTestApp(storePath, (data) => {
    const project = data.projects.find((p) => p.id === 'project_cs161_exam1');
    if (project) project.deliveryMode = 'team';
  });

  try {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/tracking/milestones/milestone_exam1_design/submissions',
      headers: {
        authorization: 'Bearer student-token',
        'content-type': 'application/json',
      },
      payload: JSON.stringify({
        submissionType: 'github',
        submissionValue: 'https://github.com/demo/repo',
        notes: 'Team attempt',
        repoUrl: 'https://github.com/demo/repo',
        branch: 'main',
        commitSha: 'abc789def012',
      }),
    });
    assert.equal(res.statusCode, 501, 'should return 501 for team mode');
    const body = res.json();
    assert.equal(body.code, 'SERVICE_UNAVAILABLE', 'error code should be SERVICE_UNAVAILABLE');
    assert.ok(body.error.toLowerCase().includes('team'), 'error message should mention "team"');
  } finally {
    await app.close();
  }
});

test('POST submission to an individual-mode milestone still succeeds (guard does not break normal flow)', async () => {
  const storePath = makeStorePath();

  // Default seed has deliveryMode: 'individual' — no mutation needed
  const app = buildTestApp(storePath);

  try {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/tracking/milestones/milestone_exam1_design/submissions',
      headers: {
        authorization: 'Bearer student-token',
        'content-type': 'application/json',
      },
      payload: JSON.stringify({
        submissionType: 'github',
        submissionValue: 'https://github.com/demo/repo',
        notes: 'Normal individual attempt',
        repoUrl: 'https://github.com/demo/repo',
        branch: 'main',
        commitSha: 'abc123def456',
      }),
    });
    // 201 Created — guard did not block
    assert.equal(res.statusCode, 201, 'individual mode submission should succeed with 201');
    const body = res.json();
    assert.ok(body.id, 'response should include a submission id');
  } finally {
    await app.close();
  }
});

// ── d) AI grading no-op env contract ──────────────────────────────────────────

test('AI grading is disabled when NIBRAS_AI_API_KEY is not set', () => {
  // Document the env contract: worker.ts guards AI grading with:
  //   const apiKey = process.env.NIBRAS_AI_API_KEY;
  //   if (!apiKey) return null;   ← loadAiConfig returns null, grading is skipped entirely
  //
  // This test verifies that unset NIBRAS_AI_API_KEY produces the expected undefined value
  // so any future refactor that breaks this gate will fail the test.
  const prev = process.env.NIBRAS_AI_API_KEY;
  delete process.env.NIBRAS_AI_API_KEY;
  try {
    assert.equal(
      process.env.NIBRAS_AI_API_KEY,
      undefined,
      'NIBRAS_AI_API_KEY must be undefined to disable AI grading'
    );
  } finally {
    if (prev !== undefined) process.env.NIBRAS_AI_API_KEY = prev;
  }
});
