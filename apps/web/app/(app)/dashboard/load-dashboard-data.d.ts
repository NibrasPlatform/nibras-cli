import type { DashboardHomeResponse } from '@nibras/contracts';

type FetchJson = (path: string, init?: RequestInit & { auth?: boolean }) => Promise<unknown>;

export type LoadDashboardDataResult = DashboardHomeResponse;

export function loadDashboardData(args: {
  fetchJson: FetchJson;
  mode?: 'student' | 'instructor' | null;
}): Promise<LoadDashboardDataResult>;
