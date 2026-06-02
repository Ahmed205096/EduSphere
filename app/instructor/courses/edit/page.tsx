"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CourseInfoEditor from "./_components/CourseInfoEditor";
import CurriculumEditor, {
  LessonEdit,
  ModuleEdit,
} from "./_components/CurriculumEditor";

const COURSES_URL = process.env.NEXT_PUBLIC_MANAGE_COURSES!;
const MODULES_URL = process.env.NEXT_PUBLIC_MANAGE_MODULES!;
const LESSONS_URL = process.env.NEXT_PUBLIC_MANAFE_LESSONS!;

type CourseResponse = {
  course: {
    _id: string;
    title: string;
    description: string;
    status: "draft" | "published" | "suspended";
  };
  modules: Array<{
    _id: string;
    title: string;
    order: number;
  }>;
  lessons: Array<{
    _id: string;
    moduleId: string;
    title: string;
    description?: string;
    isPreview: boolean;
    duration?: number;
    videoKEY?: string;
    videoURL?: string;
    fileKEY?: string;
    fileURL?: string;
    order: number;
  }>;
};

function normalizeId(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: string })._id);
  }
  return String(value ?? "");
}

export default function EditCoursePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-on-surface-variant">
          <p>Loading editor...</p>
        </div>
      }
    >
      <EditCourseContent />
    </Suspense>
  );
}

