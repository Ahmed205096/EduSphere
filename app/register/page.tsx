"use client";

import { useRef, useState } from "react";
import { C, glassCard } from "./_components/colors";
import StepOne from "./_components/StepOne";
import StepTwo, { type Role } from "./_components/StepTwo";
import Footer from "../components/Footer/Footer";

export default function Register() {
  const [step, setStep] = useState<1 | 2>(1);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cardRef = useRef<HTMLElement>(null);
  const registerUrl = process.env.NEXT_PUBLIC_REGISTER as string;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const handleNext = (e: React.SubmitEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(registerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, bio, image: avatarBase64 }),
      });
      if (res.status === 201) {
        setDone(true);
      } else {
        const msg = await res.json();
        setError(typeof msg === "string" ? msg : "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ backgroundColor: C.bg, color: C.onSurface, fontFamily: "var(--font-geist-sans), sans-serif" }}
    >
      {/* Atmospheric blobs */}
      <div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full -z-10 pointer-events-none"
        style={{ backgroundColor: `${C.primary}1a`, filter: "blur(120px)" }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full -z-10 pointer-events-none"
        style={{ backgroundColor: "#ffb3af0d", filter: "blur(100px)" }}
      />

      {/* Header */}
      <header className="fixed top-0 w-full flex justify-between items-center px-4 md:px-10 h-16 z-50">
        <div className="text-2xl font-bold tracking-tight" style={{ color: C.primary }}>
          EduSphere
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hidden md:block text-sm hover:opacity-80" style={{ color: C.onSurfaceVariant }}>
            Support
          </a>
          <a
            href="/login"
            className="text-sm px-4 py-2 rounded-lg hover:opacity-80 transition-all"
            style={{ color: C.onSurface, backgroundColor: C.surfaceContainerHigh }}
          >
            Log In
          </a>
        </div>
      </header>

      {/* Card */}
      <main className="grow flex items-center justify-center pt-24 pb-12 px-4 md:px-10">
        <section ref={cardRef} className="w-full max-w-lg spotlight-effect" onMouseMove={handleMouseMove}>
          <div className="spotlight-overlay" />
          <div className="rounded-xl p-8 md:p-12" style={glassCard}>

            {done ? (
              /* ── Success screen ── */
              <div className="flex flex-col items-center text-center py-4 gap-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${C.primary}1a` }}
                >
                  <span
                    className="material-symbols-outlined select-none"
                    style={{ color: C.primary, fontSize: "48px", fontVariationSettings: "'FILL' 1" }}
                  >
                    mark_email_read
                  </span>
                </div>

                <div className="space-y-2">
                  <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: C.onSurface }}
                  >
                    Check Your Inbox
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                    We sent a confirmation link to{" "}
                    <span className="font-medium" style={{ color: C.onSurface }}>{email}</span>.
                    <br />
                    Click the link in the email to activate your account.
                  </p>
                </div>

                <div
                  className="w-full rounded-lg px-4 py-3 flex items-start gap-3 text-sm"
                  style={{ backgroundColor: C.surfaceContainerLowest, border: `1px solid ${C.outlineVariant}` }}
                >
                  <span
                    className="material-symbols-outlined text-base shrink-0 mt-0.5 select-none"
                    style={{ color: C.onSurfaceVariant }}
                  >
                    info
                  </span>
                  <p style={{ color: C.onSurfaceVariant }}>
                    The link expires in <span className="font-medium" style={{ color: C.onSurface }}>5 minutes</span>. Check your spam folder if you don&apos;t see it.
                  </p>
                </div>

                <a
                  href="/login"
                  className="w-full py-3 rounded-lg text-sm font-bold uppercase tracking-widest text-center transition-all hover:opacity-90"
                  style={{ backgroundColor: C.surfaceContainerHigh, color: C.onSurface }}
                >
                  Go to Log In
                </a>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-8 justify-center">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.primary }} />
                  <div
                    className="h-px w-10 transition-colors duration-300"
                    style={{ backgroundColor: step === 2 ? C.primary : C.outlineVariant }}
                  />
                  <div
                    className="w-2 h-2 rounded-full transition-colors duration-300"
                    style={{ backgroundColor: step === 2 ? C.primary : C.outlineVariant }}
                  />
                </div>

                {step === 1 ? (
                  <StepOne
                    name={name} email={email} password={password}
                    setName={setName} setEmail={setEmail} setPassword={setPassword}
                    onNext={handleNext}
                  />
                ) : (
                  <StepTwo
                    role={role} bio={bio} avatarPreview={avatarPreview}
                    setRole={setRole} setBio={setBio}
                    onAvatarChange={(b64, preview) => { setAvatarBase64(b64); setAvatarPreview(preview); }}
                    onBack={() => setStep(1)}
                    onSubmit={handleSubmit}
                    loading={loading} error={error}
                  />
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
     <Footer />
    </div>
  );
}
