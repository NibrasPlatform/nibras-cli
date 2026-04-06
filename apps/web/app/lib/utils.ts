/**
 * Shared UI utility helpers — consolidated from per-page copies.
 */

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86_400_000);
}

export function getInitials(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return 'NB';
  return (
    trimmed
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || trimmed.slice(0, 2).toUpperCase()
  );
}

/**
 * Returns a CSS module class name suffix for a given status string.
 * Callers compose it with their own styles object, e.g. `styles[statusColor(s)]`.
 *
 * Values: 'statusApproved' | 'statusReview' | 'statusChanges' | 'statusOpen'
 */
export function statusColor(status: string): string {
  if (status === 'approved' || status === 'graded') return 'statusApproved';
  if (status === 'submitted' || status === 'under_review') return 'statusReview';
  if (status === 'changes_requested') return 'statusChanges';
  return 'statusOpen';
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
