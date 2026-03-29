const fs = require("fs");
const path = require("path");

const DEFAULT_CONFIG = {
  slug: "",
  submitRemote: "",
  taskUrlBase: "",
  localChecks: true,
  requireGrading: false,
  subjects: {},
  ai: {
    provider: "openai",
    model: "",
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    timeoutMs: 30000,
    maxRetries: 2,
    minConfidence: 0.8
  },
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

function readNumberEnvOverride(name) {
  const value = readEnvOverride(name);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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
  const configPath = path.join(cwd, ".praxis.json");
  const fileConfig = readJsonIfExists(configPath) || {};
  const envConfig = definedEntries([
    ["slug", readEnvOverride("PRAXIS_SLUG")],
    ["submitRemote", readEnvOverride("PRAXIS_SUBMIT_REMOTE")],
    ["taskUrlBase", readEnvOverride("PRAXIS_TASK_URL_BASE")],
    ["gradingRoot", readEnvOverride("PRAXIS_GRADING_ROOT")]
  ]);
  const envAiConfig = definedEntries([
    ["provider", readEnvOverride("PRAXIS_AI_PROVIDER")],
    ["model", readEnvOverride("PRAXIS_AI_MODEL")],
    ["apiKey", readEnvOverride("PRAXIS_AI_API_KEY")],
    ["baseUrl", readEnvOverride("PRAXIS_AI_BASE_URL")],
    ["timeoutMs", readNumberEnvOverride("PRAXIS_AI_TIMEOUT_MS")],
    ["maxRetries", readNumberEnvOverride("PRAXIS_AI_MAX_RETRIES")],
    ["minConfidence", readNumberEnvOverride("PRAXIS_AI_MIN_CONFIDENCE")]
  ]);
  return {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    ...envConfig,
    ai: {
      ...DEFAULT_CONFIG.ai,
      ...(fileConfig.ai || {}),
      ...envAiConfig
    },
    buildpack: {
      ...DEFAULT_CONFIG.buildpack,
      ...(fileConfig.buildpack || {})
    }
  };
}

function writeConfig(cwd, config) {
  const configPath = path.join(cwd, ".praxis.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = {
  loadConfig,
  writeConfig
};
