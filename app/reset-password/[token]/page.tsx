"use client";

import { use, useRef, useState } from "react";

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
  warning: "#fc7c78",
} as const;

const glassCard: React.CSSProperties = {
  background: "rgba(24,24,27,0.7)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
};

type PageState = "idle" | "loading" | "success" | "expired";

function PasswordRules({ password }: { password: string }) {
  if (!password) return null;
  const rules: [boolean, string][] = [
    [password.length >= 8, "At least 8 characters"],
    [/[A-Z]/.test(password), "One uppercase letter"],
    [/[0-9]/.test(password), "One number"],
  ];
  const met = rules.filter(([v]) => v).length;
  const barColor = (bar: number) =>
    met === 0 ? C.outline
    : met === 1 ? (bar === 1 ? C.error : C.outline)
    : met === 2 ? (bar <= 2 ? C.warning : C.outline)
    : C.primary;

  return (
    <div className="space-y-2 px-0.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((b) => (
          <div key={b} className="h-1 flex-1 rounded-full transition-colors duration-300" style={{ backgroundColor: barColor(b) }} />
        ))}
      </div>
      <ul className="space-y-1">
        {rules.map(([ok, text]) => (
          <li key={text} className="flex items-center gap-1.5 text-xs">
            <span
              className="material-symbols-outlined select-none"
              style={{ color: ok ? C.primary : C.outline, fontSize: "14px" }}
            >
              {ok ? "check_circle" : "radio_button_unchecked"}
            </span>
            <span style={{ color: ok ? C.onSurface : C.onSurfaceVariant }}>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResetPassword({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newFocused, setNewFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [pageState, setPageState] = useState<PageState>("idle");
  const [error, setError] = useState<string | null>(null);

  const spotlightRef = useRef<HTMLDivElement>(null);
  const resetUrl = process.env.NEXT_PUBLIC_RESEND_PASS as string;

  const passwordStrong = newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = passwordStrong && passwordsMatch;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!spotlightRef.current) return;
    const el = spotlightRef.current.parentElement!;
    const rect = el.getBoundingClientRect();
    spotlightRef.current.style.left = `${e.clientX - rect.left}px`;
    spotlightRef.current.style.top = `${e.clientY - rect.top}px`;
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setPageState("loading");
    const res = await fetch(resetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    if (res.status === 200) {
      setPageState("success");
    } else if (res.status === 400) {
      setPageState("expired");
    } else {
      setError("Something went wrong. Please try again.");
      setPageState("idle");
    }
  };

  const inputStyle = (focused: boolean, invalid?: boolean): React.CSSProperties => ({
    background: "rgba(24,24,27,0.5)",
    backdropFilter: "blur(8px)",
    border: `1px solid ${invalid ? C.error : focused ? C.primary : C.outlineVariant}`,
    boxShadow: invalid ? `0 0 0 1px ${C.error}` : focused ? `0 0 0 1px ${C.primary}` : "none",
    color: C.onSurface,
    width: "100%",
    borderRadius: "0.5rem",
    padding: "12px 48px 12px 44px",
    outline: "none",
    transition: "all 0.2s",
  });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: C.bg, color: C.onSurface, fontFamily: "var(--font-geist-sans), sans-serif" }}
      onMouseMove={handleMouseMove}
    >
      <div
        className="fixed top-1/3 right-1/4 w-80 h-80 rounded-full -z-10 pointer-events-none"
        style={{ backgroundColor: `${C.primary}0f`, filter: "blur(100px)" }}
      />

      {/* Header */}
      <header className="fixed top-0 w-full flex justify-between items-center px-4 md:px-10 h-16 z-50">
        <a className="text-2xl font-bold tracking-tight" href="/" style={{ color: C.primary }}>EduSphere</a>
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
          <div
            className="absolute top-0 left-0 w-full h-[2px] opacity-50"
            style={{ background: `linear-gradient(90deg, transparent, ${C.primary}, transparent)` }}
          />

          {/* ── SUCCESS ── */}
          {pageState === "success" && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative inline-block">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${C.primary}1a`, border: `1px solid ${C.primary}33`, boxShadow: `0 0 20px ${C.primary}33` }}
                >
                  <span
                    className="material-symbols-outlined select-none"
                    style={{ color: C.primary, fontSize: "40px", fontVariationSettings: "'FILL' 1" }}
                  >
                    lock_open
                  </span>
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-full animate-ping opacity-20" style={{ backgroundColor: `${C.primary}33` }} />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold" style={{ color: C.onSurface }}>Password Updated!</h1>
                <p className="text-sm leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
              </div>
              <a
                href="/login"
                className="w-full py-4 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: C.primary, color: C.onPrimary, boxShadow: `0 0 20px ${C.primary}33` }}
              >
                Sign In Now
                <span className="material-symbols-outlined text-base select-none">arrow_forward</span>
              </a>
              <SmallPrint />
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
                  This reset link is invalid or has expired. Request a new one from the forgot password page.
                </p>
              </div>
              <a
                href="/forgot-password"
                className="w-full py-4 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: C.primary, color: C.onPrimary, boxShadow: `0 0 20px ${C.primary}33` }}
              >
                Request New Link
                <span className="material-symbols-outlined text-base select-none">send</span>
              </a>
              <a href="/login" className="text-sm hover:opacity-80" style={{ color: C.onSurfaceVariant }}>
                Back to Sign In
              </a>
            </div>
          )}

          {/* ── IDLE / LOADING ── */}
          {(pageState === "idle" || pageState === "loading") && (
            <div className="flex flex-col items-center gap-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${C.primary}1a`, border: `1px solid ${C.primary}33`, boxShadow: `0 0 20px ${C.primary}22` }}
              >
                <span
                  className="material-symbols-outlined select-none"
                  style={{ color: C.primary, fontSize: "40px" }}
                >
                  lock_reset
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold" style={{ color: C.onSurface }}>Set New Password</h1>
                <p className="text-sm leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                  Choose a strong password for your account.
                </p>
              </div>

              <form className="w-full space-y-4 text-left" onSubmit={handleSubmit}>
                {/* New password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium ml-1" style={{ color: C.onSurfaceVariant }}>
                    New Password
                  </label>
                  <div className="relative">
                    <span
                      className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl select-none pointer-events-none"
                      style={{ color: newFocused ? C.primary : C.outline }}
                    >
                      lock
                    </span>
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setNewFocused(true)}
                      onBlur={() => setNewFocused(false)}
                      required
                      style={inputStyle(newFocused)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                      style={{ color: C.outline }}
                    >
                      <span className="material-symbols-outlined text-xl select-none">
                        {showNew ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  <PasswordRules password={newPassword} />
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium ml-1" style={{ color: C.onSurfaceVariant }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span
                      className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl select-none pointer-events-none"
                      style={{ color: confirmFocused ? C.primary : C.outline }}
                    >
                      lock_clock
                    </span>
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setConfirmFocused(true)}
                      onBlur={() => setConfirmFocused(false)}
                      required
                      style={inputStyle(
                        confirmFocused,
                        confirmPassword.length > 0 && !passwordsMatch,
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                      style={{ color: C.outline }}
                    >
                      <span className="material-symbols-outlined text-xl select-none">
                        {showConfirm ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p
                      className="text-xs ml-1 flex items-center gap-1"
                      style={{ color: passwordsMatch ? C.primary : C.error }}
                    >
                      <span className="material-symbols-outlined select-none" style={{ fontSize: "14px" }}>
                        {passwordsMatch ? "check_circle" : "cancel"}
                      </span>
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>

                {error && (
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                    style={{ backgroundColor: `${C.error}15`, border: `1px solid ${C.error}33`, color: C.error }}
                  >
                    <span className="material-symbols-outlined text-base select-none">error</span>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || pageState === "loading"}
                  className="w-full py-4 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
                  style={{ backgroundColor: C.primary, color: C.onPrimary, boxShadow: `0 0 20px ${C.primary}33` }}
                >
                  {pageState === "loading" ? (
                    <span className="material-symbols-outlined animate-spin select-none">progress_activity</span>
                  ) : (
                    <>
                      Reset Password
                      <span className="material-symbols-outlined text-base select-none">lock_open</span>
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

              <SmallPrint />
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer
        className="flex flex-col md:flex-row justify-between items-center py-6 px-4 md:px-10 w-full"
        style={{ borderTop: `1px solid ${C.outlineVariant}`, backgroundColor: C.surfaceContainerLowest }}
      >
        <div className="text-sm font-medium mb-4 md:mb-0" style={{ color: C.onSurface }}>EduSphere LMS</div>
        <p className="text-xs mb-4 md:mb-0" style={{ color: C.onSurfaceVariant }}>
          © {new Date().getFullYear()} EduSphere LMS. Professional Growth Redefined.
        </p>
        <div className="flex gap-6">
          {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((l) => (
            <a key={l} href="#" className="text-xs hover:opacity-80" style={{ color: C.onSurfaceVariant }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

function SmallPrint() {
  return (
    <div className="w-full pt-4" style={{ borderTop: "1px solid rgba(60,74,66,0.3)" }}>
      <p className="text-xs" style={{ color: "#86948a" }}>
        Secure password reset powered by EduSphere Identity.
      </p>
    </div>
  );
}
