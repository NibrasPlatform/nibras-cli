const fs = require("fs");
const path = require("path");
const { runCommand } = require("./exec");

function normalizeFileList(files) {
  if (!files) return [];
  if (Array.isArray(files)) return files.filter(Boolean);
  if (typeof files === "string") return [files];
  return [];
}

async function getGitTrackedFiles(cwd) {
  const { code, stdout, stderr } = await runCommand("git", ["ls-files"], { cwd });
  if (code !== 0) {
    throw new Error(stderr || "Failed to list git tracked files.");
  }
  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function readCs50YamlFileList(cwd) {
  const yamlPath = path.join(cwd, ".cs50.yaml");
  if (!fs.existsSync(yamlPath)) return null;
  const lines = fs.readFileSync(yamlPath, "utf8").split("\n");
  const index = lines.findIndex((line) => line.trim().startsWith("files:"));
  if (index === -1) return null;
  const afterColon = lines[index].split(":").slice(1).join(":").trim();
  if (afterColon.startsWith("[")) {
    try {
      return JSON.parse(afterColon.replace(/'/g, "\""));
    } catch {
      return null;
    }
  }
  if (afterColon) return [afterColon];

  const files = [];
  for (let i = index + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (!line.startsWith(" ") && !line.startsWith("\t")) break;
    const trimmed = line.trim();
    if (trimmed.startsWith("-")) {
      const value = trimmed.replace(/^-+\s*/, "");
      if (value) files.push(value);
    } else {
      break;
    }
  }
  return files.length > 0 ? files : null;
}

async function resolveFilesToSubmit(cwd, cliFiles) {
  const explicit = normalizeFileList(cliFiles);
  if (explicit.length > 0) return explicit;

  const yamlFiles = readCs50YamlFileList(cwd);
  if (yamlFiles && yamlFiles.length > 0) return yamlFiles;

  return getGitTrackedFiles(cwd);
}

module.exports = {
  resolveFilesToSubmit
};
