const { runCommand } = require("./exec");

async function pingRemote(remote) {
  if (!remote) {
    throw new Error("submitRemote is required. Set it in .praxis.json or PRAXIS_SUBMIT_REMOTE.");
  }
  const result = await runCommand("git", ["ls-remote", remote]);
  if (result.code !== 0) {
    throw new Error(result.stderr || "Failed to reach remote.");
  }
  return result.stdout.trim();
}

module.exports = { pingRemote };
