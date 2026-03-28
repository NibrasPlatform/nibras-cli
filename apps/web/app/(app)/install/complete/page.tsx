"use client";

import { Suspense, FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "../../../lib/session";
import styles from "./page.module.css";

function InstallCompleteContent() {
  const searchParams = useSearchParams();
  const installationIdFromQuery = searchParams.get("installation_id")?.trim() || "";
  const stateFromQuery = searchParams.get("state")?.trim() || "";
  const setupAction = searchParams.get("setup_action")?.trim() || "";

  const [installationId, setInstallationId] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [autoLinked, setAutoLinked] = useState(false);

  useEffect(() => {
    if (installationIdFromQuery) {
      setInstallationId((current) => current || installationIdFromQuery);
    }
  }, [installationIdFromQuery]);

  async function submitInstallation(id: string, state?: string) {
    const response = await apiFetch("/v1/github/setup/complete", {
      method: "POST",
      auth: true,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        installationId: id,
        ...(state ? { state } : {})
      })
    });
    return response.json() as Promise<{ installationId: string; redirectTo?: string }>;
  }

  useEffect(() => {
    if (!installationIdFromQuery || !stateFromQuery || autoLinked) {
      return;
    }

    setAutoLinked(true);
    setSubmitting(true);
    setStatus("Completing GitHub App installation...");

    void (async () => {
      try {
        const payload = await submitInstallation(installationIdFromQuery, stateFromQuery);
        setStatus(`Installation ${payload.installationId} linked successfully. Redirecting...`);
        window.setTimeout(() => {
          window.location.href = payload.redirectTo || "/dashboard";
        }, 900);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : String(err));
      } finally {
        setSubmitting(false);
      }
    })();
  }, [autoLinked, installationIdFromQuery, stateFromQuery]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    try {
      const payload = await submitInstallation(installationId.trim(), stateFromQuery || undefined);
      setStatus(`Installation ${payload.installationId} linked successfully.`);
      setInstallationId("");
      window.setTimeout(() => {
        window.location.href = payload.redirectTo || "/dashboard";
      }, 900);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="pageSection">
      <section className={`${styles.hero} pageHero`}>
        <div>
          <span className="sectionEyebrow">GitHub App</span>
          <h1>Complete installation linking</h1>
          <p className="bodyMuted">
            {installationIdFromQuery
              ? "GitHub returned an installation to link. Review the state below or let the page finish the link automatically."
              : "Paste the installation ID returned by GitHub to verify ownership and connect the app installation to your hosted account."}
          </p>
          {setupAction ? <p className="bodyMuted">GitHub setup action: {setupAction}</p> : null}
        </div>
      </section>

      <section className={`${styles.card} surfaceCard`}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Installation ID</span>
            <input
              className="formInput"
              value={installationId}
              onChange={(event) => setInstallationId(event.target.value)}
              placeholder="GitHub installation ID"
            />
          </label>
          <div className={styles.actions}>
            <button className="buttonPrimary" type="submit" disabled={submitting || !installationId.trim()}>
              {submitting ? "Linking..." : installationIdFromQuery ? "Retry installation link" : "Link installation"}
            </button>
            <a className="buttonSecondary" href="/dashboard">Back to dashboard</a>
          </div>
        </form>
        {status ? <p className={styles.status}>{status}</p> : null}
      </section>
    </main>
  );
}

export default function InstallCompletePage() {
  return (
    <Suspense fallback={(
      <main className="pageSection">
        <section className={`${styles.hero} pageHero`}>
          <div>
            <span className="sectionEyebrow">GitHub App</span>
            <h1>Complete installation linking</h1>
            <p className="bodyMuted">Loading GitHub installation details...</p>
          </div>
        </section>
      </main>
    )}
    >
      <InstallCompleteContent />
    </Suspense>
  );
}
