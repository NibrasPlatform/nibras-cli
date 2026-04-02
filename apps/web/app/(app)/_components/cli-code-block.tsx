'use client';

import { useState } from 'react';
import styles from './cli-code-block.module.css';

type Token = { text: string; type: 'cmd' | 'flag' | 'value' | 'comment' | 'plain' };

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  const parts = code.split(/(\s+)/);
  let isFirst = true;

  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      tokens.push({ text: part, type: 'plain' });
      continue;
    }
    if (part.startsWith('#')) {
      tokens.push({ text: part, type: 'comment' });
      isFirst = false;
    } else if (part.startsWith('--') || part.startsWith('-')) {
      tokens.push({ text: part, type: 'flag' });
    } else if (isFirst) {
      tokens.push({ text: part, type: 'cmd' });
      isFirst = false;
    } else {
      tokens.push({ text: part, type: 'value' });
    }
  }

  return tokens;
}

export default function CliCodeBlock({
  code,
  language = 'bash',
}: {
  code: string;
  language?: 'bash' | 'text';
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  }

  const lines = code.split('\n');

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <span className={styles.lang}>{language}</span>
        <button className={styles.copyBtn} onClick={() => void handleCopy()} aria-label="Copy code">
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path
                  d="M2 7l3 3 6-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <rect
                  x="4"
                  y="4"
                  width="8"
                  height="8"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M4 4V3a1 1 0 011-1h5a1 1 0 011 1v1"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path d="M1 1h6v3H1z" rx="1" stroke="currentColor" strokeWidth="1.3" fill="none" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className={styles.pre}>
        <code>
          {lines.map((line, i) => (
            <div key={i} className={styles.line}>
              {language === 'bash'
                ? tokenize(line).map((tok, j) => (
                    <span key={j} className={styles[tok.type]}>
                      {tok.text}
                    </span>
                  ))
                : line}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
