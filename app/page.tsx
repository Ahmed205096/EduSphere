"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomeSession } from "@/store";

type Course = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailURL: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  enrollmentCount: number;
};

const COURSES_URL = process.env.NEXT_PUBLIC_GET_ALL_COURSES!;

export default function Home() {
  const router = useRouter();
  const { session, status } = useCustomeSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(COURSES_URL);
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          throw new Error(
            typeof data === "string" ? data : "Failed to load courses.",
          );
        }
        setCourses(data);
      } catch (err: any) {
        setError(err.message ?? "Network error.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  const isAuthed = status === "authenticated" && !!session;

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const matchesLevel = level === "all" || course.level === level;

      return matchesLevel;
    });
  }, [courses, level]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const searchParams = new URLSearchParams();
    if (query.trim()) {
      searchParams.set("searchQuery", query.trim());
    }
    if (level !== "all") {
      searchParams.set("level", level);
    }

    router.push(`/search?${searchParams}`);
  }

  function dashboardPath() {
    return session?.user.role === "admin" || session?.user.role === "instructor"
      ? "/instructor"
      : "/student";
  }

  function openCourse(courseId: string) {
    router.push(`/courses/${courseId}`);
  }

  function openCourseOnKey(e: React.KeyboardEvent, courseId: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openCourse(courseId);
    }
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <section className="relative min-h-[560px] overflow-hidden">
        <img
          src="/learning.avif"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/78" />
        <div className="relative mx-auto flex min-h-[500px] max-w-7xl items-end px-4 pb-12 pt-20 sm:px-6 lg:pb-16">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-primary">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 15 }}
              >
                auto_stories
              </span>
              Learn with real courses
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-on-surface sm:text-6xl">
              Build skills from the courses already live on EduSphere.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-on-surface-variant">
              Explore published courses, filter by level, and jump into a
              structured path built by instructors.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#courses"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-all hover:brightness-110 active:scale-95"
              >
                Browse courses
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                >
                  arrow_downward
                </span>
              </a>
              {isAuthed ? (
                <button
                  onClick={() => router.push(dashboardPath())}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-surface/60 px-5 py-3 text-sm font-semibold text-on-surface hover:bg-white/5"
                >
                  Continue dashboard
                </button>
              ) : (
                <button
                  onClick={() => router.push("/register")}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-surface/60 px-5 py-3 text-sm font-semibold text-on-surface hover:bg-white/5"
                >
                  Join now
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-surface-container-low/60">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:grid-cols-3 sm:px-6">
          <div>
            <p className="text-2xl font-semibold text-on-surface">
              {courses.length}
            </p>
            <p className="text-[12px] text-on-surface-variant">
              Published courses
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-on-surface">
              {courses
                .reduce((sum, course) => sum + course.enrollmentCount, 0)
                .toLocaleString()}
            </p>
            <p className="text-[12px] text-on-surface-variant">
              Total enrollments
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-on-surface">
              {new Set(courses.map((course) => course.category)).size}
            </p>
            <p className="text-[12px] text-on-surface-variant">
              Learning categories
            </p>
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-primary">
              Course catalog
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Everything available on the platform
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Search by title, category, or description.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid gap-2 sm:grid-cols-[minmax(220px,360px)_170px_92px]"
          >
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                style={{ fontSize: 17 }}
              >
                search
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, categories..."
                className="w-full rounded-lg border border-white/10 bg-surface-container-low py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="rounded-lg border border-white/10 bg-surface-container-low px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="all">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:brightness-110"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="rounded-lg border border-white/10 bg-surface-container-low py-16 text-center text-on-surface-variant">
            <span
              className="material-symbols-outlined mb-3 block animate-spin"
              style={{ fontSize: 34 }}
            >
              progress_activity
            </span>
            <p className="text-sm">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-error/20 bg-error/10 py-16 text-center text-error">
            <p className="text-sm">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-surface-container-low py-16 text-center text-on-surface-variant">
            <p className="text-sm">No published courses match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <article
                key={course._id}
                role="button"
                tabIndex={0}
                onClick={() => openCourse(course._id)}
                onKeyDown={(e) => openCourseOnKey(e, course._id)}
                className="cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-surface-container-low transition-colors hover:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <div className="aspect-video bg-surface-container-high">
                  {course.thumbnailURL ? (
                    <img
                      src={course.thumbnailURL}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined">
                        menu_book
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase text-primary">
                      {course.level}
                    </span>
                    <span className="rounded bg-surface-container-high px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                      {course.category}
                    </span>
                  </div>
                  <div>
                    <h3 className="line-clamp-1 text-base font-semibold">
                      {course.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[13px] text-on-surface-variant">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-on-surface-variant">
                    <span>
                      {course.enrollmentCount.toLocaleString()} students
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      Details
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 15 }}
                      >
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
