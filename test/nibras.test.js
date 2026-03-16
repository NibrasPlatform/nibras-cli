const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { autoCheck } = require("../src/autoCheck");
const { run } = require("../src/cli");
const { loadConfig } = require("../src/config");
const { resolveManualScore } = require("../src/manualGrade");
const { setupProject } = require("../src/setup");
const { submit } = require("../src/submit");
const { updateBuildpack } = require("../src/updateBuildpack");

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "nibras-test-"));
}

function withEnv(overrides, fn) {
  const previous = {};
  const restore = () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };

  for (const [key, value] of Object.entries(overrides)) {
    previous[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    const result = fn();
    if (result && typeof result.then === "function") {
      return result.finally(restore);
    }
    restore();
    return result;
  } catch (err) {
    restore();
    throw err;
  }
}

async function captureLogs(fn) {
  const lines = [];
  const original = console.log;
  console.log = (...args) => {
    lines.push(args.join(" "));
  };

  try {
    await fn();
  } finally {
    console.log = original;
  }

  return lines;
}

function commandExists(command) {
  const result = spawnSync("sh", ["-lc", `command -v ${command}`], {
    encoding: "utf8"
  });
  return result.status === 0;
}

test("loadConfig keeps file values when env overrides are absent", () => {
  const dir = makeTempDir();
  fs.writeFileSync(
    path.join(dir, ".nibras.json"),
    JSON.stringify({
      slug: "org/repo",
      submitRemote: "git@example.com:course/submissions.git",
      taskUrlBase: "https://tasks.example.test",
      gradingRoot: "/tmp/grading"
    })
  );

  const config = withEnv(
    {
      NIBRAS_SLUG: undefined,
      NIBRAS_SUBMIT_REMOTE: undefined,
      NIBRAS_TASK_URL_BASE: undefined,
      NIBRAS_GRADING_ROOT: undefined
    },
    () => loadConfig(dir)
  );

  assert.equal(config.slug, "org/repo");
  assert.equal(config.submitRemote, "git@example.com:course/submissions.git");
  assert.equal(config.taskUrlBase, "https://tasks.example.test");
  assert.equal(config.gradingRoot, "/tmp/grading");
});

test("loadConfig still lets explicit env vars override file config", () => {
  const dir = makeTempDir();
  fs.writeFileSync(
    path.join(dir, ".nibras.json"),
    JSON.stringify({
      slug: "file/slug",
      submitRemote: "git@example.com:file.git"
    })
  );

  const config = withEnv(
    {
      NIBRAS_SLUG: "env/slug",
      NIBRAS_SUBMIT_REMOTE: "git@example.com:env.git"
    },
    () => loadConfig(dir)
  );

  assert.equal(config.slug, "env/slug");
  assert.equal(config.submitRemote, "git@example.com:env.git");
});

test("updateBuildpack preserves unrelated config fields", () => {
  const dir = makeTempDir();
  const configPath = path.join(dir, ".nibras.json");
  fs.writeFileSync(
    configPath,
    JSON.stringify({
      submitRemote: "git@example.com:course/submissions.git",
      subjects: {
        cs161: {
          projects: {
            exam1: {
              type: "check"
            }
          }
        }
      }
    })
  );

  withEnv(
    {
      NIBRAS_SLUG: undefined,
      NIBRAS_SUBMIT_REMOTE: undefined,
      NIBRAS_TASK_URL_BASE: undefined,
      NIBRAS_GRADING_ROOT: undefined
    },
    () => updateBuildpack({ cwd: dir, nodeVersion: "20" })
  );

  const updated = JSON.parse(fs.readFileSync(configPath, "utf8"));
  assert.equal(updated.buildpack.node, "20");
  assert.equal(updated.submitRemote, "git@example.com:course/submissions.git");
  assert.ok(updated.subjects.cs161.projects.exam1);
});

test("autoCheck normalizes whitespace and uses answersDir", () => {
  const dir = makeTempDir();
  const projectDir = path.join(dir, "exam1");
  const answersDir = path.join(dir, "answers");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(answersDir, { recursive: true });

  fs.writeFileSync(
    path.join(projectDir, "grading.json"),
    JSON.stringify({
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          points: 60,
          answerFile: "q1.txt",
          solutions: ["The quick brown fox"]
        },
        {
          id: "q2",
          points: 40,
          answerFile: "q2.txt",
          solutions: ["Answer B"]
        }
      ]
    })
  );
  fs.writeFileSync(path.join(answersDir, "q1.txt"), "The   quick\nbrown   fox\n");
  fs.writeFileSync(path.join(answersDir, "q2.txt"), "Wrong");

  const result = autoCheck({
    cwd: dir,
    projectPath: "exam1",
    gradingFile: "grading.json",
    answersDir,
    requireGrading: true
  });

  assert.equal(result.used, true);
  assert.equal(result.earnedPoints, 60);
  assert.equal(result.totalPoints, 100);
  assert.equal(result.percentage, 60);
  assert.deepEqual(
    result.results.map((entry) => ({ id: entry.id, matched: entry.matched })),
    [
      { id: "q1", matched: true },
      { id: "q2", matched: false }
    ]
  );
});

