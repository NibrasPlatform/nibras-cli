import { serviceFetch } from '../api-clients/service-fetch';

export type BackendCourse = {
  id: string;
  code: string;
  title: string;
  instructor?: string;
  description?: string;
  thumbnailUrl?: string;
  videoCount?: number;
  assignmentCount?: number;
  progress?: number;
};

export type CourseVideo = {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  durationSeconds: number;
  url: string;
  thumbnailUrl?: string;
  watched?: boolean;
  watchedProgress?: number;
  order: number;
};

export type BackendAssignment = {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  dueAt?: string;
  pointsPossible: number;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'late';
  score?: number;
};

export type AssignmentDetail = BackendAssignment & {
  content?: string;
  resources?: Array<{ title: string; url: string }>;
  rubric?: Array<{ criterion: string; weight: number; description?: string }>;
};

export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  submittedAt: string;
  status: BackendAssignment['status'];
  score?: number;
  feedback?: string;
};

// ── Courses ─────────────────────────────────────────────────────────────────
export async function listCourses() {
  return serviceFetch<BackendCourse[]>('admin', '/courses', { auth: true });
}

export async function getCourse(courseId: string) {
  return serviceFetch<BackendCourse>('admin', `/courses/${courseId}`, { auth: true });
}

// ── Videos ──────────────────────────────────────────────────────────────────
export async function listVideos(courseId: string) {
  return serviceFetch<CourseVideo[]>('admin', `/courses/${courseId}/videos`, {
    auth: true,
  });
}

export async function setVideoProgress(
  videoId: string,
  payload: { watched?: boolean; watchedProgress?: number }
) {
  return serviceFetch<{ watched: boolean; watchedProgress: number }>(
    'admin',
    `/videos/${videoId}/progress`,
    {
      method: 'POST',
      auth: true,
      body: payload as Record<string, unknown>,
    }
  );
}

// ── Assignments ─────────────────────────────────────────────────────────────
export async function listAssignments(courseId: string) {
  return serviceFetch<BackendAssignment[]>('admin', `/courses/${courseId}/assignments`, {
    auth: true,
  });
}

export async function getAssignmentById(assignmentId: string) {
  return serviceFetch<AssignmentDetail>('admin', `/assignments/${assignmentId}`, {
    auth: true,
  });
}

export async function submitAssignment(
  assignmentId: string,
  payload: { content: string; resources?: Array<{ title: string; url: string }> }
) {
  return serviceFetch<AssignmentSubmission>(
    'admin',
    `/assignments/${assignmentId}/submit`,
    {
      method: 'POST',
      auth: true,
      body: payload as Record<string, unknown>,
    }
  );
}
