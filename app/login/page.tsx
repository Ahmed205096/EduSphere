"use client";

import { useCustomeSession } from "@/store";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { C } from "../register/_components/colors";


const inputStyle = (focused: boolean): React.CSSProperties => ({
  background: "rgba(24,24,27,0.7)",
  backdropFilter: "blur(12px)",
  border: `1px solid ${focused ? C.primary : "rgba(255,255,255,0.1)"}`,
  boxShadow: focused ? `0 0 0 1px ${C.primary}` : "none",
  color: C.onSurface,
});

type ErrorState = "credentials" | "rateLimit" | "notConfirmed" | null;
type ResendState = "idle" | "loading" | "success" | "error";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errorState, setErrorState] = useState<ErrorState>(null);
  const [loading, setLoading] = useState(false);
  const [resendState, setResendState] = useState<ResendState>("idle");

  const rightRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const loginUrl = process.env.NEXT_PUBLIC_LOGIN as string;
  const resendConfirmationUrl =
    process.env.NEXT_PUBLIC_RESEND_CONF ?? "/api/auth/resend-confirmation";
  const router = useRouter();
  const fetchSession = useCustomeSession((state) => state.fetchSession);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!rightRef.current || !spotlightRef.current) return;
    const rect = rightRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(78,222,163,0.05) 0%, transparent 60%)`;
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorState(null);
    setResendState("idle");
    const res = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.status === 200) {
      await fetchSession();
      router.replace("/");
    } else if (res.status === 400) setErrorState("credentials");
    else if (res.status === 429) setErrorState("rateLimit");
    else if (res.status === 403) setErrorState("notConfirmed");
  };

  const handleResendConfirmation = async () => {
    if (!email || resendState === "loading") return;

    setResendState("loading");
    try {
      const res = await fetch(resendConfirmationUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setResendState(res.ok ? "success" : "error");
    } catch {
      setResendState("error");
    }
  };

  const errorMessage: Record<NonNullable<ErrorState>, string> = {
    credentials: "Incorrect email or password.",
    rateLimit: "Too many attempts. Please try again in 15 minutes.",
    notConfirmed: "Please verify your email. Check your inbox and spam folder.",
  };

  return (
    <main
      className="flex min-h-screen w-full flex-col md:flex-row"
      style={{ backgroundColor: C.bg, fontFamily: "var(--font-geist-sans), sans-serif" }}
    >
      {/* ── LEFT: Hero (desktop only) ── */}
      <section
        className="relative hidden md:flex md:w-1/2 items-center justify-center overflow-hidden"
        style={{ backgroundColor: C.surfaceContainerLowest }}
      >
        {/* Animated background blobs */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 30% 40%, ${C.primary}14 0%, transparent 60%),
                         radial-gradient(ellipse at 80% 70%, ${C.primary}0a 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute bottom-12 left-12 w-48 h-48 rounded-full animate-pulse"
          style={{ backgroundColor: `${C.primary}1f`, filter: "blur(60px)" }}
        />
        <div
          className="absolute top-20 right-16 w-32 h-32 rounded-full"
          style={{ backgroundColor: `${C.primary}0f`, filter: "blur(40px)", animation: "pulse 3s ease-in-out 1s infinite" }}
        />

        {/* Grid lines overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${C.onSurface} 1px, transparent 1px), linear-gradient(90deg, ${C.onSurface} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-10 max-w-lg">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: C.primary,
                boxShadow: `0 0 20px ${C.primary}40`,
              }}
            >
              <span
                className="material-symbols-outlined select-none"
                style={{ color: C.onPrimary, fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: C.primary }}>
              EduSphere
            </h1>
          </div>

          <h2
            className="text-[48px] font-bold leading-tight tracking-tight mb-4"
            style={{ color: C.onSurface }}
          >
            Professional Growth Redefined.
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: C.onSurfaceVariant }}>
            Access the world&apos;s most advanced technical education platform designed for high-performance teams.
          </p>

          {/* Stats row */}
          <div
            className="mt-12 grid grid-cols-3 gap-6 w-full rounded-xl p-5"
            style={{ backgroundColor: "rgba(24,24,27,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {[
              { value: "50K+", label: "Learners" },
              { value: "1,200+", label: "Courses" },
              { value: "98%", label: "Satisfaction" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-xl font-bold" style={{ color: C.primary }}>{value}</span>
                <span className="text-xs" style={{ color: C.onSurfaceVariant }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RIGHT: Login Form ── */}
      <section
        ref={rightRef}
        className="relative flex flex-1 flex-col items-center justify-center px-6 md:px-16"
        style={{ backgroundColor: C.surface }}
        onMouseMove={handleMouseMove}
      >
        {/* Spotlight */}
        <div
          ref={spotlightRef}
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at center, rgba(78,222,163,0.04) 0%, transparent 60%)" }}
        />

        {/* Mobile brand header */}
        <div className="md:hidden flex flex-col items-center mb-12 mt-12">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: C.primary, boxShadow: `0 0 20px ${C.primary}40` }}
          >
            <span
              className="material-symbols-outlined select-none"
              style={{ color: C.onPrimary, fontSize: "22px", fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: C.primary }}>EduSphere</h1>
        </div>

        <div className="w-full max-w-md space-y-7 relative z-10">
          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold" style={{ color: C.onSurface }}>
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Error banner */}
          {errorState && (
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
              style={{ backgroundColor: `${C.error}15`, border: `1px solid ${C.error}40`, color: C.error }}
            >
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5 select-none">error</span>
              <span>{errorMessage[errorState]}</span>
              {errorState === "notConfirmed" && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendState === "loading" || !email}
                  className="ml-auto shrink-0 text-xs underline hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ color: C.primary }}
                >
                  {resendState === "loading" ? "Sending..." : "Resend"}
                </button>
              )}
            </div>
          )}
          {resendState === "success" && (
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
              style={{
                backgroundColor: `${C.primary}15`,
                border: `1px solid ${C.primary}40`,
                color: C.primary,
              }}
            >
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5 select-none">mark_email_read</span>
              <span>Verification email sent. Check your inbox and spam folder.</span>
            </div>
          )}
          {resendState === "error" && (
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
              style={{
                backgroundColor: `${C.error}15`,
                border: `1px solid ${C.error}40`,
                color: C.error,
              }}
            >
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5 select-none">error</span>
              <span>Could not resend the email. Please try again.</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: C.onSurfaceVariant }}>
                Email Address
              </label>
              <div className="relative">
                <span
                  className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl select-none pointer-events-none"
                  style={{ color: emailFocused ? C.primary : C.outline }}
                >
                  mail
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setResendState("idle");
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="w-full rounded-lg py-3.5 pl-12 pr-4 outline-none transition-all duration-200"
                  style={inputStyle(emailFocused)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium" style={{ color: C.onSurfaceVariant }}>
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs hover:opacity-80 transition-opacity"
                  style={{ color: C.primary }}
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span
                  className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl select-none pointer-events-none"
                  style={{ color: passwordFocused ? C.primary : C.outline }}
                >
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className="w-full rounded-lg py-3.5 pl-12 pr-12 outline-none transition-all duration-200"
                  style={inputStyle(passwordFocused)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                  style={{ color: C.outline }}
                >
                  <span className="material-symbols-outlined text-xl select-none">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: C.primary,
                color: C.onPrimary,
                boxShadow: `0 0 20px ${C.primary}26`,
              }}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin select-none">
                  progress_activity
                </span>
              ) : (
                <>
                  Sign in
                  <span className="material-symbols-outlined select-none">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: C.onSurfaceVariant }}>
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="font-bold hover:underline underline-offset-4 transition-all"
              style={{ color: C.primary }}
            >
              Sign up
            </a>
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="absolute bottom-6 text-center w-full px-4">
          <p className="text-xs" style={{ color: C.outline }}>
            © {new Date().getFullYear()} EduSphere LMS. Professional Growth Redefined.
          </p>
        </div>
      </section>
    </main>
  );
}
