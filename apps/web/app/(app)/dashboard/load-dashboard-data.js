export async function loadDashboardData({ fetchJson, mode }) {
  const path = mode
    ? `/v1/tracking/dashboard/home?mode=${encodeURIComponent(mode)}`
    : '/v1/tracking/dashboard/home';
  return await fetchJson(path, { auth: true });
}
