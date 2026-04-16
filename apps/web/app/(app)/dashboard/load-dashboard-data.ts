import type { DashboardHomeResponse } from '@nibras/contracts';

type FetchJson = (path: string, init?: RequestInit & { auth?: boolean }) => Promise<unknown>;

export type LoadDashboardDataResult = DashboardHomeResponse;

export async function loadDashboardData({
  fetchJson,
  mode,
}: {
  fetchJson: FetchJson;
  mode?: 'student' | 'instructor' | null;
}): Promise<LoadDashboardDataResult> {
  const path = mode
    ? `/v1/tracking/dashboard/home?mode=${encodeURIComponent(mode)}`
    : '/v1/tracking/dashboard/home';
  return (await fetchJson(path, { auth: true })) as DashboardHomeResponse;
}
