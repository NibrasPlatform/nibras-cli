const test = require("node:test");
const assert = require("node:assert/strict");

test("dashboard data loading skips install-url when GitHub App is not configured", async () => {
  const { loadDashboardData } = await import("../apps/web/app/(app)/dashboard/load-dashboard-data.js");
  const calls = [];

  const payload = await loadDashboardData({
    fetchJson: async (path) => {
      calls.push(path);
      if (path === "/v1/web/session") {
        return { user: { username: "student", githubAppInstalled: false } };
      }
      if (path === "/v1/tracking/dashboard/student") {
        return { projects: [], milestonesByProject: {}, statsByProject: {}, activity: [] };
      }
      if (path === "/v1/github/config") {
        return { configured: false };
      }
      throw new Error(`Unexpected path: ${path}`);
    }
  });

  assert.equal(payload.installUrl, "");
  assert.equal(payload.githubAppMessage, "GitHub App installation is not configured for this deployment.");
  assert.deepEqual(calls, [
    "/v1/web/session",
    "/v1/tracking/dashboard/student",
    "/v1/github/config"
  ]);
});

test("dashboard data loading preserves the dashboard when install-url fails", async () => {
  const { loadDashboardData } = await import("../apps/web/app/(app)/dashboard/load-dashboard-data.js");

  const payload = await loadDashboardData({
    fetchJson: async (path) => {
      if (path === "/v1/web/session") {
        return { user: { username: "student", githubAppInstalled: false } };
      }
      if (path === "/v1/tracking/dashboard/student") {
        return { projects: [{ id: "p1" }], milestonesByProject: {}, statsByProject: {}, activity: [] };
      }
      if (path === "/v1/github/config") {
        return { configured: true };
      }
      if (path === "/v1/github/install-url") {
        throw new Error("GitHub App is not configured.");
      }
      throw new Error(`Unexpected path: ${path}`);
    }
  });

  assert.deepEqual(payload.dashboard.projects, [{ id: "p1" }]);
  assert.equal(payload.installUrl, "");
  assert.equal(payload.githubAppMessage, "GitHub App is not configured.");
});
