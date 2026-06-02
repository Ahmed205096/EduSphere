"use client";
import { useRef } from "react";
import PlyrVideoPlayer from "@/app/components/media/PlyrVideoPlayer";
import type { LessonDraft } from "./types";

type Props = {
  lesson: LessonDraft;
  onChange: (patch: Partial<LessonDraft>) => void;
  onRemove: () => void;
};

const input =
  "w-full bg-surface-container/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary/50";

export default function LessonItem({ lesson, onChange, onRemove }: Props) {
  const videoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({
      videoFile: file,
      videoPreview: URL.createObjectURL(file),
      duration: "",
    });
  }

  function clearVideo() {
    onChange({ videoFile: null, videoPreview: null, duration: "" });
    if (videoRef.current) videoRef.current.value = "";
  }

  function handleAttachment(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ attachmentFile: file });
  }

  function clearAttachment() {
    onChange({ attachmentFile: null });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="bg-surface-container-low rounded-xl p-4 space-y-3 border border-white/5">
      {/* Row 1: order badge + title + remove */}
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-surface-container-highest text-on-surface-variant flex items-center justify-center text-[11px] font-bold shrink-0">
          {lesson.order}
        </span>
        <input
          type="text"
          value={lesson.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Lesson title..."
          className={`${input} flex-1`}
        />
        <button
          onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-error rounded transition-colors shrink-0"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
        </button>
      </div>

      {/* Description */}
      <input
        type="text"
        value={lesson.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Short description (optional)"
        className={input}
      />

      {/* Video upload */}
      <div>
        {lesson.videoPreview ? (
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <PlyrVideoPlayer
              src={lesson.videoPreview}
              title={lesson.title || lesson.videoFile?.name || "Lesson preview"}
              mimeType={lesson.videoFile?.type}
              className="h-full"
            />
            <button
              onClick={clearVideo}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-error/80 rounded-full flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>close</span>
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white font-medium truncate max-w-[80%]">
              {lesson.videoFile?.name}
            </div>
          </div>
        ) : (
          <div
            onClick={() => videoRef.current?.click()}
            className="h-24 rounded-xl border border-dashed border-white/20 bg-surface-container/40 hover:border-primary/40 transition-colors cursor-pointer flex items-center justify-center gap-3 group"
          >
            <span
              className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors"
              style={{ fontSize: 28 }}
            >
              video_file
            </span>
            <div className="text-left">
              <p className="text-[13px] font-medium text-on-surface-variant group-hover:text-primary transition-colors">
                Upload video
              </p>
              <p className="text-[11px] text-on-surface-variant/60">MP4, MOV, WebM</p>
            </div>
          </div>
        )}
        <input
          ref={videoRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          onChange={handleVideo}
          className="hidden"
        />
      </div>

      {/* Attachment upload */}
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
            {lesson.attachmentFile?.name || "Attach lesson file"}
          </p>
          <p className="text-[11px] text-on-surface-variant/60">
            PDF, zip, document, or exercise file
          </p>
        </div>
        {lesson.attachmentFile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearAttachment();
            }}
            className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-error rounded transition-colors shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              close
            </span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          onChange={handleAttachment}
          className="hidden"
        />
      </div>

      {/* Duration + Free preview */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span
            className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
            style={{ fontSize: 15 }}
          >
            schedule
          </span>
          <input
            type="number"
            min={0}
            value={lesson.duration ?? ""}
            onChange={(e) => onChange({ duration: e.target.value })}
            placeholder="Duration (min)"
            className={`${input} pl-8`}
          />
        </div>

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
          <span className="text-[12px] text-on-surface-variant">Free preview</span>
        </label>
      </div>
    </div>
  );
}
