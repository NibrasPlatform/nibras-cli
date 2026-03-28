export async function loadDashboardData({ fetchJson }) {
  const [me, dashboard, githubConfig] = await Promise.all([
    fetchJson("/v1/web/session", { auth: true }),
    fetchJson("/v1/tracking/dashboard/student", { auth: true }),
    fetchJson("/v1/github/config")
  ]);

  let installUrl = "";
  let githubAppMessage = "";

  if (githubConfig.configured) {
    try {
      const installPayload = await fetchJson("/v1/github/install-url", { auth: true });
      installUrl = installPayload.installUrl || "";
    } catch (error) {
      githubAppMessage = error instanceof Error ? error.message : String(error);
    }
  } else {
    githubAppMessage = "GitHub App installation is not configured for this deployment.";
  }

  return {
    me,
    dashboard,
    githubConfig,
    installUrl,
    githubAppMessage
  };
}
