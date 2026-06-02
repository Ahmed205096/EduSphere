"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

const C = {
  primary: "#4edea3",
  onPrimary: "#003824",
  bg: "#09090b",
  surfaceContainerLowest: "#0e0e10",
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

type State = "verifying" | "success" | "expired" | "no_token" | "resending" | "resent";

function ConfirmEmailContent() {
  const params = useSearchParams();
  const token = params.get("token");

  const [pageState, setPageState] = useState<State>(token ? "verifying" : "no_token");
  const [resendEmail, setResendEmail] = useState("");
  const [resendFocused, setResendFocused] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const spotlightRef = useRef<HTMLDivElement>(null);
  const confirmUrl = process.env.NEXT_PUBLIC_CONF_EMAIL as string;
  const resendUrl = process.env.NEXT_PUBLIC_RESEND_CONF as string;

  useEffect(() => {
    if (!token) return;
    fetch(confirmUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then((res) => {
      setPageState(res.status === 200 ? "success" : "expired");
    });
  }, [token, confirmUrl]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!spotlightRef.current) return;
    const el = spotlightRef.current.parentElement!;
    const rect = el.getBoundingClientRect();
    spotlightRef.current.style.left = `${e.clientX - rect.left}px`;
    spotlightRef.current.style.top = `${e.clientY - rect.top}px`;
  };

  const handleResend = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setResendError(null);
    setPageState("resending");
    const res = await fetch(resendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resendEmail }),
    });
    if (res.status === 200) {
      setPageState("resent");
    } else if (res.status === 400) {
      setPageState("no_token");
      setResendError("This account is already verified. You can sign in directly.");
    } else if (res.status === 404) {
      setPageState("no_token");
      setResendError("No account found with this email address.");
    } else {
      setPageState("no_token");
      setResendError("Something went wrong. Please try again.");
    }
  };

  const resendInputStyle: React.CSSProperties = {
    background: "rgba(24,24,27,0.5)",
    backdropFilter: "blur(8px)",
    border: `1px solid ${resendFocused ? C.primary : C.outlineVariant}`,
    boxShadow: resendFocused ? `0 0 0 1px ${C.primary}` : "none",
    color: C.onSurface,
    width: "100%",
    borderRadius: "0.5rem",
    padding: "12px 16px",
    outline: "none",
    transition: "all 0.2s",
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: C.bg, color: C.onSurface, fontFamily: "var(--font-geist-sans), sans-serif" }}
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      <header className="fixed top-0 w-full flex justify-between items-center px-4 md:px-10 h-16 z-50">
        <div className="text-2xl font-bold tracking-tight" style={{ color: C.primary }}>EduSphere</div>
        <button className="text-sm hover:opacity-80 transition-opacity" style={{ color: C.onSurfaceVariant }}>
          Support
        </button>
      </header>

      {/* Main */}
      <main className="grow flex items-center justify-center px-4 pt-16 pb-12 relative overflow-hidden">
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

          {/* ── VERIFYING ── */}
          {pageState === "verifying" && (
            <div className="flex flex-col items-center gap-6 py-4">
              <span
                className="material-symbols-outlined animate-spin select-none"
                style={{ color: C.primary, fontSize: "48px" }}
              >
                progress_activity
              </span>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold" style={{ color: C.onSurface }}>Verifying…</h1>
                <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                  Please wait while we confirm your account.
                </p>
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {pageState === "success" && (
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
                    verified
                  </span>
                </div>
                <div
                  className="absolute inset-0 w-20 h-20 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: `${C.primary}33` }}
                />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold" style={{ color: C.onSurface }}>Account Verified!</h1>
                <p className="text-sm leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                  Your email has been confirmed. You can now sign in and start your learning journey.
                </p>
              </div>

              <a
                href="/login"
                className="w-full py-4 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: C.primary, color: C.onPrimary, boxShadow: `0 0 20px ${C.primary}33` }}
              >
                Go to Sign In
                <span className="material-symbols-outlined text-base select-none">arrow_forward</span>
              </a>

              <Footer />
            </div>
          )}

          {/* ── EXPIRED ── */}
          {pageState === "expired" && (
            <div className="flex flex-col items-center gap-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${C.error}15`, border: `1px solid ${C.error}33` }}
              >
                <span
                  className="material-symbols-outlined select-none"
                  style={{ color: C.error, fontSize: "40px", fontVariationSettings: "'FILL' 1" }}
                >
                  link_off
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold" style={{ color: C.onSurface }}>Link Expired</h1>
                <p className="text-sm leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                  This verification link is invalid or has expired. Request a new one below.
                </p>
              </div>
              <ResendForm
                email={resendEmail}
                setEmail={(v) => { setResendEmail(v); setResendError(null); }}
                setFocused={setResendFocused}
                inputStyle={resendInputStyle}
                onSubmit={handleResend}
                error={resendError}
              />
              <a href="/login" className="text-sm hover:underline underline-offset-4 hover:opacity-80" style={{ color: C.onSurfaceVariant }}>
                Back to Sign In
              </a>
            </div>
          )}

          {/* ── NO TOKEN ── */}
          {pageState === "no_token" && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative inline-block">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${C.primary}1a`, border: `1px solid ${C.primary}33`, boxShadow: `0 0 20px ${C.primary}22` }}
                >
                  <span className="material-symbols-outlined select-none" style={{ color: C.primary, fontSize: "40px" }}>
                    mark_email_unread
                  </span>
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-full animate-ping opacity-25" style={{ backgroundColor: `${C.primary}1a` }} />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold" style={{ color: C.onSurface }}>Check Your Inbox</h1>
                <p className="text-sm leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                  Didn&apos;t receive the email or it expired? Enter your email to get a new link.
                </p>
              </div>
              <ResendForm
                email={resendEmail}
                setEmail={(v) => { setResendEmail(v); setResendError(null); }}
                setFocused={setResendFocused}
                inputStyle={resendInputStyle}
                onSubmit={handleResend}
                label="Resend Verification Link"
                icon="send"
                error={resendError}
              />
              <a href="/login" className="text-sm hover:underline underline-offset-4 hover:opacity-80" style={{ color: C.onSurfaceVariant }}>
                Back to Sign In
              </a>
              <Footer />
            </div>
          )}

          {/* ── RESENDING ── */}
          {pageState === "resending" && (
            <div className="flex flex-col items-center gap-6 py-4">
              <span className="material-symbols-outlined animate-spin select-none" style={{ color: C.primary, fontSize: "48px" }}>
                progress_activity
              </span>
              <p className="text-sm" style={{ color: C.onSurfaceVariant }}>Sending a new verification link…</p>
            </div>
          )}

          {/* ── RESENT ── */}
          {pageState === "resent" && (
            <div className="flex flex-col items-center gap-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${C.primary}1a`, border: `1px solid ${C.primary}33`, boxShadow: `0 0 20px ${C.primary}33` }}
              >
                <span
                  className="material-symbols-outlined select-none"
                  style={{ color: C.primary, fontSize: "40px", fontVariationSettings: "'FILL' 1" }}
                >
                  mark_email_read
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold" style={{ color: C.onSurface }}>Link Sent!</h1>
                <p className="text-sm leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                  A new verification link has been sent to your inbox. The link is valid for{" "}
                  <span className="font-medium" style={{ color: C.onSurface }}>5 minutes</span>.
                  Check your spam folder if you don&apos;t see it.
                </p>
              </div>
              <button
                onClick={() => { setPageState("no_token"); setResendEmail(""); }}
                className="text-sm hover:underline underline-offset-4 hover:opacity-80"
                style={{ color: C.onSurfaceVariant }}
              >
                Didn&apos;t receive it?{" "}
                <span style={{ color: C.primary }}>Try again</span>
              </button>
              <Footer />
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer
        className="flex flex-col md:flex-row justify-between items-center py-6 px-4 md:px-10 w-full"
        style={{ borderTop: `1px solid ${C.outlineVariant}`, backgroundColor: C.surfaceContainerLowest }}
      >
        <div className="text-sm font-medium mb-4 md:mb-0" style={{ color: C.onSurface }}>EduSphere</div>
        <p className="text-xs mb-4 md:mb-0" style={{ color: C.onSurfaceVariant }}>
          © {new Date().getFullYear()} EduSphere LMS. Professional Growth Redefined.
        </p>
        <div className="flex gap-6">
          {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((l) => (
            <a key={l} href="#" className="text-xs hover:opacity-80 transition-opacity" style={{ color: C.onSurfaceVariant }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

function Footer() {
  return (
    <div className="w-full pt-4" style={{ borderTop: "1px solid rgba(60,74,66,0.3)" }}>
      <p className="text-xs" style={{ color: "#86948a" }}>
        Secure verification powered by EduSphere Identity.
      </p>
    </div>
  );
}

function ResendForm({
  email, setEmail, setFocused, inputStyle, onSubmit,
  label = "Send New Link", icon = "send", error = null,
}: {
  email: string;
  setEmail: (v: string) => void;
  setFocused: (v: boolean) => void;
  inputStyle: React.CSSProperties;
  onSubmit: (e: React.SubmitEvent) => void;
  label?: string;
  icon?: string;
  error?: string | null;
}) {
  return (
    <form className="w-full space-y-4" onSubmit={onSubmit}>
      <input
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        style={inputStyle}
      />
      {error && (
        <div
          className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm"
          style={{ backgroundColor: "#ffb4ab15", border: "1px solid #ffb4ab33", color: "#ffb4ab" }}
        >
          <span className="material-symbols-outlined text-base shrink-0 mt-0.5 select-none">error</span>
          <span>{error}</span>
          {error.includes("already verified") && (
            <a href="/login" className="ml-auto shrink-0 text-xs underline hover:opacity-80" style={{ color: "#4edea3" }}>
              Sign in
            </a>
          )}
        </div>
      )}
      <button
        type="submit"
        className="w-full py-4 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: "#4edea3", color: "#003824", boxShadow: "0 0 20px rgba(78,222,163,0.2)" }}
      >
        {label}
        <span className="material-symbols-outlined text-base select-none">{icon}</span>
      </button>
    </form>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense>
      <ConfirmEmailContent />
    </Suspense>
  );
}
