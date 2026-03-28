"use client";

import { usePathname } from "next/navigation";
import { pageTitles } from "./nav-config";
import ThemeToggle from "./theme-toggle";

type ShellSessionUser = {
  username: string;
  githubLogin: string;
  githubLinked: boolean;
  githubAppInstalled: boolean;
};

function getInitials(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "NB";
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || trimmed.slice(0, 2).toUpperCase();
}

export default function TopHeader({
  user,
  loading
}: {
  user: ShellSessionUser | null;
  loading: boolean;
}) {
  const pathname = usePathname();
  const pageMeta = pageTitles[pathname] || pageTitles["/dashboard"];
  const identity = user?.username || user?.githubLogin || "Nibras";

  return (
    <header className="topHeader">
      <div>
        <div className="pageTitleRow">
          <span className="sectionEyebrow">Nibras Web</span>
          <h1>{pageMeta.title}</h1>
        </div>
        <p className="headerSubtitle">{pageMeta.subtitle}</p>
      </div>

      <div className="headerActions">
        <label className="headerSearch" aria-label="Search placeholder">
          <span aria-hidden="true">⌕</span>
          <input type="text" placeholder="Search projects, milestones, commands" disabled />
        </label>
        <ThemeToggle />
        <div className="profileChip" aria-live="polite">
          <span className="profileCircle">{loading ? "…" : getInitials(identity)}</span>
          <div>
            <strong>{loading ? "Loading" : identity}</strong>
            <span>{user?.githubAppInstalled ? "GitHub App linked" : "Hosted session"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
