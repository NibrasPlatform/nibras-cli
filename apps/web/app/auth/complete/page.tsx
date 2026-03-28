"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/session";
import styles from "./page.module.css";

export default function AuthCompletePage() {
  const [status, setStatus] = useState("Completing sign-in...");

  useEffect(() => {
    void (async () => {
      try {
        const response = await apiFetch("/v1/web/session", { auth: true });
        if (!response.ok) {
          throw new Error("Web session was not established.");
        }
        setStatus("Sign-in complete. Redirecting to the dashboard...");
        window.setTimeout(() => {
          window.location.href = "/dashboard";
        }, 700);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : String(err));
      }
    })();
  }, []);

  return (
    <main className="pageWrap">
      <section className={`${styles.card} surfaceCard`}>
        <div className={styles.badge}>Session</div>
        <h1>Finishing sign-in</h1>
        <p className="statusMessage">{status}</p>
        <div className={styles.progressRail}>
          <span className={styles.progressFill} />
        </div>
      </section>
    </main>
  );
}
