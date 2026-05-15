import { serviceFetch } from '../api-clients/service-fetch';

export type AnalyticsRange = '7d' | '30d' | '90d' | 'term';

export type DateRangeFilters = {
  range?: AnalyticsRange;
  courseId?: string;
  from?: string;
  to?: string;
};

export type OverviewKpis = {
  activeStudents: number;
  activeStudentsDelta: number;
  submissionsThisWeek: number;
  submissionsDelta: number;
  passRate: number;
  passRateDelta: number;
  medianGrade: number;
};

export type OverviewSeries = {
  submissions: Array<{ date: string; value: number }>;
  passRate: Array<{ date: string; value: number }>;
};

export type OverviewResponse = {
  kpis: OverviewKpis;
  series: OverviewSeries;
  topRisingTopics: Array<{ topic: string; delta: number }>;
  flaggedCohorts: Array<{ cohort: string; reason: string }>;
};

export type CourseSummary = {
  courseId: string;
  code: string;
  title: string;
  enrolled: number;
  activeWeekly: number;
  completionRate: number;
  averageGrade: number;
  passRate: number;
};

export type EngagementBucket = {
  bucket: string;
  hours: number;
  sessions: number;
};

export type EngagementResponse = {
  totalHours: number;
  averageSession: number;
  retentionWeekly: number;
  byDay: EngagementBucket[];
  byCourse: Array<{ courseId: string; code: string; hours: number }>;
};

export type StudentRow = {
  studentId: string;
  username: string;
  email?: string;
  cohort?: string;
  hoursWeekly: number;
  averageGrade: number;
  riskLevel: 'low' | 'medium' | 'high';
  trend?: number;
};

export type StudentsResponse = {
  rows: StudentRow[];
  total: number;
};

function toQuery(filters: DateRangeFilters): Record<string, string> {
  const out: Record<string, string> = {};
  if (filters.range) out.range = filters.range;
  if (filters.courseId) out.courseId = filters.courseId;
  if (filters.from) out.from = filters.from;
  if (filters.to) out.to = filters.to;
  return out;
}

export async function getOverview(filters: DateRangeFilters = {}) {
  return serviceFetch<OverviewResponse>('admin', '/analytics/overview', {
    auth: true,
    query: toQuery(filters),
  });
}

export async function getCourseSummaries(filters: DateRangeFilters = {}) {
  return serviceFetch<CourseSummary[]>('admin', '/analytics/courses', {
    auth: true,
    query: toQuery(filters),
  });
}

export async function getEngagement(filters: DateRangeFilters = {}) {
  return serviceFetch<EngagementResponse>('admin', '/analytics/engagement', {
    auth: true,
    query: toQuery(filters),
  });
}

export async function getStudents(
  filters: DateRangeFilters & { cohort?: string; risk?: StudentRow['riskLevel'] } = {}
) {
  const query = toQuery(filters);
  if (filters.cohort) query.cohort = filters.cohort;
  if (filters.risk) query.risk = filters.risk;
  return serviceFetch<StudentsResponse>('admin', '/analytics/students', {
    auth: true,
    query,
  });
}
