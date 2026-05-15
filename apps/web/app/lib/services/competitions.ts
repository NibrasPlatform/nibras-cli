import { serviceFetch } from '../api-clients/service-fetch';

export type Contest = {
  id: string;
  name: string;
  host: 'codeforces' | 'leetcode' | 'atcoder' | 'nibras' | string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  url?: string;
  registered?: boolean;
  reminderSet?: boolean;
  bookmarked?: boolean;
};

export type PracticeProblem = {
  id: string;
  title: string;
  host: string;
  difficulty: number;
  tags: string[];
  url: string;
  solved?: boolean;
  bookmarked?: boolean;
};

export type RankingEntry = {
  rank: number;
  userId: string;
  username: string;
  rating: number;
  delta?: number;
  contestsLast30d?: number;
  badges?: number;
};

export type ContestHistoryEntry = {
  contestId: string;
  name: string;
  startedAt: string;
  rank: number;
  participants: number;
  delta: number;
  ratingAfter: number;
};

export type LinkedAccount = {
  host: 'codeforces' | 'leetcode' | string;
  handle: string;
  verified: boolean;
  linkedAt?: string;
};

// ── Contests ────────────────────────────────────────────────────────────────
export async function listContests(filters: { upcoming?: boolean; host?: string } = {}) {
  return serviceFetch<Contest[]>('competitions', '/contests', {
    auth: true,
    query: filters as Record<string, string | boolean>,
  });
}

export async function setContestReminder(contestId: string, on: boolean) {
  return serviceFetch<{ reminderSet: boolean }>(
    'competitions',
    `/contests/${contestId}/reminder`,
    {
      method: 'POST',
      auth: true,
      body: { on },
    }
  );
}

export async function setContestBookmark(contestId: string, on: boolean) {
  return serviceFetch<{ bookmarked: boolean }>(
    'competitions',
    `/contests/${contestId}/bookmark`,
    {
      method: 'POST',
      auth: true,
      body: { on },
    }
  );
}

// ── Practice problems ───────────────────────────────────────────────────────
export async function listProblems(filters: {
  tag?: string;
  difficultyMin?: number;
  difficultyMax?: number;
  host?: string;
  q?: string;
  page?: number;
  limit?: number;
} = {}) {
  return serviceFetch<{ items: PracticeProblem[]; total: number }>(
    'competitions',
    '/problems',
    {
      auth: true,
      query: filters as Record<string, string | number>,
    }
  );
}

export async function setProblemBookmark(problemId: string, on: boolean) {
  return serviceFetch<{ bookmarked: boolean }>(
    'competitions',
    `/problems/${problemId}/bookmark`,
    {
      method: 'POST',
      auth: true,
      body: { on },
    }
  );
}

// ── Ranking ─────────────────────────────────────────────────────────────────
export async function getRanking(host?: string) {
  return serviceFetch<RankingEntry[]>('competitions', '/ranking', {
    auth: true,
    query: host ? { host } : undefined,
  });
}

// ── History ─────────────────────────────────────────────────────────────────
export async function getMyHistory(host?: string) {
  return serviceFetch<ContestHistoryEntry[]>('competitions', '/me/history', {
    auth: true,
    query: host ? { host } : undefined,
  });
}

// ── Linked accounts ─────────────────────────────────────────────────────────
export async function getLinkedAccounts() {
  return serviceFetch<LinkedAccount[]>('competitions', '/me/accounts', { auth: true });
}

export async function linkAccount(payload: { host: string; handle: string; token?: string }) {
  return serviceFetch<LinkedAccount>('competitions', '/me/accounts', {
    method: 'POST',
    auth: true,
    body: payload as Record<string, unknown>,
  });
}

export async function unlinkAccount(host: string) {
  return serviceFetch<{ unlinked: true }>('competitions', `/me/accounts/${host}`, {
    method: 'DELETE',
    auth: true,
  });
}
