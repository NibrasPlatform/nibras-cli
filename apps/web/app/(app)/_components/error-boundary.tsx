'use client';
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  message?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            padding: '1rem',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            fontSize: '0.875rem',
          }}
        >
          {this.props.message ?? 'Failed to load this section.'}
        </div>
      );
    }
    return this.props.children;
  }
}
