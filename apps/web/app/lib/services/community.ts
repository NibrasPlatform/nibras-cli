import { serviceFetch } from '../api-clients/service-fetch';

export type CommunityAuthor = {
  userId: string;
  username: string;
  avatarUrl?: string;
  reputation?: number;
  badges?: number;
};

export type CommunityQuestion = {
  id: string;
  title: string;
  body: string;
  author: CommunityAuthor;
  tags: string[];
  score: number;
  myVote?: 1 | 0 | -1;
  answerCount: number;
  acceptedAnswerId?: string | null;
  views?: number;
  createdAt: string;
  updatedAt?: string;
};

export type CommunityAnswer = {
  id: string;
  questionId: string;
  body: string;
  author: CommunityAuthor;
  score: number;
  myVote?: 1 | 0 | -1;
  accepted: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type CommunityThread = {
  id: string;
  courseId?: string;
  title: string;
  body?: string;
  author: CommunityAuthor;
  tags: string[];
  replyCount: number;
  pinned: boolean;
  closed: boolean;
  createdAt: string;
  lastActivityAt?: string;
};

export type CommunityPost = {
  id: string;
  threadId: string;
  body: string;
  author: CommunityAuthor;
  score: number;
  myVote?: 1 | 0 | -1;
  createdAt: string;
};

export type CommunityTag = {
  name: string;
  count: number;
  description?: string;
};

export type QuestionFilters = {
  q?: string;
  tag?: string;
  sort?: 'newest' | 'top' | 'unanswered' | 'active';
  page?: number;
  limit?: number;
};

export type ThreadFilters = {
  courseId?: string;
  q?: string;
  tag?: string;
  pinned?: boolean;
  closed?: boolean;
  page?: number;
  limit?: number;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

function toQuery(filters: Record<string, unknown>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value;
    }
  }
  return out;
}

// ── Questions ───────────────────────────────────────────────────────────────
export async function listQuestions(filters: QuestionFilters = {}) {
  return serviceFetch<Paginated<CommunityQuestion>>('community', '/qa/questions', {
    auth: true,
    query: toQuery(filters),
  });
}

export async function getQuestion(questionId: string) {
  return serviceFetch<CommunityQuestion>('community', `/qa/questions/${questionId}`, {
    auth: true,
  });
}

export async function createQuestion(payload: {
  title: string;
  body: string;
  tags?: string[];
}) {
  return serviceFetch<CommunityQuestion>('community', '/qa/questions', {
    method: 'POST',
    auth: true,
    body: payload as Record<string, unknown>,
  });
}

export async function voteQuestion(questionId: string, direction: 1 | -1 | 0) {
  return serviceFetch<{ score: number; myVote: 1 | 0 | -1 }>(
    'community',
    `/qa/questions/${questionId}/vote`,
    {
      method: 'POST',
      auth: true,
      body: { direction },
    }
  );
}

// ── Answers ─────────────────────────────────────────────────────────────────
export async function listAnswers(questionId: string) {
  return serviceFetch<CommunityAnswer[]>('community', `/qa/questions/${questionId}/answers`, {
    auth: true,
  });
}

export async function createAnswer(questionId: string, body: string) {
  return serviceFetch<CommunityAnswer>(
    'community',
    `/qa/questions/${questionId}/answers`,
    {
      method: 'POST',
      auth: true,
      body: { body },
    }
  );
}

export async function voteAnswer(answerId: string, direction: 1 | -1 | 0) {
  return serviceFetch<{ score: number; myVote: 1 | 0 | -1 }>(
    'community',
    `/qa/answers/${answerId}/vote`,
    {
      method: 'POST',
      auth: true,
      body: { direction },
    }
  );
}

export async function acceptAnswer(answerId: string) {
  return serviceFetch<{ accepted: true }>(
    'community',
    `/qa/answers/${answerId}/accept`,
    { method: 'POST', auth: true }
  );
}

// ── Discussions / Threads ───────────────────────────────────────────────────
export async function listThreads(filters: ThreadFilters = {}) {
  return serviceFetch<Paginated<CommunityThread>>('community', '/discussions/threads', {
    auth: true,
    query: toQuery(filters),
  });
}

export async function getThread(threadId: string) {
  return serviceFetch<CommunityThread>('community', `/discussions/threads/${threadId}`, {
    auth: true,
  });
}

export async function createThread(payload: {
  title: string;
  body?: string;
  courseId?: string;
  tags?: string[];
}) {
  return serviceFetch<CommunityThread>('community', '/discussions/threads', {
    method: 'POST',
    auth: true,
    body: payload as Record<string, unknown>,
  });
}

export async function setThreadPinned(threadId: string, pinned: boolean) {
  return serviceFetch<CommunityThread>(
    'community',
    `/discussions/threads/${threadId}/pin`,
    {
      method: 'POST',
      auth: true,
      body: { pinned },
    }
  );
}

export async function setThreadClosed(threadId: string, closed: boolean) {
  return serviceFetch<CommunityThread>(
    'community',
    `/discussions/threads/${threadId}/close`,
    {
      method: 'POST',
      auth: true,
      body: { closed },
    }
  );
}

// ── Posts ───────────────────────────────────────────────────────────────────
export async function listPosts(threadId: string) {
  return serviceFetch<CommunityPost[]>('community', `/discussions/threads/${threadId}/posts`, {
    auth: true,
  });
}

export async function createPost(threadId: string, body: string) {
  return serviceFetch<CommunityPost>(
    'community',
    `/discussions/threads/${threadId}/posts`,
    {
      method: 'POST',
      auth: true,
      body: { body },
    }
  );
}

export async function votePost(postId: string, direction: 1 | -1 | 0) {
  return serviceFetch<{ score: number; myVote: 1 | 0 | -1 }>(
    'community',
    `/discussions/posts/${postId}/vote`,
    {
      method: 'POST',
      auth: true,
      body: { direction },
    }
  );
}

// ── Tags ────────────────────────────────────────────────────────────────────
export async function listTags(): Promise<CommunityTag[]> {
  const data = await serviceFetch<CommunityTag[] | { tags: CommunityTag[] }>(
    'community',
    '/qa/tags',
    { auth: true }
  );
  if (Array.isArray(data)) return data;
  return data?.tags ?? [];
}
