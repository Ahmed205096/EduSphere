"use client";

import { useRef, useState } from "react";
import Footer from "../components/Footer/Footer";

const C = {
  primary: "#4edea3",
  onPrimary: "#003824",
  bg: "#09090b",
  surfaceContainerLowest: "#0e0e10",
  surfaceContainerHigh: "#2a2a2c",
  onSurface: "#e5e1e4",
  onSurfaceVariant: "#bbcabf",
  outlineVariant: "#3c4a42",
  outline: "#86948a",
  error: "#ffb4ab",
} as const;

const glassCard: React.CSSProperties = {
  background: "rgba(24,24,27,0.7)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
};

type PageState = "idle" | "loading" | "sent";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [pageState, setPageState] = useState<PageState>("idle");
  const [error, setError] = useState<string | null>(null);

  const spotlightRef = useRef<HTMLDivElement>(null);
  const forgotUrl = process.env.NEXT_PUBLIC_FORGOT_PASS as string;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!spotlightRef.current) return;
    const el = spotlightRef.current.parentElement!;
    const rect = el.getBoundingClientRect();
    spotlightRef.current.style.left = `${e.clientX - rect.left}px`;
    spotlightRef.current.style.top = `${e.clientY - rect.top}px`;
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setPageState("loading");
    const res = await fetch(forgotUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.status === 200) {
      setPageState("sent");
    } else if (res.status === 404) {
      setError("No account found with this email address.");
      setPageState("idle");
    } else {
      setError("Something went wrong. Please try again.");
      setPageState("idle");
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(24,24,27,0.5)",
    backdropFilter: "blur(8px)",
    border: `1px solid ${focused ? C.primary : C.outlineVariant}`,
    boxShadow: focused ? `0 0 0 1px ${C.primary}` : "none",
    color: C.onSurface,
    width: "100%",
    borderRadius: "0.5rem",
    padding: "12px 12px 12px 44px",
    outline: "none",
    transition: "all 0.2s",
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: C.bg, color: C.onSurface, fontFamily: "var(--font-geist-sans), sans-serif" }}
      onMouseMove={handleMouseMove}
    >
      {/* Background blobs */}
      <div
        className="fixed top-1/3 left-1/4 w-80 h-80 rounded-full -z-10 pointer-events-none"
        style={{ backgroundColor: `${C.primary}0f`, filter: "blur(100px)" }}
      />

      {/* Header */}
      <header className="fixed top-0 w-full flex justify-between items-center px-4 md:px-10 h-16 z-50">
        <a className="text-2xl font-bold tracking-tight" href="/" style={{ color: C.primary }}>
          EduSphere
        </a>
        <a
          href="/login"
          className="text-sm px-4 py-2 rounded-lg hover:opacity-80 transition-all"
          style={{ color: C.onSurface, backgroundColor: C.surfaceContainerHigh }}
        >
          Log In
        </a>
      </header>

      {/* Main */}
      <main className="grow flex items-center justify-center px-4 pt-16 pb-12 relative overflow-hidden">
        {/* Spotlight */}
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute"
          style={{
            width: 400, height: 400,
            background: "radial-gradient(circle, rgba(78,222,163,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            transition: "left 0.08s ease, top 0.08s ease",
            zIndex: 0,
          }}
        />

        <section
          className="w-full max-w-md text-center relative z-10 rounded-xl overflow-hidden"
          style={{ ...glassCard, padding: "clamp(2rem, 5vw, 3rem)" }}
        >
          {/* Decorative top bar */}
          <div
            className="absolute top-0 left-0 w-full h-[2px] opacity-50"
            style={{ background: `linear-gradient(90deg, transparent, ${C.primary}, transparent)` }}
          />

          {/* ── SENT ── */}
          {pageState === "sent" && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative inline-block">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${C.primary}1a`,
                    border: `1px solid ${C.primary}33`,
                    boxShadow: `0 0 20px ${C.primary}33`,
                  }}
                >
                  <span
                    className="material-symbols-outlined select-none"
                    style={{ color: C.primary, fontSize: "40px", fontVariationSettings: "'FILL' 1" }}
                  >
                    mark_email_read
                  </span>
                </div>
                <div
                  className="absolute inset-0 w-20 h-20 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: `${C.primary}33` }}
                />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold" style={{ color: C.onSurface }}>
                  Check Your Inbox
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                  We sent a password reset link to{" "}
                  <span className="font-semibold" style={{ color: C.onSurface }}>{email}</span>.
                </p>
              </div>

              <div
                className="w-full rounded-lg px-4 py-3 flex items-start gap-3 text-sm text-left"
                style={{ backgroundColor: C.surfaceContainerLowest, border: `1px solid ${C.outlineVariant}` }}
              >
                <span
                  className="material-symbols-outlined text-base shrink-0 mt-0.5 select-none"
                  style={{ color: C.onSurfaceVariant }}
                >
                  info
                </span>
                <p style={{ color: C.onSurfaceVariant }}>
                  The link expires in{" "}
                  <span className="font-medium" style={{ color: C.onSurface }}>15 minutes</span>.
                  Check your spam folder if you don&apos;t see it.
                </p>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={() => { setPageState("idle"); setEmail(""); }}
                  className="w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: C.surfaceContainerHigh, color: C.onSurface }}
                >
                  Use a Different Email
                </button>
                <a
                  href="/login"
                  className="block w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: C.primary, color: C.onPrimary, boxShadow: `0 0 20px ${C.primary}33` }}
                >
                  Back to Sign In
                </a>
              </div>

              <div className="w-full pt-4" style={{ borderTop: `1px solid ${C.outlineVariant}30` }}>
                <p className="text-xs" style={{ color: C.outline }}>
                  Secure password reset powered by EduSphere Identity.
                </p>
              </div>
            </div>
          )}

          {/* ── IDLE / LOADING ── */}
          {(pageState === "idle" || pageState === "loading") && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative inline-block">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${C.primary}1a`,
                    border: `1px solid ${C.primary}33`,
                    boxShadow: `0 0 20px ${C.primary}22`,
                  }}
                >
                  <span
                    className="material-symbols-outlined select-none"
                    style={{ color: C.primary, fontSize: "40px" }}
                  >
                    lock_reset
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold" style={{ color: C.onSurface }}>
                  Forgot Password?
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                  No worries. Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form className="w-full space-y-4" onSubmit={handleSubmit}>
                {/* Email input with icon */}
                <div className="relative">
                  <span
                    className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl select-none pointer-events-none"
                    style={{ color: focused ? C.primary : C.outline }}
                  >
                    mail
                  </span>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Error banner */}
                {error && (
                  <div
                    className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm text-left"
                    style={{ backgroundColor: `${C.error}15`, border: `1px solid ${C.error}33`, color: C.error }}
                  >
                    <span className="material-symbols-outlined text-base shrink-0 mt-0.5 select-none">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pageState === "loading"}
                  className="w-full py-4 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: C.primary, color: C.onPrimary, boxShadow: `0 0 20px ${C.primary}33` }}
                >
                  {pageState === "loading" ? (
                    <span className="material-symbols-outlined animate-spin select-none">
                      progress_activity
                    </span>
                  ) : (
                    <>
                      Send Reset Link
                      <span className="material-symbols-outlined text-base select-none">send</span>
                    </>
                  )}
                </button>
              </form>

              <a
                href="/login"
                className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
                style={{ color: C.onSurfaceVariant }}
              >
                <span className="material-symbols-outlined text-base select-none">arrow_back</span>
                Back to Sign In
              </a>

              <div className="w-full pt-4" style={{ borderTop: `1px solid ${C.outlineVariant}30` }}>
                <p className="text-xs" style={{ color: C.outline }}>
                  Secure password reset powered by EduSphere Identity.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
