import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ProjectSetupResponseSchema } from '@nibras/contracts';
import { apiRequest, writeProjectManifest, writeTaskText } from '@nibras/core';
import { createSpinner } from '../ui/spinner';
import { printBox } from '../ui/box';

function parseOption(args: string[], name: string): string | null {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] || null;
}

function isGitHubCloneUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return url.startsWith('https://github.com/') || url.startsWith('git@github.com:');
}

export async function commandSetup(args: string[], plain: boolean): Promise<void> {
  const projectKey = parseOption(args, '--project');
  if (!projectKey) {
    throw new Error('setup requires --project <subject/project>.');
  }

  const explicitDir = parseOption(args, '--dir');
  const baseDir = path.resolve(explicitDir || process.cwd());
  const spinner = createSpinner(`Setting up project ${projectKey}`, plain);

  const response = ProjectSetupResponseSchema.parse(
    await apiRequest(`/v1/projects/${encodeURIComponent(projectKey)}/setup`, {
      method: 'POST',
    })
  );

  const cloneUrl = response.repo.cloneUrl;
  const templateCloneUrl = response.templateCloneUrl ?? null;
  const repoName = response.repo.name;
  const defaultBranch = response.repo.defaultBranch;

  // Determine the final project directory:
  //   - If --dir was explicitly given, use it as-is
  //   - Otherwise always create a named subdirectory (nibras-<project>)
  const projectDir = explicitDir ? baseDir : path.join(baseDir, repoName);

  const alreadyHasGit = fs.existsSync(path.join(projectDir, '.git'));
  fs.mkdirSync(projectDir, { recursive: true });

  if (isGitHubCloneUrl(cloneUrl) && !alreadyHasGit) {
    // ── Clone student's personal repo (GitHub App provisioned) ───────────
    spinner.text(`Cloning ${response.repo.owner}/${repoName}`);
    const cloneResult = spawnSync('git', ['clone', cloneUrl, projectDir], {
      stdio: 'ignore',
    });
    if (cloneResult.status !== 0) {
      spinner.text('Clone failed, initialising git repository');
      spawnSync('git', ['init', '-b', defaultBranch], { cwd: projectDir, stdio: 'ignore' });
    }
  } else if (isGitHubCloneUrl(templateCloneUrl) && !alreadyHasGit) {
    // ── Clone public template as starter (no GitHub App installed) ────────
    spinner.text('Cloning starter template');
    const cloneResult = spawnSync('git', ['clone', templateCloneUrl, projectDir], {
      stdio: 'ignore',
    });
    if (cloneResult.status !== 0) {
      spinner.text('Template clone failed, initialising git repository');
      spawnSync('git', ['init', '-b', defaultBranch], { cwd: projectDir, stdio: 'ignore' });
    } else {
      // Re-init to detach from template remote history
      spawnSync('git', ['remote', 'remove', 'origin'], { cwd: projectDir, stdio: 'ignore' });
    }
    // Set branch name to match project default
    spawnSync('git', ['checkout', '-B', defaultBranch], { cwd: projectDir, stdio: 'ignore' });
  } else if (!alreadyHasGit) {
    // ── No clone URL at all — bare git init ───────────────────────────────
    spinner.text('Initialising git repository');
    spawnSync('git', ['init', '-b', defaultBranch], { cwd: projectDir, stdio: 'ignore' });
  }

  // ── Write manifest and task ───────────────────────────────────────────
  spinner.text('Writing project manifest');
  fs.mkdirSync(path.join(projectDir, '.nibras'), { recursive: true });
  writeProjectManifest(projectDir, response.manifest);
  writeTaskText(projectDir, response.task);

  spinner.succeed('Project set up');

  const relDir = path.relative(process.cwd(), projectDir) || '.';
  const isSubdir = relDir !== '.';

  printBox(
    `Project ready: ${response.projectKey}`,
    [
      `Project: ${response.projectKey}`,
      `Repo:    ${response.repo.owner}/${repoName}`,
      `Dir:     ${projectDir}`,
      ``,
      `Next steps:`,
      ...(isSubdir ? [`  cd ${relDir}`] : []),
      `  nibras task     — view task instructions`,
      `  nibras test     — run local tests`,
      `  nibras submit   — submit your solution`,
    ],
    'success',
    plain
  );
}
