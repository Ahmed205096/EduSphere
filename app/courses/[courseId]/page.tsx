"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCustomeSession } from "@/store";
import PlyrVideoPlayer from "@/app/components/media/PlyrVideoPlayer";

type Course = {
  _id: string;
  title: string;
  description: string;
  thumbnailURL?: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
  enrollmentCount?: number;
};

type Module = {
  _id: string;
  title: string;
  order: number;
};

type Lesson = {
  _id: string;
  moduleId: string;
  title: string;
  description?: string;
  videoURL?: string;
  fileURL?: string;
  duration?: number;
  order: number;
  isPreview: boolean;
};

type CourseDetailsResponse = {
  course: Course;
  modules: Module[];
  lessons: Lesson[];
  access: "preview" | "full";
};

const COURSE_URL = process.env.NEXT_PUBLIC_MANAGE_COURSES!;
const ENROLL_COURSE_URL = process.env.NEXT_PUBLIC_STUDENT_ENROLL_COURSE!;

function normalizeId(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: string })._id);
  }
  return String(value ?? "");
}

export default function CourseDetailsPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const { session, status } = useCustomeSession();
  const courseId = params.courseId;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [access, setAccess] = useState<"preview" | "full">("preview");
  const [activeLessonId, setActiveLessonId] = useState("");
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!courseId) return;

    async function loadCourse() {
      setLoading(true);
      setMessage("");
      try {
        const res = await fetch(`${COURSE_URL}?id=${courseId}`);
        const data = await res.json();
        if (!res.ok || typeof data === "string") {
          throw new Error(
            typeof data === "string" ? data : "Failed to load course details.",
          );
        }

        const courseData = data as CourseDetailsResponse;
        setCourse(courseData.course);
        setModules(courseData.modules ?? []);
        setLessons(courseData.lessons ?? []);
        setAccess(courseData.access ?? "preview");
        setActiveLessonId(courseData.lessons?.[0]?._id ?? "");
      } catch (err: any) {
        setMessage(err.message ?? "Could not load course details.");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  const isAuthed = status === "authenticated" && !!session;
  const isStudent = session?.user.role === "student";
  const canEnroll = !isAuthed || isStudent;

  const groupedModules = useMemo(
    () =>
      modules.map((module) => ({
        ...module,
        lessons: lessons.filter((lesson) => normalizeId(lesson.moduleId) === module._id),
      })),
    [lessons, modules],
  );

  const activeLesson = lessons.find((lesson) => lesson._id === activeLessonId);
  const previewCount = lessons.filter((lesson) => lesson.isPreview).length;

  async function enrollCourse() {
    if (!isAuthed) {
      router.push(`/login?next=/courses/${courseId}`);
      return;
    }

    if (!isStudent) {
      setMessage("Only student accounts can enroll in courses.");
      return;
    }

    setEnrolling(true);
    setMessage("");
    try {
      const res = await fetch(ENROLL_COURSE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data === "string" ? data : "Could not enroll in this course.",
        );
      }
      setAccess("full");
      setMessage("You are enrolled successfully. Opening the course...");
      router.push(`/student/course?courseId=${courseId}`);
    } catch (err: any) {
      setMessage(err.message ?? "Could not enroll in this course.");
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <header className="border-b border-white/10 bg-surface/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => router.push("/courses")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              arrow_back
            </span>
            Courses
          </button>
          <button
            onClick={() => router.push("/")}
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
          >
            Home
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="rounded-lg border border-white/10 bg-surface-container-low py-16 text-center text-on-surface-variant">
            <span
              className="material-symbols-outlined mb-3 block animate-spin"
              style={{ fontSize: 34 }}
            >
              progress_activity
            </span>
            <p className="text-sm">Loading course details...</p>
          </div>
        ) : message && !course ? (
          <div className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {message}
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <section className="overflow-hidden rounded-lg border border-white/10 bg-surface-container-low">
                <div className="relative min-h-[260px]">
                  {course?.thumbnailURL ? (
                    <img
                      src={course.thumbnailURL}
                      alt={course.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-container-high" />
                  )}
                  <div className="absolute inset-0 bg-background/72" />
                  <div className="relative flex min-h-[260px] flex-col justify-end p-5 sm:p-8">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {course?.level && (
                        <span className="rounded bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase text-primary">
                          {course.level}
                        </span>
                      )}
                      {course?.category && (
                        <span className="rounded bg-surface-container-high px-2 py-1 text-[11px] font-semibold text-on-surface-variant">
                          {course.category}
                        </span>
                      )}
                      <span className="rounded bg-surface-container-high px-2 py-1 text-[11px] font-semibold text-on-surface-variant">
                        {access === "full" ? "Full access" : `${previewCount} previews`}
                      </span>
                    </div>
                    <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                      {course?.title}
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant sm:text-base">
                      {course?.description}
                    </p>
                  </div>
                </div>
              </section>

              <aside className="rounded-lg border border-white/10 bg-surface-container-low p-5">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-primary">
                  Enrollment
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Preview the free lessons first, then enroll to open the full course
                  inside your student dashboard.
                </p>
                <div className="mt-4 space-y-3 text-sm text-on-surface-variant">
                  <div className="flex items-center justify-between">
                    <span>Students</span>
                    <span className="font-semibold text-on-surface">
                      {(course?.enrollmentCount ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Preview lessons</span>
                    <span className="font-semibold text-on-surface">{previewCount}</span>
                  </div>
                </div>
                {access === "full" ? (
                  <button
                    onClick={() => router.push(`/student/course?courseId=${courseId}`)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-on-primary hover:brightness-110"
                  >
                    Continue course
                  </button>
                ) : (
                  <button
                    onClick={enrollCourse}
                    disabled={enrolling || !canEnroll}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-on-primary hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {enrolling
                      ? "Enrolling..."
                      : isAuthed
                        ? "Enroll in course"
                        : "Login to enroll"}
                  </button>
                )}
                {message && (
                  <p
                    className={`mt-3 text-sm ${
                      message.toLowerCase().includes("could") ||
                      message.toLowerCase().includes("only")
                        ? "text-error"
                        : "text-primary"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </aside>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
              <aside className="rounded-lg border border-white/10 bg-surface-container-low p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold">Course preview</h2>
                  <span className="text-[12px] text-on-surface-variant">
                    {lessons.length} available
                  </span>
                </div>
                {lessons.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/15 px-4 py-8 text-center text-sm text-on-surface-variant">
                    No preview lessons are available yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedModules
                      .filter((module) => module.lessons.length > 0)
                      .map((module) => (
                        <div key={module._id}>
                          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                            {module.title}
                          </p>
                          <div className="space-y-2">
                            {module.lessons.map((lesson) => (
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
                                  className="material-symbols-outlined text-primary"
                                  style={{ fontSize: 18 }}
                                >
                                  play_circle
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-medium">
                                    {lesson.title}
                                  </span>
                                  <span className="text-[11px] text-on-surface-variant">
                                    {lesson.duration ? `${lesson.duration} min` : "Preview"}
                                  </span>
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </aside>

              <section className="rounded-lg border border-white/10 bg-surface-container-low p-5">
                {activeLesson ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-wider text-primary">
                        Preview lesson
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold">{activeLesson.title}</h2>
                      {activeLesson.description && (
                        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                          {activeLesson.description}
                        </p>
                      )}
                    </div>

                    {activeLesson.videoURL ? (
                      <PlyrVideoPlayer
                        src={activeLesson.videoURL}
                        title={activeLesson.title}
                        poster={course?.thumbnailURL}
                      />
                    ) : (
                      <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-white/15 text-on-surface-variant">
                        <p className="text-sm">No video attached to this preview.</p>
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
                  <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-white/15 text-on-surface-variant">
                    <p className="text-sm">Select a preview lesson.</p>
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
