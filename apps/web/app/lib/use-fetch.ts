'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './session';

export function useFetch<T>(
  path: string | null,
  options?: { auth?: boolean; deps?: unknown[] }
): { data: T | null; loading: boolean; error: string; reload: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  const reload = useCallback(() => setRevision((r) => r + 1), []);

  useEffect(() => {
    if (path === null) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError('');
    void (async () => {
      try {
        const res = await apiFetch(path, { auth: options?.auth ?? true });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Request failed (${res.status})`);
        }
        const payload = (await res.json()) as T;
        if (alive) setData(payload);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, revision, ...(options?.deps ?? [])]);

  return { data, loading, error, reload };
}
