"use client";

import { useState } from "react";
import NibrasLogo from "./_components/nibras-logo";
import { discoverApiBaseUrl } from "./lib/session";
import styles from "./signin.module.css";

export default function HomePage() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn() {
    setError("");
    setSubmitting(true);
    try {
      const apiBaseUrl = await discoverApiBaseUrl();
      const configRes = await fetch(`${apiBaseUrl}/v1/github/config`);
      if (configRes.ok) {
        const config = await configRes.json() as { configured: boolean };
        if (!config.configured) {
          setError("GitHub App is not configured on this server. Set GITHUB_APP_ID, GITHUB_APP_CLIENT_ID, and related environment variables, then restart the API.");
          setSubmitting(false);
          return;
        }
      }
      const returnTo = `${window.location.origin}/auth/complete`;
      window.location.href = `${apiBaseUrl}/v1/github/oauth/start?return_to=${encodeURIComponent(returnTo)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandHeader}>
          <div>
            <NibrasLogo variant="inverse" width={154} className={styles.brandLogo} priority />
            <p>Hosted course operations for GitHub-linked project workflows.</p>
          </div>
        </div>

        <div className={styles.brandCopy}>
          <span className="sectionEyebrow">GitHub-Linked Workflow</span>
          <h1>Welcome. Start your next project cycle with a real hosted workflow.</h1>
          <p>
            Sign in with GitHub, connect the app installation, and manage milestones,
            submissions, and reviews from one dashboard.
          </p>
        </div>

        <div className={styles.signalGrid}>
          <article className={styles.signalCard}>
            <strong>CLI + Web</strong>
            <span>Use the CLI locally and keep state visible in the browser.</span>
          </article>
          <article className={styles.signalCard}>
            <strong>GitHub-backed</strong>
            <span>Provision repos, link installs, and track submissions with the hosted API.</span>
          </article>
        </div>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.formIntro}>
            <span className="sectionEyebrow">Sign In</span>
            <h2>Login to your account</h2>
            <p className="bodyMuted">
              Continue with GitHub to create a hosted session for your Nibras account.
            </p>
          </div>

          {error ? <p className="inlineError">{error}</p> : null}

          <div className={styles.actions}>
            <button className="buttonPrimary" type="button" onClick={() => void handleSignIn()} disabled={submitting}>
              {submitting ? "Connecting..." : "Continue with GitHub"}
            </button>
            <a className="buttonSecondary" href="https://github.com/apps" target="_blank" rel="noreferrer">
              GitHub Apps
            </a>
          </div>

          <p className="inlineHint">
            This browser flow establishes the same hosted identity used by
            <code className={styles.inlineCode}> nibras login</code>, project tracking,
            and GitHub App installation linking.
          </p>
        </div>
      </section>
    </main>
  );
}