test("autoCheck throws when grading is required but missing", () => {
  const dir = makeTempDir();
  fs.mkdirSync(path.join(dir, "exam1"), { recursive: true });

  assert.throws(
    () =>
      autoCheck({
        cwd: dir,
        projectPath: "exam1",
        gradingFile: "grading.json",
        requireGrading: true
      }),
    /grading\.json not found/
  );
});

test("resolveManualScore sums scores from scores.json", () => {
  const dir = makeTempDir();
  const projectDir = path.join(dir, "exam1");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.writeFileSync(
    path.join(projectDir, "scores.json"),
    JSON.stringify({
      scores: [
        { earned: 30, points: 40 },
        { earned: 25, points: 60 }
      ]
    })
  );

  const score = resolveManualScore({
    cwd: dir,
    project: "exam1",
    projectConfig: {
      path: "exam1"
    }
  });

  assert.equal(score.earnedPoints, 55);
  assert.equal(score.totalPoints, 100);
});

test("submit works without relying on global git identity", async () => {
  const root = makeTempDir();
  const remote = path.join(root, "remote.git");
  const work = path.join(root, "work");
  const isolatedHome = path.join(root, "home");
  const isolatedXdg = path.join(root, "xdg");

  fs.mkdirSync(work, { recursive: true });
  fs.mkdirSync(isolatedHome, { recursive: true });
  fs.mkdirSync(isolatedXdg, { recursive: true });
  fs.writeFileSync(path.join(work, "answer.txt"), "42");

  const init = spawnSync("git", ["init", "--bare", remote], {
    encoding: "utf8"
  });
  assert.equal(init.status, 0, init.stderr);

  await withEnv(
    {
      HOME: isolatedHome,
      XDG_CONFIG_HOME: isolatedXdg,
      GIT_CONFIG_NOSYSTEM: "1"
    },
    () =>
      submit({
        cwd: work,
        submissionRef: "cs161/exam1",
        submitRemote: remote,
        files: ["answer.txt"]
      })
  );

  const showRef = spawnSync("git", ["--git-dir", remote, "show-ref", "refs/heads/submit/cs161/exam1"], {
    encoding: "utf8"
  });
  assert.equal(showRef.status, 0, showRef.stderr);
  assert.match(showRef.stdout, /refs\/heads\/submit\/cs161\/exam1/);
});

test("run test uses config-backed auto-check flow", async () => {
  const dir = makeTempDir();
  const gradingRoot = path.join(dir, "grading");
  const answersDir = path.join(dir, "answers");
  fs.mkdirSync(path.join(gradingRoot, "cs161", "exam1"), { recursive: true });
  fs.mkdirSync(answersDir, { recursive: true });

  fs.writeFileSync(
    path.join(dir, ".nibras.json"),
    JSON.stringify({
      requireGrading: true,
      gradingRoot,
      subjects: {
        cs161: {
          projects: {
            exam1: {
              type: "check",
              path: "student/exam1"
            }
          }
        }
      }
    })
  );

  fs.writeFileSync(
    path.join(gradingRoot, "cs161", "exam1", "grading.json"),
    JSON.stringify({
      totalPoints: 100,
      questions: [
        {
          id: "q1",
          points: 100,
          answerFile: "q1.txt",
          solutions: ["correct"]
        }
      ]
    })
  );
  fs.writeFileSync(path.join(answersDir, "q1.txt"), "correct");

  const previousCwd = process.cwd();
  const previousExitCode = process.exitCode;
  process.chdir(dir);
  process.exitCode = undefined;

  try {
    const logs = await captureLogs(() =>
      run(["node", "bin/nibras.js", "cs161", "test", "exam1", "--answers-dir", answersDir])
    );

    assert.equal(process.exitCode, undefined);
    assert.match(logs.join("\n"), /Auto-check: 100\/100 \(100%\)/);
    assert.match(logs.join("\n"), /q1: .*PASS/);
  } finally {
    process.chdir(previousCwd);
    process.exitCode = previousExitCode;
  }
});

test("setupProject extracts a local zip archive", async (t) => {
  if (!commandExists("zip") || !commandExists("unzip")) {
    t.skip("zip/unzip are required for this test");
    return;
  }

  const dir = makeTempDir();
  const sourceDir = path.join(dir, "source");
  const destDir = path.join(dir, "dest");
  const zipPath = path.join(dir, "bundle.zip");

  fs.mkdirSync(sourceDir, { recursive: true });
  fs.writeFileSync(path.join(sourceDir, "fixture.txt"), "hello");

  const zip = spawnSync("zip", ["-q", zipPath, "fixture.txt"], {
    cwd: sourceDir,
    encoding: "utf8"
  });
  assert.equal(zip.status, 0, zip.stderr);

  await setupProject({
    cwd: dir,
    subject: "cs161",
    project: "exam1",
    projectConfig: {
      setupUrl: zipPath,
      setupDir: destDir
    },
    subjectConfig: {}
  });

  assert.equal(fs.readFileSync(path.join(destDir, "fixture.txt"), "utf8"), "hello");
});
