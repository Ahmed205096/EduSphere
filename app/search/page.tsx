"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Course = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailURL?: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
  enrollmentCount?: number;
};

const SEARCH_COURSE_URL =
  process.env.NEXT_PUBLIC_SEARCH_COURSE as string;

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background text-on-surface">
          <p className="text-sm text-on-surface-variant">Loading search...</p>
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQuery = params.get("searchQuery") ?? "";
  const initialLevel = params.get("level") ?? "all";

  const [query, setQuery] = useState(initialQuery);
  const [level, setLevel] = useState(initialLevel);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const title = useMemo(() => {
    if (initialQuery.trim()) return `Search results for "${initialQuery}"`;
    return "Search courses";
  }, [initialQuery]);

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      setError("");
      try {
        const searchParams = new URLSearchParams();
        if (initialQuery.trim()) {
          searchParams.set("searchQuery", initialQuery.trim());
        }
        if (initialLevel !== "all") {
          searchParams.set("level", initialLevel);
        }

        const res = await fetch(`${SEARCH_COURSE_URL}?${searchParams}`);
        const data = await res.json();

        if (!res.ok || !Array.isArray(data)) {
          throw new Error(
            typeof data === "string" ? data : "Could not search courses.",
          );
        }

        setCourses(data);
      } catch (err: any) {
        setError(err.message ?? "Could not search courses.");
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [initialLevel, initialQuery]);

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
    <main className="min-h-screen bg-background px-4 py-10 text-on-surface">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              onClick={() => router.push("/")}
              className="mb-4 inline-flex items-center gap-1 text-[13px] text-on-surface-variant transition-colors hover:text-primary"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                arrow_back
              </span>
              Home
            </button>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-primary">
              Course search
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Results are pulled from the course search API.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid gap-2 sm:grid-cols-[minmax(220px,320px)_150px_92px]"
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
                placeholder="Search courses..."
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
        </header>

        {loading ? (
          <div className="rounded-lg border border-white/10 bg-surface-container-low py-16 text-center text-on-surface-variant">
            <span
              className="material-symbols-outlined mb-3 block animate-spin"
              style={{ fontSize: 34 }}
            >
              progress_activity
            </span>
            <p className="text-sm">Searching courses...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-error/20 bg-error/10 py-16 text-center text-error">
            <p className="text-sm">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-surface-container-low py-16 text-center text-on-surface-variant">
            <p className="text-sm">No courses match your search.</p>
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
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
                      <span className="material-symbols-outlined">menu_book</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap gap-2">
                    {course.level && (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase text-primary">
                        {course.level}
                      </span>
                    )}
                    {course.category && (
                      <span className="rounded bg-surface-container-high px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                        {course.category}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="line-clamp-1 text-base font-semibold">
                      {course.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[13px] text-on-surface-variant">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-on-surface-variant">
                    <span>{(course.enrollmentCount ?? 0).toLocaleString()} students</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      Details
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
