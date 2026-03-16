const fs = require("fs");
const os = require("os");
const path = require("path");
const { runCommand } = require("./exec");
const { resolveFilesToSubmit } = require("./filelist");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFileIntoTemp(cwd, file, tempRoot) {
  const src = path.join(cwd, file);
  const dest = path.join(tempRoot, file);
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

async function submit({ cwd, submissionRef, submitRemote, files }) {
  if (!submitRemote) {
    throw new Error("submitRemote is required. Set it in .nibras.json or NIBRAS_SUBMIT_REMOTE.");
  }
  if (!submissionRef) {
    throw new Error("submissionRef is required. Configure a slug or use subject/project.");
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codecraft-submit-"));
  const fileList = await resolveFilesToSubmit(cwd, files);
  if (fileList.length === 0) {
    throw new Error("No files found to submit.");
  }
  fileList.forEach((file) => copyFileIntoTemp(cwd, file, tempRoot));

  await runCommand("git", ["init"], { cwd: tempRoot });
  await runCommand("git", ["add", "."], { cwd: tempRoot });
  await runCommand("git", ["commit", "-m", "submit"], { cwd: tempRoot });

  const branch = `submit/${submissionRef}`;
  const push = await runCommand("git", ["push", submitRemote, `HEAD:refs/heads/${branch}`], {
    cwd: tempRoot
  });
  if (push.code !== 0) {
    throw new Error(push.stderr || "Failed to push submission.");
  }
  return { branch, files: fileList.length };
}

module.exports = { submit };
