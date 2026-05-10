import { apiRequest } from '@nibras/core';
import picocolors from 'picocolors';

type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  termLabel: string;
  courseCode: string;
  isActive: boolean;
};

type ProjectSummary = {
  id: string;
  title: string;
  slug: string;
  status: string;
  deliveryMode: string;
};

export async function commandList(plain: boolean): Promise<void> {
  const { courses } = (await apiRequest('/v1/tracking/courses')) as {
    courses: CourseSummary[];
  };

  if (!courses || courses.length === 0) {
    if (plain) {
      console.log('No courses found.');
    } else {
      console.log('\n  ' + picocolors.dim('No courses found.') + '\n');
    }
    return;
  }

  for (const course of courses) {
    const courseLabel = plain
      ? `${course.title} (${course.courseCode} — ${course.termLabel})`
      : picocolors.cyan(`${course.title}`) +
        picocolors.dim(` · ${course.courseCode} · ${course.termLabel}`);

    console.log((plain ? '' : '\n') + '  ' + courseLabel);

    // Fetch projects for this course
    let projects: ProjectSummary[] = [];
    try {
      const res = (await apiRequest(`/v1/tracking/courses/${course.id}/projects`)) as {
        projects: ProjectSummary[];
      };
      projects = res.projects ?? [];
    } catch {
      // If not enrolled as instructor, courses may not have projects
      projects = [];
    }

    if (projects.length === 0) {
      console.log('    ' + (plain ? '(no projects)' : picocolors.dim('(no projects)')));
    } else {
      for (const project of projects) {
        const statusColor =
          project.status === 'published'
            ? picocolors.green
            : project.status === 'archived'
              ? picocolors.red
              : picocolors.yellow;
        const statusBadge = plain ? `[${project.status}]` : statusColor(`[${project.status}]`);
        const modeLabel = project.deliveryMode === 'team' ? ' (team)' : '';
        const projectLine = plain
          ? `  - ${project.title}${modeLabel} ${statusBadge}`
          : `  ${picocolors.dim('·')} ${picocolors.white(project.title)}${picocolors.dim(modeLabel)}  ${statusBadge}`;
        console.log('  ' + projectLine);
      }
    }
  }

  if (!plain) {
    console.log();
  }
}
