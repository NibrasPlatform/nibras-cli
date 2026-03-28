import AppShell from "./_components/app-shell";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
