"use client";

import { useRef, useState } from "react";
import PlyrVideoPlayer from "@/app/components/media/PlyrVideoPlayer";

export type LessonEdit = {
  _id: string;
  title: string;
  description: string;
  isPreview: boolean;
  duration?: number;
  videoKEY?: string;
  videoURL?: string;
  videoFile?: File | null;
  videoPreview?: string | null;
  fileKEY?: string;
  fileURL?: string;
  fileFile?: File | null;
  order: number;
  dirty: boolean;
};

export type ModuleEdit = {
  _id: string;
  title: string;
  order: number;
  lessons: LessonEdit[];
  dirty: boolean;
  expanded: boolean;
};

type Props = {
  modules: ModuleEdit[];
  loading: boolean;
  message: string;
  onModuleChange: (id: string, patch: Partial<ModuleEdit>) => void;
  onModuleToggle: (id: string) => void;
  onModuleSave: (module: ModuleEdit) => void;
  onLessonChange: (
    moduleId: string,
    lessonId: string,
    patch: Partial<LessonEdit>,
  ) => void;
  onLessonSave: (lesson: LessonEdit) => void;
  onSaveAll: () => void;
};

const inputCls =
  "w-full bg-surface-container/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/50";

export default function CurriculumEditor({
  modules,
  loading,
  message,
  onModuleChange,
  onModuleToggle,
  onModuleSave,
  onLessonChange,
  onLessonSave,
  onSaveAll,
}: Props) {
  return (
    <section className="glass-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-[15px] font-semibold text-on-surface">Curriculum</h3>
      </div>

      <div className="p-6">
        {modules.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant">
            <span
              className="material-symbols-outlined block mx-auto mb-2"
              style={{ fontSize: 36 }}
            >
              library_books
            </span>
            <p className="text-sm">No modules found for this course.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((mod) => (
              <div
                key={mod._id}
                className="border border-white/10 rounded-xl overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => onModuleToggle(mod._id)}
                >
                  <span
                    className={`material-symbols-outlined text-on-surface-variant transition-transform ${
                      mod.expanded ? "rotate-90" : ""
                    }`}
                    style={{ fontSize: 18 }}
                  >
                    chevron_right
                  </span>
                  <input
                    type="text"
                    value={mod.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      onModuleChange(mod._id, { title: e.target.value })
                    }
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40"
                  />
                  <input
                    type="number"
                    min={1}
                    value={mod.order}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      onModuleChange(mod._id, { order: Number(e.target.value) })
                    }
                    className="w-16 bg-surface-container-low border border-white/10 rounded-lg px-2 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  {mod.dirty && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onModuleSave(mod);
                      }}
                      className="text-[11px] text-primary bg-primary/10 px-2 py-1 rounded font-semibold hover:bg-primary/20 transition-colors"
                    >
                      Save
                    </button>
                  )}
                  <span className="text-[11px] text-on-surface-variant shrink-0">
                    {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {mod.expanded && (
                  <div className="border-t border-white/5 divide-y divide-white/5">
                    {mod.lessons.map((lesson) => (
                      <LessonRow
                        key={lesson._id}
                        lesson={lesson}
                        onChange={(patch) =>
                          onLessonChange(mod._id, lesson._id, patch)
                        }
                        onSave={() => onLessonSave(lesson)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              {message && (
                <p
                  className={`text-[12px] ${
                    message.includes("saved") ? "text-primary" : "text-error"
                  }`}
                >
                  {message}
                </p>
              )}
              <button
                onClick={onSaveAll}
                disabled={loading}
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
                Save All Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function LessonRow({
  lesson,
  onChange,
  onSave,
}: {
  lesson: LessonEdit;
  onChange: (patch: Partial<LessonEdit>) => void;
  onSave: () => void;
}) {
  const videoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  function handleVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (lesson.videoPreview) URL.revokeObjectURL(lesson.videoPreview);
    onChange({ videoFile: file, videoPreview: URL.createObjectURL(file) });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ fileFile: file });
  }

  return (
    <div className="px-4 py-3 bg-surface-container/30">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={{ fontSize: 14 }}
        >
          play_circle
        </span>
        <span className="flex-1 min-w-0 text-[13px] text-on-surface font-medium truncate">
          {lesson.title || (
            <em className="text-on-surface-variant">Untitled lesson</em>
          )}
        </span>
        {lesson.isPreview && (
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
            Preview
          </span>
        )}
        {lesson.dirty && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded font-semibold hover:bg-primary/20 transition-colors"
          >
            Save
          </button>
        )}
        <span
          className={`material-symbols-outlined text-on-surface-variant transition-transform ${
            open ? "rotate-180" : ""
          }`}
          style={{ fontSize: 16 }}
        >
          expand_more
        </span>
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          <input
            type="text"
            value={lesson.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Lesson title..."
            className={inputCls}
          />
          <input
            type="text"
            value={lesson.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Description (optional)"
            className={inputCls}
          />

          {lesson.videoPreview || lesson.videoURL ? (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
              <PlyrVideoPlayer
                src={(lesson.videoPreview || lesson.videoURL)!}
                title={lesson.title || "Lesson preview"}
                mimeType={lesson.videoFile?.type}
                className="h-full"
              />
              <button
                onClick={() => videoRef.current?.click()}
                className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 hover:bg-primary/90 rounded-lg text-[11px] text-white font-semibold transition-colors"
              >
                Replace
              </button>
            </div>
          ) : (
            <div
              onClick={() => videoRef.current?.click()}
              className="h-20 rounded-xl border border-dashed border-white/20 hover:border-primary/40 transition-colors cursor-pointer flex items-center justify-center gap-3 group"
            >
              <span
                className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors"
                style={{ fontSize: 22 }}
              >
                video_file
              </span>
              <span className="text-[13px] text-on-surface-variant group-hover:text-primary transition-colors">
                Upload video
              </span>
            </div>
          )}
          <input
            ref={videoRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            onChange={handleVideo}
            className="hidden"
          />

          <div
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border border-white/10 bg-surface-container/40 hover:border-primary/30 transition-colors cursor-pointer px-3 py-2.5 flex items-center gap-3"
          >
            <span
              className="material-symbols-outlined text-on-surface-variant"
              style={{ fontSize: 20 }}
            >
              attach_file
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-on-surface truncate">
                {lesson.fileFile?.name ||
                  (lesson.fileURL ? "Current attachment" : "Attach lesson file")}
              </p>
              <p className="text-[11px] text-on-surface-variant/60">
                {lesson.fileFile
                  ? "New file selected"
                  : lesson.fileURL
                    ? "Click to replace the current file"
                    : "Optional resource or exercise file"}
              </p>
            </div>
            {lesson.fileURL && !lesson.fileFile && (
              <a
                href={lesson.fileURL}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                title="Open attachment"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  open_in_new
                </span>
              </a>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            onChange={handleFile}
            className="hidden"
          />

          <div className="grid gap-3 sm:grid-cols-[1fr_96px_auto] sm:items-center">
            <input
              type="number"
              min={0}
              value={lesson.duration ?? ""}
              onChange={(e) =>
                onChange({
                  duration: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Duration (min)"
              className={inputCls}
            />
            <input
              type="number"
              min={1}
              value={lesson.order}
              onChange={(e) => onChange({ order: Number(e.target.value) })}
              className={inputCls}
            />
            <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
              <div
                onClick={() => onChange({ isPreview: !lesson.isPreview })}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  lesson.isPreview ? "bg-primary" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    lesson.isPreview ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-[12px] text-on-surface-variant">
                Free preview
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
