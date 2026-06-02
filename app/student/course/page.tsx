"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PlyrVideoPlayer from "@/app/components/media/PlyrVideoPlayer";

type Course = {
  _id: string;
  title: string;
  description: string;
  thumbnailURL?: string;
  category?: string;
  level?: string;
};

type Module = {
  _id: string;
  title: string;
  order: number;
};

type Lesson = {
  _id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description?: string;
  videoURL?: string;
  fileURL?: string;
  duration?: number;
  order: number;
  isPreview: boolean;
};

type CourseProgress = {
  courseId: Course | string;
  completedLessons: string[];
  progressPercentage: number;
  isCompleted: boolean;
};

const COURSES_URL = process.env.NEXT_PUBLIC_MANAGE_COURSES!;
const DASHBOARD_URL = process.env.NEXT_PUBLIC_STUDENT_DASHBOARD!;
const COMPLETE_LESSON_URL = process.env.NEXT_PUBLIC_COMPLETE_LESSON!;

function normalizeId(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: string })._id);
  }
  return String(value ?? "");
}

export default function StudentCoursePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background text-on-surface flex items-center justify-center">
          <p className="text-sm text-on-surface-variant">Loading course...</p>
        </main>
      }
    >
      <StudentCourseContent />
    </Suspense>
  );
}

function StudentCourseContent() {
  const router = useRouter();
  const params = useSearchParams();
  const courseId = params.get("courseId") ?? "";

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [activeLessonId, setActiveLessonId] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingLessonId, setSavingLessonId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!courseId) return;

    async function loadCourse() {
      setLoading(true);
      setMessage("");
      try {
        const [courseRes, dashboardRes] = await Promise.all([
          fetch(`${COURSES_URL}?id=${courseId}`),
          fetch(DASHBOARD_URL),
        ]);
        const [courseData, dashboardData] = await Promise.all([
          courseRes.json(),
          dashboardRes.json(),
        ]);

        if (!courseRes.ok || typeof courseData === "string") {
          throw new Error(
            typeof courseData === "string" ? courseData : "Failed to load course.",
          );
        }

        setCourse(courseData.course);
        setModules(courseData.modules ?? []);
        setLessons(courseData.lessons ?? []);
        setActiveLessonId(courseData.lessons?.[0]?._id ?? "");

        if (dashboardRes.ok && Array.isArray(dashboardData)) {
          const progress = (dashboardData as CourseProgress[]).find(
            (item) => normalizeId(item.courseId) === courseId,
          );

          if (progress) {
            setCompletedLessons(
              new Set(progress.completedLessons.map((lesson) => normalizeId(lesson))),
            );
            setProgressPercentage(progress.progressPercentage ?? 0);
          }
        }
      } catch (err: any) {
        setMessage(err.message ?? "Could not load course.");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  const groupedModules = useMemo(
    () =>
      modules.map((module) => ({
        ...module,
        lessons: lessons.filter((lesson) => normalizeId(lesson.moduleId) === module._id),
      })),
    [lessons, modules],
  );

  const activeLesson = lessons.find((lesson) => lesson._id === activeLessonId);

  async function toggleComplete(lessonId: string) {
    if (!courseId) return;

    setSavingLessonId(lessonId);
    setMessage("");
    try {
      const res = await fetch(COMPLETE_LESSON_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data === "string" ? data : "Could not update lesson.");
      }

      setCompletedLessons(new Set(data.completedLessons.map((id: string) => normalizeId(id))));
      setProgressPercentage(data.progressPercentage ?? 0);
      setMessage("Lesson progress updated.");
    } catch (err: any) {
      setMessage(err.message ?? "Could not update lesson.");
    } finally {
      setSavingLessonId("");
    }
  }

  if (!courseId) {
    return (
      <main className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <p className="text-sm text-on-surface-variant">Missing course id.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <header className="border-b border-white/10 bg-surface/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => router.push("/student")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              arrow_back
            </span>
            Student dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="rounded-xl border border-white/10 bg-surface-container-low py-16 text-center text-on-surface-variant">
            <span
              className="material-symbols-outlined mb-3 block animate-spin"
              style={{ fontSize: 34 }}
            >
              progress_activity
            </span>
            <p className="text-sm">Loading course...</p>
          </div>
        ) : message && !course ? (
          <div className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {message}
          </div>
        ) : (
          <>
            <div className="mb-6 overflow-hidden rounded-xl border border-white/10 bg-surface-container-low">
              {course?.thumbnailURL && (
                <img
                  src={course.thumbnailURL}
                  alt={course.title}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-6">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-primary">
                  {course?.category || "Course"}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  {course?.title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-on-surface-variant">
                  {course?.description}
                </p>
                <div className="mt-5">
                  <div className="mb-1 flex items-center justify-between text-[12px] text-on-surface-variant">
                    <span>Course progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div className="mb-4 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
                {message}
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <aside className="rounded-xl border border-white/10 bg-surface-container-low p-4">
                <h2 className="mb-3 text-base font-semibold">Lessons</h2>
                <div className="space-y-4">
                  {groupedModules.map((module) => (
                    <div key={module._id}>
                      <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                        {module.title}
                      </p>
                      <div className="space-y-2">
                        {module.lessons.map((lesson) => {
                          const isDone = completedLessons.has(lesson._id);
                          return (
                            <button
                              key={lesson._id}
                              onClick={() => setActiveLessonId(lesson._id)}
                              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                                activeLessonId === lesson._id
                                  ? "border-primary/40 bg-primary/10"
                                  : "border-white/10 bg-surface-container hover:border-white/20"
                              }`}
                            >
                              <span
                                className={`material-symbols-outlined ${
                                  isDone ? "text-primary" : "text-on-surface-variant"
                                }`}
                                style={{ fontSize: 18 }}
                              >
                                {isDone ? "check_circle" : "play_circle"}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium">
                                  {lesson.title}
                                </span>
                                <span className="text-[11px] text-on-surface-variant">
                                  {lesson.duration ? `${lesson.duration} min` : "Lesson"}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <section className="rounded-xl border border-white/10 bg-surface-container-low p-5">
                {activeLesson ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">{activeLesson.title}</h2>
                        {activeLesson.description && (
                          <p className="mt-1 text-sm text-on-surface-variant">
                            {activeLesson.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleComplete(activeLesson._id)}
                        disabled={savingLessonId === activeLesson._id}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                          completedLessons.has(activeLesson._id)
                            ? "bg-surface-container-high text-on-surface hover:bg-white/5"
                            : "bg-primary text-on-primary hover:brightness-110"
                        }`}
                      >
                        {savingLessonId === activeLesson._id
                          ? "Saving..."
                          : completedLessons.has(activeLesson._id)
                            ? "Mark incomplete"
                            : "Mark complete"}
                      </button>
                    </div>

                    {activeLesson.videoURL ? (
                      <PlyrVideoPlayer
                        src={activeLesson.videoURL}
                        title={activeLesson.title}
                      />
                    ) : (
                      <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-white/15 text-on-surface-variant">
                        <p className="text-sm">No video attached to this lesson.</p>
                      </div>
                    )}

                    {activeLesson.fileURL && (
                      <a
                        href={activeLesson.fileURL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-white/5 hover:text-primary"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          attach_file
                        </span>
                        Open attachment
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-white/15 text-on-surface-variant">
                    <p className="text-sm">Select a lesson to start.</p>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
