'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../lib/session';
import InterestModal from './_components/interest-modal';

type CatalogTemplate = {
  id: string;
  courseId: string;
  slug: string;
  title: string;
  description: string;
  deliveryMode: 'team' | 'individual';
  teamSize: number | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  tags: string[];
  estimatedDuration: string | null;
  roles: Array<{ id: string; key: string; label: string; count: number }>;
  milestones: Array<{ id: string; title: string }>;
  status: string;
  courseName: string;
  courseCode: string;
  projectId: string | null;
};

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  beginner: { bg: '#dcfce7', text: '#15803d' },
  intermediate: { bg: '#fef9c3', text: '#a16207' },
  advanced: { bg: '#fee2e2', text: '#dc2626' },
};

function Skeleton({ w = '100%', h = 14, r = 6 }: { w?: string; h?: number; r?: number }) {
  return (
    <span
      style={{
        display: 'block',
        width: w,
        height: h,
        borderRadius: r,
        background: 'var(--surface-strong)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
      aria-hidden="true"
    />
  );
}

export default function CatalogPage() {
  const [templates, setTemplates] = useState<CatalogTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Filters
  const [filterDelivery, setFilterDelivery] = useState<'all' | 'team' | 'individual'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<Set<string>>(new Set());
  const [filterTag, setFilterTag] = useState('');

  // Interest modal state
  const [interestTarget, setInterestTarget] = useState<{
    projectId: string;
    templateTitle: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch('/v1/tracking/catalog', { auth: true });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Failed to load catalog (${res.status})`);
        }
        const data = (await res.json()) as CatalogTemplate[];
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    templates.forEach((t) => t.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [templates]);

  const filtered = useMemo(() => {
    const tagFilter = filterTag.trim().toLowerCase();
    return templates.filter((t) => {
      if (filterDelivery !== 'all' && t.deliveryMode !== filterDelivery) return false;
      if (filterDifficulty.size > 0 && (!t.difficulty || !filterDifficulty.has(t.difficulty)))
        return false;
      if (tagFilter && !(t.tags ?? []).some((tag) => tag.toLowerCase().includes(tagFilter)))
        return false;
      return true;
    });
  }, [templates, filterDelivery, filterDifficulty, filterTag]);

  function toggleDifficulty(d: string) {
    setFilterDifficulty((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  function handleInterestSuccess() {
    setInterestTarget(null);
    setToast('✅ Interest sent! The instructor has been notified.');
    setTimeout(() => setToast(''), 4000);
  }

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '12px 20px',
            zIndex: 999,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p
          style={{
            fontSize: 12,
            color: 'var(--text-soft)',
            margin: '0 0 4px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Project Catalog
        </p>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700 }}>Browse Projects</h1>
        <p style={{ color: 'var(--text-soft)', margin: 0 }}>
          Discover project templates across all courses. Express interest or apply for team roles.
        </p>
      </div>

      {error && (
        <div
          style={{
            color: 'var(--error, #ef4444)',
            padding: '12px 16px',
            background: '#fee2e2',
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}
      >
        {/* Filter panel */}
        <aside
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 20,
            position: 'sticky',
            top: 24,
          }}
        >
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>Filters</h3>

          {/* Delivery mode */}
          <div style={{ marginBottom: 20 }}>
            <p
              style={{
                margin: '0 0 8px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-soft)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Delivery
            </p>
            {(['all', 'team', 'individual'] as const).map((mode) => (
              <label
                key={mode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                <input
                  type="radio"
                  name="delivery"
                  checked={filterDelivery === mode}
                  onChange={() => setFilterDelivery(mode)}
                />
                {mode === 'all' ? 'All' : mode === 'team' ? 'Team' : 'Individual'}
              </label>
            ))}
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: 20 }}>
            <p
              style={{
                margin: '0 0 8px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-soft)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Difficulty
            </p>
            {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
              <label
                key={d}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                <input
                  type="checkbox"
                  checked={filterDifficulty.has(d)}
                  onChange={() => toggleDifficulty(d)}
                />
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </label>
            ))}
          </div>

          {/* Tag search */}
          <div>
            <p
              style={{
                margin: '0 0 8px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-soft)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Search Tags
            </p>
            <input
              type="text"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              placeholder="e.g. React"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface-strong)',
                color: 'var(--text)',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
            {allTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {allTags.slice(0, 12).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                    style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 99,
                      border: '1px solid var(--border)',
                      background: filterTag === tag ? 'var(--primary)' : 'var(--surface-strong)',
                      color: filterTag === tag ? '#fff' : 'var(--text-soft)',
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Template grid */}
        <div>
          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 16,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 20,
                    display: 'grid',
                    gap: 10,
                  }}
                >
                  <Skeleton w="60%" h={18} />
                  <Skeleton w="40%" h={12} />
                  <Skeleton w="100%" h={12} />
                  <Skeleton w="80%" h={12} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
              <p style={{ color: 'var(--text-soft)' }}>
                {templates.length === 0
                  ? 'No project templates are available yet.'
                  : 'No templates match your filters.'}
              </p>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--text-soft)', fontSize: 13, marginBottom: 16 }}>
                {filtered.length} template{filtered.length !== 1 ? 's' : ''} found
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 16,
                }}
              >
                {filtered.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onExpressInterest={(projectId) =>
                      setInterestTarget({ projectId, templateTitle: template.title })
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {interestTarget && (
        <InterestModal
          projectId={interestTarget.projectId}
          templateTitle={interestTarget.templateTitle}
          onClose={() => setInterestTarget(null)}
          onSuccess={handleInterestSuccess}
        />
      )}
    </main>
  );
}

function TemplateCard({
  template,
  onExpressInterest,
}: {
  template: CatalogTemplate;
  onExpressInterest: (projectId: string) => void;
}) {
  const difficultyStyle = template.difficulty ? DIFFICULTY_COLORS[template.difficulty] : null;
  const hasPublishedProject = Boolean(template.projectId);
  const projectHref = template.projectId
    ? `/projects?courseId=${encodeURIComponent(template.courseId)}&projectId=${encodeURIComponent(template.projectId)}`
    : null;

  return (
    <article
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Course badge + delivery mode */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 99,
            background: 'var(--surface-strong)',
            color: 'var(--text-soft)',
            fontWeight: 600,
          }}
        >
          {template.courseCode}
        </span>
        <span
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 99,
            background: template.deliveryMode === 'team' ? '#ede9fe' : '#e0f2fe',
            color: template.deliveryMode === 'team' ? '#7c3aed' : '#0369a1',
            fontWeight: 600,
          }}
        >
          {template.deliveryMode === 'team' ? '👥 Team' : '👤 Individual'}
        </span>
        {difficultyStyle && template.difficulty && (
          <span
            style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 99,
              background: difficultyStyle.bg,
              color: difficultyStyle.text,
              fontWeight: 600,
            }}
          >
            {template.difficulty}
          </span>
        )}
      </div>

      {/* Title + description */}
      <div>
        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>{template.title}</h3>
        {template.description && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--text-soft)',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {template.description}
          </p>
        )}
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-soft)' }}>
          {template.courseName}
        </p>
      </div>

      {/* Meta chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {template.estimatedDuration && (
          <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
            ⏱ {template.estimatedDuration}
          </span>
        )}
        {template.deliveryMode === 'team' && template.teamSize && (
          <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
            👥 {template.teamSize} members
          </span>
        )}
        {template.deliveryMode === 'team' && template.roles.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
            {template.roles.length} roles
          </span>
        )}
        {template.milestones.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
            {template.milestones.length} milestone{template.milestones.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tags */}
      {(template.tags ?? []).length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {template.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 99,
                background: 'var(--surface-strong)',
                color: 'var(--text-soft)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 'auto', paddingTop: 4 }}>
        {template.deliveryMode === 'team' ? (
          projectHref ? (
            <a
              href={projectHref}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '8px',
                borderRadius: 8,
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Apply for Roles →
            </a>
          ) : (
            <button
              type="button"
              disabled
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface-strong)',
                color: 'var(--text-soft)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'not-allowed',
              }}
            >
              Roles Not Open Yet
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => {
              if (template.projectId) onExpressInterest(template.projectId);
            }}
            disabled={!hasPublishedProject}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: 8,
              border: 'none',
              background: hasPublishedProject ? 'var(--primary)' : 'var(--surface-strong)',
              color: hasPublishedProject ? '#fff' : 'var(--text-soft)',
              fontSize: 14,
              fontWeight: 600,
              cursor: hasPublishedProject ? 'pointer' : 'not-allowed',
            }}
          >
            {hasPublishedProject ? 'Express Interest' : 'Project Not Open Yet'}
          </button>
        )}
      </div>
    </article>
  );
}
