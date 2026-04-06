'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from './session';

interface UseFormSubmitOptions {
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  onSuccess?: (data: unknown) => void;
  redirectTo?: string;
}

export function useFormSubmit<TPayload = Record<string, unknown>>(options: UseFormSubmitOptions) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (payload: TPayload) => {
      setError(null);
      setSubmitting(true);
      try {
        const res = await apiFetch(options.url, {
          method: options.method ?? 'POST',
          auth: true,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Request failed (${res.status})`);
        }
        const data: unknown = await res.json().catch(() => null);
        options.onSuccess?.(data);
        if (options.redirectTo) router.push(options.redirectTo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        setSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.url, options.method, options.redirectTo]
  );

  return { submitting, error, submit };
}
