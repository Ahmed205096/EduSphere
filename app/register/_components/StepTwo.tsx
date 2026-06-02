"use client";

import { useRef, useState } from "react";
import { C, inputBase, primaryBtn } from "./colors";

export type Role = "student" | "instructor";

interface Props {
  role: Role;
  bio: string;
  avatarPreview: string | null;
  setRole: (r: Role) => void;
  setBio: (v: string) => void;
  onAvatarChange: (base64: string, preview: string) => void;
  onBack: () => void;
  onSubmit: (e: React.SubmitEvent) => void;
  loading: boolean;
  error: string;
}

const ROLES: { value: Role; icon: string; label: string }[] = [
  { value: "student", icon: "school", label: "Student" },
  { value: "instructor", icon: "cast_for_education", label: "Instructor" },
];

export default function StepTwo({
  role, bio, avatarPreview,
  setRole, setBio, onAvatarChange,
  onBack, onSubmit, loading, error,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bioFocused, setBioFocused] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onAvatarChange(result, result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="mb-10 text-center">
        <h1
          className="text-[32px] md:text-[48px] font-bold leading-tight tracking-tight mb-2"
          style={{ color: C.onSurface }}
        >
          Complete Your Profile
        </h1>
        <p className="text-lg" style={{ color: C.onSurfaceVariant }}>
          Tell us a bit about yourself.
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        {/* Role selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium ml-1" style={{ color: C.onSurfaceVariant }}>
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(({ value, icon, label }) => {
              const selected = role === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-200"
                  style={{
                    border: `1px solid ${selected ? C.primary : C.outlineVariant}`,
                    backgroundColor: selected ? `${C.primary}1a` : C.surfaceContainerLowest,
                    color: selected ? C.primary : C.onSurfaceVariant,
                  }}
                >
                  <span className="material-symbols-outlined text-4xl select-none">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Avatar upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium ml-1" style={{ color: C.onSurfaceVariant }}>
            Profile Picture
          </label>
          <div
            role="button"
            tabIndex={0}
            className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors"
            style={{
              border: `1px solid ${C.outlineVariant}`,
              backgroundColor: C.surfaceContainerLowest,
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-14 h-14 rounded-full object-cover shrink-0"
                style={{ border: `2px solid ${C.primary}` }}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: C.surfaceContainerHigh,
                  border: `2px dashed ${C.outline}`,
                }}
              >
                <span
                  className="material-symbols-outlined text-2xl select-none"
                  style={{ color: C.onSurfaceVariant }}
                >
                  add_a_photo
                </span>
              </div>
            )}
            <div>
              <p className="text-sm" style={{ color: C.onSurface }}>
                {avatarPreview ? "Change photo" : "Upload a photo"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>
                JPG, PNG or WEBP
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="block text-sm font-medium ml-1" style={{ color: C.onSurfaceVariant }}>
            Bio
          </label>
          <textarea
            placeholder="Tell us about your background, interests, or goals..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            onFocus={() => setBioFocused(true)}
            onBlur={() => setBioFocused(false)}
            rows={3}
            className="w-full rounded-lg px-4 py-3 outline-none resize-none transition-all"
            style={inputBase(bioFocused, C)}
          />
        </div>

        {error && (
          <p className="text-sm text-center" style={{ color: C.error }}>
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 px-5 py-4 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{
              border: `1px solid ${C.outlineVariant}`,
              color: C.onSurfaceVariant,
              backgroundColor: "transparent",
            }}
          >
            <span className="material-symbols-outlined text-base select-none">arrow_back</span>
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={primaryBtn}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
            By clicking &#34;Create Account&#34;, you agree to our{" "}
            <a href="#" className="hover:underline" style={{ color: C.primary }}>
              Terms of Service
            </a>
            .
          </p>
        </div>
      </form>
    </>
  );
}
