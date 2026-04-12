const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const readmePath = path.join(repoRoot, 'README.md');
const onboardingPath = path.join(
  repoRoot,
  'apps',
  'web',
  'app',
  '(app)',
  'instructor',
  'onboarding',
  'page.tsx'
);
const packageJsonPath = path.join(repoRoot, 'package.json');

function runCli(args) {
  return execFileSync('node', [path.join(repoRoot, 'bin', 'nibras.js'), ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function getPublicCommands() {
  const helpText = runCli(['--help']);
  const commandsBlock = helpText.match(/COMMANDS\s+([\s\S]*?)\n\s+FLAGS/);
  assert.ok(commandsBlock, 'CLI help should contain a COMMANDS section');

  return commandsBlock[1]
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.match(/^([a-z-]+)\s{2,}/))
    .filter(Boolean)
    .map((match) => match[1]);
}

function commandDocSnippet(command) {
  if (command === 'setup') return 'nibras setup --project';
  if (command === 'update') return 'nibras update --version';
  if (command === 'update-buildpack') return 'nibras update-buildpack --node';
  if (command === 'legacy') return 'nibras legacy';
  return `nibras ${command}`;
}

test('README and onboarding docs cover every public CLI command', () => {
  const commands = getPublicCommands();
  const readme = fs.readFileSync(readmePath, 'utf8');
  const onboarding = fs.readFileSync(onboardingPath, 'utf8');

  for (const command of commands) {
    const snippet = commandDocSnippet(command);
    assert.match(readme, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(onboarding, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('CLI install docs stay pinned to the current package tag and limitations', () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const documentedTag = `v${pkg.version}`;
  const runtimeVersion = runCli(['--version']).trim();
  const readme = fs.readFileSync(readmePath, 'utf8');
  const onboarding = fs.readFileSync(onboardingPath, 'utf8');

  assert.equal(pkg.version, '1.0.2');
  assert.ok(
    runtimeVersion.startsWith(documentedTag),
    `Expected runtime version ${runtimeVersion} to start with ${documentedTag}`
  );

  assert.match(readme, /git\+https:\/\/github\.com\/NibrasPlatform\/nibras-cli\.git#v1\.0\.2/);
  assert.match(onboarding, /git\+https:\/\/github\.com\/NibrasPlatform\/nibras-cli\.git#v1\.0\.2/);
  assert.match(readme, /Avoid `nibras update --check` for now\./);
  assert.match(onboarding, /CLI Command Reference/);
  assert.match(
    onboarding,
    /Avoid <code className=\{styles\.inlineCode\}>nibras update --check<\/code> for now\./
  );
  assert.doesNotMatch(readme, /Install the published package:/);
});
