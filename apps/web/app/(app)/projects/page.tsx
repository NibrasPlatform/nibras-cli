import ProjectsDashboard from './_components/projects-dashboard';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ courseId?: string | string[]; projectId?: string | string[] }>;
}) {
  const params = await searchParams;
  const courseId = typeof params?.courseId === 'string' ? params.courseId : null;
  const projectId = typeof params?.projectId === 'string' ? params.projectId : null;
  return <ProjectsDashboard initialCourseId={courseId} initialProjectId={projectId} />;
}
