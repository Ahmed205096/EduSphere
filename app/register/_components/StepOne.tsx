"use client";

import { useState } from "react";
import { C, inputBase, primaryBtn } from "./colors";

interface Props {
  name: string;
  email: string;
  password: string;
  setName: (v: string) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  onNext: (e: React.SubmitEvent) => void;
}

interface FieldProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  valid?: boolean;
  showCheck?: boolean;
}

function Field({ label, type, placeholder, value, onChange, valid, showCheck }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium ml-1" style={{ color: C.onSurfaceVariant }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-lg px-4 py-3 outline-none transition-all"
          style={inputBase(focused, C)}
        />
        {showCheck && valid && (
          <span
            className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-xl select-none"
            style={{ color: C.primary }}
          >
            check_circle
          </span>
        )}
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const hasMin = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const strength = [hasMin, hasUpper, hasNumber].filter(Boolean).length;

  if (password.length === 0) return null;

  const barColor = (bar: number) => {
    if (strength === 0) return C.surfaceContainerHighest;
    if (strength === 1) return bar === 1 ? C.error : C.surfaceContainerHighest;
    if (strength === 2) return bar <= 2 ? C.warning : C.surfaceContainerHighest;
    return C.primary;
  };

  const rules: [boolean, string][] = [
    [hasMin, "At least 8 characters"],
    [hasUpper, "One uppercase letter"],
    [hasNumber, "One number"],
  ];

  return (
    <div className="space-y-2 px-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ backgroundColor: barColor(bar) }}
          />
        ))}
      </div>
      <ul className="space-y-1">
        {rules.map(([met, text]) => (
          <li key={text} className="flex items-center gap-1.5 text-xs transition-colors duration-200">
            <span
              className="material-symbols-outlined text-sm leading-none select-none"
              style={{ color: met ? C.primary : C.outline, fontSize: "14px" }}
            >
              {met ? "check_circle" : "radio_button_unchecked"}
            </span>
            <span style={{ color: met ? C.onSurface : C.onSurfaceVariant }}>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StepOne({
  name, email, password,
  setName, setEmail, setPassword,
  onNext,
}: Props) {
  const [pwFocused, setPwFocused] = useState(false);

  const nameValid = name.length > 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordStrong =
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const canNext = nameValid && emailValid && passwordStrong;

  return (
    <>
      <div className="mb-10 text-center">
        <h1
          className="text-[32px] md:text-[48px] font-bold leading-tight tracking-tight mb-2"
          style={{ color: C.onSurface }}
        >
          Elevate Your Career
        </h1>
        <p className="text-lg" style={{ color: C.onSurfaceVariant }}>
          Join the next generation of professional mastery.
        </p>
      </div>

      <form className="space-y-6" onSubmit={onNext}>
        <Field
          label="Full Name"
          type="text"
          placeholder="Alex Rivers"
          value={name}
          onChange={setName}
          valid={nameValid}
          showCheck
        />
        <Field
          label="Email Address"
          type="email"
          placeholder="alex@edusphere.io"
          value={email}
          onChange={setEmail}
          valid={emailValid}
          showCheck
        />

        {/* Password field with inline focus tracking */}
        <div className="space-y-2">
          <label className="block text-sm font-medium ml-1" style={{ color: C.onSurfaceVariant }}>
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              className="w-full rounded-lg px-4 py-3 outline-none transition-all"
              style={inputBase(pwFocused, C)}
            />
            {passwordStrong && (
              <span
                className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-xl select-none"
                style={{ color: C.primary }}
              >
                check_circle
              </span>
            )}
          </div>
          <PasswordStrength password={password} />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!canNext}
            className="w-full py-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            style={primaryBtn}
          >
            Next
            <span className="material-symbols-outlined text-base select-none">arrow_forward</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
            Already have an account?{" "}
            <a href="/login" className="hover:underline" style={{ color: C.primary }}>
              Log in
            </a>
          </p>
        </div>
      </form>
    </>
  );
}