function EditCourseContent() {
  const router = useRouter();
  const params = useSearchParams();
  const courseId = params.get("id") ?? "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "suspended">("draft");
  const [modules, setModules] = useState<ModuleEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseMsg, setCourseMsg] = useState("");
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [curriculumMsg, setCurriculumMsg] = useState("");

  useEffect(() => {
    if (!courseId) return;

    async function loadCourse() {
      setLoading(true);
      setLoadError("");
      try {
        const res = await fetch(`${COURSES_URL}?id=${courseId}`);
        const data = (await res.json()) as CourseResponse | string;
        if (!res.ok || typeof data === "string") {
          throw new Error(typeof data === "string" ? data : "Failed to load course");
        }

        setTitle(data.course.title ?? "");
        setDescription(data.course.description ?? "");
        setStatus(data.course.status ?? "draft");
        setModules(
          data.modules.map((mod) => ({
            _id: mod._id,
            title: mod.title,
            order: mod.order,
            dirty: false,
            expanded: false,
            lessons: data.lessons
              .filter((lesson) => normalizeId(lesson.moduleId) === mod._id)
              .map((lesson) => ({
                _id: lesson._id,
                title: lesson.title,
                description: lesson.description ?? "",
                isPreview: lesson.isPreview,
                duration: lesson.duration,
                videoKEY: lesson.videoKEY,
                videoURL: lesson.videoURL,
                fileKEY: lesson.fileKEY,
                fileURL: lesson.fileURL,
                order: lesson.order,
                dirty: false,
                videoFile: null,
                videoPreview: null,
                fileFile: null,
              })),
          })),
        );
      } catch (err: any) {
        setLoadError(err.message ?? "Could not load this course.");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  async function saveCourse() {
    if (!title.trim()) return;
    setCourseLoading(true);
    setCourseMsg("");
    try {
      const res = await fetch(`${COURSES_URL}?id=${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data === "string" ? data : "Failed to update course");
      }
      setCourseMsg("Course saved successfully.");
      setTimeout(() => setCourseMsg(""), 3000);
    } catch (err: any) {
      setCourseMsg(err.message ?? "Error saving course.");
    } finally {
      setCourseLoading(false);
    }
  }

  function updateModule(id: string, patch: Partial<ModuleEdit>) {
    setModules((prev) =>
      prev.map((mod) => (mod._id === id ? { ...mod, ...patch, dirty: true } : mod)),
    );
  }

  function toggleModule(id: string) {
    setModules((prev) =>
      prev.map((mod) =>
        mod._id === id ? { ...mod, expanded: !mod.expanded } : mod,
      ),
    );
  }

  async function saveModule(mod: ModuleEdit) {
    const res = await fetch(MODULES_URL, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        moduleId: mod._id,
        title: mod.title,
        order: mod.order,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(typeof data === "string" ? data : "Failed to update module");
    }
    setModules((prev) =>
      prev.map((item) => (item._id === mod._id ? { ...item, dirty: false } : item)),
    );
  }

  function updateLesson(
    moduleId: string,
    lessonId: string,
    patch: Partial<LessonEdit>,
  ) {
    setModules((prev) =>
      prev.map((mod) =>
        mod._id !== moduleId
          ? mod
          : {
              ...mod,
              lessons: mod.lessons.map((lesson) =>
                lesson._id === lessonId
                  ? { ...lesson, ...patch, dirty: true }
                  : lesson,
              ),
            },
      ),
    );
  }

  async function saveLesson(lesson: LessonEdit) {
    const res = lesson.videoFile || lesson.fileFile
      ? await saveLessonWithVideo(lesson)
      : await saveLessonFields(lesson);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(typeof data === "string" ? data : "Failed to update lesson");
    }

    setModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((item) =>
          item._id === lesson._id
            ? {
                ...item,
                ...data,
                dirty: false,
                videoFile: null,
                videoPreview: null,
                fileFile: null,
              }
            : item,
        ),
      })),
    );
  }

  function saveLessonFields(lesson: LessonEdit) {
    return fetch(LESSONS_URL, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        lessonId: lesson._id,
        title: lesson.title,
        description: lesson.description,
        isPreview: lesson.isPreview,
        duration: lesson.duration,
        order: lesson.order,
      }),
    });
  }

  function saveLessonWithVideo(lesson: LessonEdit) {
    const form = new FormData();
    form.append("courseId", courseId);
    form.append("lessonId", lesson._id);
    form.append("title", lesson.title);
    form.append("description", lesson.description);
    form.append("video", lesson.videoFile!);
    form.append("isPreview", String(lesson.isPreview));
    form.append("order", String(lesson.order));
    if (lesson.videoKEY) form.append("oldVideoKey", lesson.videoKEY);
    if (lesson.fileFile) form.append("file", lesson.fileFile);
    if (lesson.fileKEY) form.append("oldFile", lesson.fileKEY);
    if (lesson.duration !== undefined) {
      form.append("duration", String(lesson.duration));
    }
    return fetch(LESSONS_URL, { method: "PATCH", body: form });
  }

  async function saveAllCurriculum() {
    setCurriculumLoading(true);
    setCurriculumMsg("");
    try {
      for (const mod of modules) {
        if (mod.dirty) await saveModule(mod);
        for (const lesson of mod.lessons) {
          if (lesson.dirty) await saveLesson(lesson);
        }
      }
      setCurriculumMsg("Curriculum saved.");
      setTimeout(() => setCurriculumMsg(""), 3000);
    } catch (err: any) {
      setCurriculumMsg(err.message ?? "Some changes failed to save.");
    } finally {
      setCurriculumLoading(false);
    }
  }

  async function saveOneModule(mod: ModuleEdit) {
    setCurriculumMsg("");
    try {
      await saveModule(mod);
      setCurriculumMsg("Module saved.");
      setTimeout(() => setCurriculumMsg(""), 3000);
    } catch (err: any) {
      setCurriculumMsg(err.message ?? "Failed to save module.");
    }
  }

  async function saveOneLesson(lesson: LessonEdit) {
    setCurriculumMsg("");
    try {
      await saveLesson(lesson);
      setCurriculumMsg("Lesson saved.");
      setTimeout(() => setCurriculumMsg(""), 3000);
    } catch (err: any) {
      setCurriculumMsg(err.message ?? "Failed to save lesson.");
    }
  }

  if (!courseId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
        <p>Missing course ID.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="pt-8 pb-16 px-4 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-[13px] text-on-surface-variant">
          <button
            onClick={() => router.push("/instructor/courses")}
            className="hover:text-primary transition-colors"
          >
            My Courses
          </button>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            chevron_right
          </span>
          <span className="text-on-surface font-medium truncate">
            {title || "Edit Course"}
          </span>
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl py-16 text-center text-on-surface-variant">
            <span
              className="material-symbols-outlined animate-spin block mx-auto mb-3"
              style={{ fontSize: 34 }}
            >
              progress_activity
            </span>
            <p className="text-sm">Loading course...</p>
          </div>
        ) : loadError ? (
          <div className="glass-card rounded-2xl py-16 text-center text-error">
            <p className="text-sm">{loadError}</p>
          </div>
        ) : (
          <>
            <CourseInfoEditor
              title={title}
              description={description}
              status={status}
              loading={courseLoading}
              message={courseMsg}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onStatusChange={setStatus}
              onSave={saveCourse}
            />
            <CurriculumEditor
              modules={modules}
              loading={curriculumLoading}
              message={curriculumMsg}
              onModuleChange={updateModule}
              onModuleToggle={toggleModule}
              onModuleSave={saveOneModule}
              onLessonChange={updateLesson}
              onLessonSave={saveOneLesson}
              onSaveAll={saveAllCurriculum}
            />
          </>
        )}
      </main>
    </div>
  );
}
