'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../lib/session';
import Sidebar from './sidebar';
import TopHeader from './top-header';
import styles from './app-shell.module.css';

type ShellSessionPayload = {
  user: {
    username: string;
    email: string;
    githubLogin: string;
    githubLinked: boolean;
    githubAppInstalled: boolean;
    systemRole?: string;
  };
};

export type ShellUser = ShellSessionPayload['user'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<ShellUser | null>(null);
  const [loading, setLoading] = useState(true);
  const shellRef = useRef<HTMLDivElement>(null);

  // Apply compact mode from localStorage and listen for changes
  useEffect(() => {
    function applyCompact() {
      const compact = localStorage.getItem('nibras.compact') === 'true';
      shellRef.current?.setAttribute('data-compact', String(compact));
    }

    applyCompact();

    function onCompactChanged() {
      applyCompact();
    }

    window.addEventListener('nibras:compact-changed', onCompactChanged);
    return () => window.removeEventListener('nibras:compact-changed', onCompactChanged);
  }, []);

  useEffect(() => {
    let alive = true;

    void (async () => {
      try {
        const response = await apiFetch('/v1/web/session', { auth: true });
        if (!response.ok) {
          if (alive) {
            window.location.href = '/?auth=required';
          }
          return;
        }
        const payload = (await response.json()) as ShellSessionPayload;
        if (alive) {
          setSession(payload.user);
        }
      } catch {
        if (alive) {
          window.location.href = '/?auth=required';
        }
        return;
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div ref={shellRef} className={styles.appShell}>
      <Sidebar user={session} loading={loading} />
      <div className={styles.mainArea}>
        <TopHeader user={session} loading={loading} />
        <div className={styles.pageBody}>{children}</div>
      </div>
    </div>
  );
}
