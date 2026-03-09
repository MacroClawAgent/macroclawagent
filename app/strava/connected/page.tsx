"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function StravaConnectedContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    if (error) return;
    // Attempt to open the app via custom scheme
    window.location.href = "jonno://strava-connected";
    setLaunched(true);
  }, [error]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <span style={styles.icon}>⚠️</span>
          <h1 style={styles.title}>Connection failed</h1>
          <p style={styles.body}>
            {error === "denied"
              ? "You declined the Strava authorisation. You can try again from the app."
              : "Something went wrong connecting Strava. Please try again from the app."}
          </p>
          <p style={styles.hint}>You can close this browser tab and return to Jonno.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <span style={styles.icon}>✅</span>
        <h1 style={styles.title}>Strava connected!</h1>
        <p style={styles.body}>
          {launched
            ? "Opening Jonno..."
            : "Your Strava account has been linked. Return to the Jonno app to continue."}
        </p>
        <p style={styles.hint}>
          If the app did not open,{" "}
          <button
            style={styles.link}
            onClick={() => { window.location.href = "jonno://strava-connected"; }}
          >
            tap here
          </button>{" "}
          or close this tab and open Jonno manually.
        </p>
      </div>
    </div>
  );
}

/**
 * /strava/connected — deep-link bridge page.
 * After the server-side OAuth callback completes, mobile users are sent here.
 * This page redirects them into the Jonno app via the custom URL scheme and
 * shows a fallback if the app isn't installed.
 */
export default function StravaConnectedPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#F4F5F7" }} />}>
      <StravaConnectedContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F5F7",
    padding: "24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "20px",
    padding: "40px 32px",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  icon: { fontSize: "48px", display: "block", marginBottom: "16px" },
  title: { fontSize: "22px", fontWeight: "800", color: "#1C1C1E", margin: "0 0 12px" },
  body: { fontSize: "15px", color: "#6B7280", lineHeight: 1.6, margin: "0 0 16px" },
  hint: { fontSize: "13px", color: "#9CA3AF", lineHeight: 1.5 },
  link: {
    background: "none",
    border: "none",
    color: "#4C7DFF",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
    padding: 0,
    textDecoration: "underline",
  },
};
