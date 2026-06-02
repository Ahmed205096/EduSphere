"use client";

type Props = {
  title: string;
  description: string;
  status: "draft" | "published" | "suspended";
  loading: boolean;
  message: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (value: "draft" | "published" | "suspended") => void;
  onSave: () => void;
};

const inputCls =
  "w-full bg-surface-container-low border border-white/10 rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/50";

export default function CourseInfoEditor({
  title,
  description,
  status,
  loading,
  message,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  onSave,
}: Props) {
  return (
    <section className="glass-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-[15px] font-semibold text-on-surface">Course Info</h3>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Course title..."
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Course description..."
            rows={4}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Visibility
          </label>
          <select
            value={status}
            onChange={(e) =>
              onStatusChange(
                e.target.value as "draft" | "published" | "suspended",
              )
            }
            className={inputCls}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-1">
          {message && (
            <p
              className={`text-[12px] ${
                message.includes("success") ? "text-primary" : "text-error"
              }`}
            >
              {message}
            </p>
          )}
          <button
            onClick={onSave}
            disabled={loading || !title.trim()}
            className="ml-auto px-5 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-2"
          >
            {loading && (
              <span
                className="material-symbols-outlined animate-spin"
                style={{ fontSize: 16 }}
              >
                progress_activity
              </span>
            )}
            Save Course
          </button>
        </div>
      </div>
    </section>
  );
}
