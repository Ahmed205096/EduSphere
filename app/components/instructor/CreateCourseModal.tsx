"use client";
import { useState, useRef } from "react";
import { useCustomeSession } from "@/store";

type Props = { onClose: () => void };

const categories = ["Development", "Design", "Business", "Marketing", "Data Science", "Other"];
const levels = ["beginner", "intermediate", "advanced"];
const statuses = ["draft", "published"];

export default function CreateCourseModal({ onClose }: Props) {
  const { session } = useCustomeSession();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("Draft");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!session?.user?.id) {
      setError("Session expired. Please login again.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("thumbnail", thumbnail!);
      form.append("category", category);
      form.append("level", level);
      form.append("status", status);
      form.append("instructorId", session.user.id);

      const res = await fetch(process.env.NEXT_PUBLIC_ADD_COURSE!, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data === "string" ? data : "Failed to create course");
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-on-surface">Create New Course</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Thumbnail */}
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Thumbnail
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative h-36 w-full rounded-xl border border-dashed border-white/20 bg-surface-container-low hover:border-primary/50 transition-colors cursor-pointer overflow-hidden flex items-center justify-center group"
            >
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-on-surface-variant group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: 32 }}>upload</span>
                  <span className="text-xs font-medium">Click to upload image</span>
                </div>
              )}
              {preview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 28 }}>edit</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced React Patterns"
              required
              className="w-full bg-surface-container-low border border-white/10 rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the course..."
              rows={3}
              required
              className="w-full bg-surface-container-low border border-white/10 rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Category + Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-surface-container-low border border-white/10 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="" disabled>Select...</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
                className="w-full bg-surface-container-low border border-white/10 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="" disabled>Select...</option>
                {levels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Status
            </label>
            <div className="flex gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    status === s
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "border-white/10 text-on-surface-variant hover:bg-white/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-error bg-error/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !thumbnail || !category || !level}
              className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
