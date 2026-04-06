const KEY_COMPACT = 'nibras.compact';
const KEY_SIDEBAR_COLLAPSED = 'nibras.sidebar.collapsed';
const KEY_ONBOARDING_OS = 'nibras.onboarding.os';

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export const prefs = {
  getCompact: () => safeGet(KEY_COMPACT) === 'true',
  setCompact: (v: boolean) => safeSet(KEY_COMPACT, String(v)),
  getSidebarCollapsed: () => safeGet(KEY_SIDEBAR_COLLAPSED) === 'true',
  setSidebarCollapsed: (v: boolean) => safeSet(KEY_SIDEBAR_COLLAPSED, String(v)),
  getOnboardingOs: () => safeGet(KEY_ONBOARDING_OS),
  setOnboardingOs: (v: string) => safeSet(KEY_ONBOARDING_OS, v),
};
