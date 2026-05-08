const KEY_COMPACT = 'nibras.compact';
const KEY_SIDEBAR_COLLAPSED = 'nibras.sidebar.collapsed';
const KEY_ONBOARDING_OS = 'nibras.onboarding.os';
const KEY_SELECTED_COURSE_ID = 'nibras.selectedCourseId';

export const PREF_EVENTS = {
  compactChanged: 'nibras:compact-changed',
  sidebarCollapsedChanged: 'nibras:sidebar-collapsed-changed',
} as const;

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

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function emitPreferenceChange(eventName: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(eventName));
}

export const prefs = {
  getCompact: () => safeGet(KEY_COMPACT) === 'true',
  setCompact: (v: boolean) => {
    safeSet(KEY_COMPACT, String(v));
    emitPreferenceChange(PREF_EVENTS.compactChanged);
  },
  getSidebarCollapsed: () => safeGet(KEY_SIDEBAR_COLLAPSED) === 'true',
  setSidebarCollapsed: (v: boolean) => {
    safeSet(KEY_SIDEBAR_COLLAPSED, String(v));
    emitPreferenceChange(PREF_EVENTS.sidebarCollapsedChanged);
  },
  getOnboardingOs: () => safeGet(KEY_ONBOARDING_OS),
  setOnboardingOs: (v: string) => safeSet(KEY_ONBOARDING_OS, v),
  getSelectedCourseId: () => safeGet(KEY_SELECTED_COURSE_ID),
  setSelectedCourseId: (v: string | null) =>
    v ? safeSet(KEY_SELECTED_COURSE_ID, v) : safeRemove(KEY_SELECTED_COURSE_ID),
};
