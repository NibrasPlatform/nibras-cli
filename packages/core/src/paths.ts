import os from "node:os";
import path from "node:path";

export function getDefaultApiBaseUrl(): string {
  return process.env.PRAXIS_API_BASE_URL || "http://127.0.0.1:4848";
}

export function getGlobalConfigDir(): string {
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "praxis");
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "praxis");
  }
  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "praxis");
}

export function getGlobalConfigPath(): string {
  return path.join(getGlobalConfigDir(), "config.json");
}
