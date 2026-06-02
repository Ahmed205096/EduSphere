"use client";
import { useState } from "react";
import type { ModuleDraft, LessonDraft } from "./types";
import LessonItem from "./LessonItem";

type Props = {
  modules: ModuleDraft[];
  onChange: (modules: ModuleDraft[]) => void;
  onBack: () => void;
  onNext: () => void;
};

function uid() {
  return Math.random().toString(36).slice(2);
}

function newLesson(order: number): LessonDraft {
  return {
    id: uid(),
    title: "",
    description: "",
    order,
    isPreview: false,
    videoFile: null,
    videoPreview: null,
    attachmentFile: null,
    duration: "",
  };
}

function newModule(order: number): ModuleDraft {
  return { id: uid(), title: "", order, lessons: [] };
}

export default function Step2Curriculum({ modules, onChange, onBack, onNext }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addModule() {
    const m = newModule(modules.length + 1);
    onChange([...modules, m]);
    setExpanded((prev) => new Set([...prev, m.id]));
  }

  function removeModule(id: string) {
    onChange(modules.filter((m) => m.id !== id).map((m, i) => ({ ...m, order: i + 1 })));
  }

  function updateModule(id: string, patch: Partial<ModuleDraft>) {
    onChange(modules.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function addLesson(moduleId: string) {
    onChange(
      modules.map((m) =>
        m.id !== moduleId
          ? m
          : { ...m, lessons: [...m.lessons, newLesson(m.lessons.length + 1)] }
      )
    );
  }

  function removeLesson(moduleId: string, lessonId: string) {
    onChange(
      modules.map((m) =>
        m.id !== moduleId
          ? m
          : {
              ...m,
              lessons: m.lessons
                .filter((l) => l.id !== lessonId)
                .map((l, i) => ({ ...l, order: i + 1 })),
            }
      )
    );
  }

  function updateLesson(moduleId: string, lessonId: string, patch: Partial<LessonDraft>) {
    onChange(
      modules.map((m) =>
        m.id !== moduleId
          ? m
          : { ...m, lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...patch } : l)) }
      )
    );
  }

  const canNext = modules.length > 0 && modules.every((m) => m.title.trim());

  return (
    <div className="space-y-4">
      {modules.length === 0 && (
        <div className="text-center py-12 text-on-surface-variant">
          <span
            className="material-symbols-outlined block mx-auto mb-2"
            style={{ fontSize: 40 }}
          >
            library_books
          </span>
          <p className="text-sm">No modules yet. Add your first module below.</p>
        </div>
      )}

      {modules.map((mod) => (
        <div key={mod.id} className="glass-card rounded-xl overflow-hidden">
          {/* Module header */}
          <div
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => toggle(mod.id)}
          >
            <span
              className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${
                expanded.has(mod.id) ? "rotate-90" : ""
              }`}
              style={{ fontSize: 20 }}
            >
              chevron_right
            </span>
            <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[12px] font-bold shrink-0">
              {mod.order}
            </span>
            <input
              type="text"
              value={mod.title}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateModule(mod.id, { title: e.target.value })}
              placeholder="Module title..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-on-surface placeholder:text-on-surface-variant/40"
            />
            <span className="text-[11px] text-on-surface-variant mr-2 shrink-0">
              {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeModule(mod.id);
              }}
              className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-error rounded transition-colors shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
            </button>
          </div>

          {/* Lessons */}
          {expanded.has(mod.id) && (
            <div className="border-t border-white/5 px-4 pb-4 pt-3 space-y-3">
              {mod.lessons.map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  onChange={(patch) => updateLesson(mod.id, lesson.id, patch)}
                  onRemove={() => removeLesson(mod.id, lesson.id)}
                />
              ))}
              <button
                onClick={() => addLesson(mod.id)}
                className="w-full py-2 border border-dashed border-white/20 rounded-lg text-[12px] text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                Add Lesson
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addModule}
        className="w-full py-3 border border-dashed border-white/20 rounded-xl text-sm text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
        Add Module
      </button>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-5 py-2.5 border border-white/10 text-on-surface-variant rounded-lg text-sm font-medium hover:bg-white/5 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Review
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
