/**
 * Shared UI utility helpers — consolidated from per-page copies.
 */

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function minutesUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diffMinutes = (new Date(dateStr).getTime() - Date.now()) / 60_000;
  return diffMinutes >= 0 ? Math.ceil(diffMinutes) : Math.floor(diffMinutes);
}

export function formatHoursMinutes(totalMinutes: number): string {
  const absoluteMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
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
