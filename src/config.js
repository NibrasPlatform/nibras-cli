const fs = require("fs");
const path = require("path");

const DEFAULT_CONFIG = {
  slug: "",
  submitRemote: "",
  taskUrlBase: "",
  localChecks: true,
  requireGrading: false,
  subjects: {},
  buildpack: {
    node: "18"
  }
};

function readEnvOverride(name) {
  return Object.prototype.hasOwnProperty.call(process.env, name) ? process.env[name] : undefined;
}

function definedEntries(entries) {
  return Object.fromEntries(entries.filter(([, value]) => value !== undefined));
}

function readJsonIfExists(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

function loadConfig(cwd) {
  const configPath = path.join(cwd, ".nibras.json");
  const fileConfig = readJsonIfExists(configPath) || {};
  const envConfig = definedEntries([
    ["slug", readEnvOverride("NIBRAS_SLUG")],
    ["submitRemote", readEnvOverride("NIBRAS_SUBMIT_REMOTE")],
    ["taskUrlBase", readEnvOverride("NIBRAS_TASK_URL_BASE")],
    ["gradingRoot", readEnvOverride("NIBRAS_GRADING_ROOT")]
  ]);
  return {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    ...envConfig,
    buildpack: {
      ...DEFAULT_CONFIG.buildpack,
      ...(fileConfig.buildpack || {})
    }
  };
}

function writeConfig(cwd, config) {
  const configPath = path.join(cwd, ".nibras.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = {
  loadConfig,
  writeConfig
};
