export type AppNavItem = {
  href: string;
  label: string;
  description: string;
};

export const appNavItems: AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Track account, projects, and milestones."
  },
  {
    href: "/projects",
    label: "Projects",
    description: "Manage submissions, progress, and reviews."
  }
];

export const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Track your current course operations and GitHub-linked progress."
  },
  "/projects": {
    title: "Projects",
    subtitle: "Review milestones, submissions, and grading details."
  },
  "/install/complete": {
    title: "GitHub App",
    subtitle: "Finish linking the installation to unlock repository provisioning."
  }
};
