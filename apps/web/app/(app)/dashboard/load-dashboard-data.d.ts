export function loadDashboardData(args: {
  fetchJson: (path: string, init?: RequestInit & { auth?: boolean }) => Promise<unknown>;
}): Promise<{
  me: unknown;
  dashboard: unknown;
  githubConfig: {
    configured: boolean;
    appName?: string;
    webBaseUrl?: string;
  };
  installUrl: string;
  githubAppMessage: string;
}>;
