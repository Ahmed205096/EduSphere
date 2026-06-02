"use client";
import { useRef } from "react";
import type { CourseData } from "./types";

const categories = ["Development", "Design", "Business", "Marketing", "Data Science", "Other"];
const levels = ["beginner", "intermediate", "advanced"];
const statuses = ["draft", "published"];

type Props = {
  data: CourseData;
  onChange: (patch: Partial<CourseData>) => void;
  onNext: () => void;
};

const label = "block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5";
const input = "w-full bg-surface-container-low border border-white/10 rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/50";

export default function Step1CourseInfo({ data, onChange, onNext }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ thumbnail: file, thumbnailPreview: URL.createObjectURL(file) });
  }

  const canNext = !!(data.title && data.description && data.thumbnail && data.category && data.level);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (canNext) onNext(); }}
      className="space-y-5"
    >
      {/* Thumbnail */}
      <div>
        <label className={label}>Thumbnail</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative h-40 w-full rounded-xl border border-dashed border-white/20 bg-surface-container-low hover:border-primary/40 transition-colors cursor-pointer overflow-hidden flex items-center justify-center group"
        >
          {data.thumbnailPreview ? (
            <img src={data.thumbnailPreview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-on-surface-variant group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: 36 }}>add_photo_alternate</span>
              <span className="text-xs font-medium">Click to upload thumbnail</span>
            </div>
          )}
          {data.thumbnailPreview && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 28 }}>edit</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>

      {/* Title */}
      <div>
        <label className={label}>Title</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Advanced React Patterns"
          required
          className={input}
        />
      </div>

      {/* Description */}
      <div>
        <label className={label}>Description</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="What will students learn in this course?"
          rows={4}
          required
          className={`${input} resize-none`}
        />
      </div>

      {/* Category + Level */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Category</label>
          <select
            value={data.category}
            onChange={(e) => onChange({ category: e.target.value })}
            required
            className={input}
          >
            <option value="" disabled>Select category...</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Level</label>
          <select
            value={data.level}
            onChange={(e) => onChange({ level: e.target.value })}
            required
            className={input}
          >
            <option value="" disabled>Select level...</option>
            {levels.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className={label}>Status</label>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ status: s })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all capitalize ${
                data.status === s
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "border-white/10 text-on-surface-variant hover:bg-white/5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={!canNext}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
        </button>
      </div>
    </form>
  );
}
