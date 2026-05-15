'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import EmptyState from '../_components/widgets/EmptyState';
import {
  listQuestions,
  listTags,
  type CommunityQuestion,
  type CommunityTag,
  type QuestionFilters,
} from '../../lib/services/community';
import { friendlyMessage } from '../../lib/api-clients/errors';

const SORTS: Array<{ value: NonNullable<QuestionFilters['sort']>; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'top', label: 'Top' },
  { value: 'active', label: 'Active' },
  { value: 'unanswered', label: 'Unanswered' },
];

function formatRelative(iso: string): string {
  try {
    const date = new Date(iso);
    const diffMs = date.getTime() - Date.now();
    const diffMin = Math.round(diffMs / 60000);
    const diffHr = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHr / 24);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    if (Math.abs(diffHr) < 48) return rtf.format(diffHr, 'hour');
    return rtf.format(diffDay, 'day');
  } catch {
    return iso;
  }
}

export default function CommunityPage() {
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
  const [tags, setTags] = useState<CommunityTag[]>([]);
  const [sort, setSort] = useState<NonNullable<QuestionFilters['sort']>>('newest');
  const [tag, setTag] = useState<string | undefined>(undefined);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo<QuestionFilters>(() => ({ sort, tag, q, limit: 30 }), [sort, tag, q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [qResult, tagResult] = await Promise.allSettled([listQuestions(filters), listTags()]);
      if (qResult.status === 'fulfilled') {
        setQuestions(qResult.value.items ?? []);
      } else {
        setQuestions([]);
        setError(friendlyMessage(qResult.reason));
      }
      setTags(tagResult.status === 'fulfilled' ? tagResult.value : []);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Community</h1>
          <p className={styles.subtitle}>Ask, answer, and learn from your classmates.</p>
        </div>
        <button type="button" className={styles.askBtn} disabled>
          Ask a question
        </button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
            <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search questions"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
        </div>
        <div role="tablist" aria-label="Sort" className={styles.tabs}>
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              role="tab"
              aria-selected={sort === s.value}
              className={`${styles.tab} ${sort === s.value ? styles.tabActive : ''}`}
              onClick={() => setSort(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {tags.length > 0 && (
        <div className={styles.tagFilter}>
          <button
            type="button"
            className={`${styles.tagChip} ${tag === undefined ? styles.tagChipActive : ''}`}
            onClick={() => setTag(undefined)}
          >
            All
          </button>
          {tags.slice(0, 18).map((t) => (
            <button
              key={t.name}
              type="button"
              className={`${styles.tagChip} ${tag === t.name ? styles.tagChipActive : ''}`}
              onClick={() => setTag(tag === t.name ? undefined : t.name)}
            >
              {t.name} <span style={{ opacity: 0.6 }}>· {t.count}</span>
            </button>
          ))}
        </div>
      )}

      {(tag || q.trim()) && (
        <div className={styles.activeFilters}>
          {tag && (
            <span className={styles.activeFilterPill}>
              tag: <strong>{tag}</strong>
              <button
                type="button"
                aria-label={`Clear tag ${tag}`}
                onClick={() => setTag(undefined)}
              >
                ×
              </button>
            </span>
          )}
          {q.trim() && (
            <span className={styles.activeFilterPill}>
              search: <strong>{q.trim()}</strong>
              <button type="button" aria-label="Clear search" onClick={() => setQ('')}>
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            className={styles.clearAllBtn}
            onClick={() => {
              setTag(undefined);
              setQ('');
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ height: 320, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)' }} />
      ) : error && questions.length === 0 ? (
        <EmptyState
          title="Community feed unavailable"
          description={error}
          tone="error"
          action={{ label: 'Retry', onClick: () => void load() }}
        />
      ) : questions.length === 0 ? (
        <EmptyState
          title="No questions match"
          description="Try a different tag or clear your search."
        />
      ) : (
        <div className={styles.list}>
          {questions.map((question) => (
            <Link key={question.id} href={`/community/q/${question.id}`} className={styles.row}>
              <div className={styles.stats}>
                <span className={styles.stat}>
                  <strong>{question.score}</strong> votes
                </span>
                <span className={`${styles.stat} ${question.acceptedAnswerId ? styles.statAccepted : ''}`}>
                  <strong>{question.answerCount}</strong> answers
                </span>
                {typeof question.views === 'number' && (
                  <span className={styles.stat}>
                    <strong>{question.views}</strong> views
                  </span>
                )}
              </div>
              <div className={styles.body}>
                <h2 className={styles.questionTitle}>{question.title}</h2>
                <p className={styles.snippet}>{question.body}</p>
                <div className={styles.metaRow}>
                  {question.tags.slice(0, 4).map((tagName) => (
                    <span key={tagName} className={styles.tag}>
                      {tagName}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.right}>
                <span className={styles.author}>{question.author.username}</span>
                <span className={styles.timestamp}>{formatRelative(question.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
