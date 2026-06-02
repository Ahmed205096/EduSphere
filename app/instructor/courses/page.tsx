"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCustomeSession } from "@/store";
import CourseTable from "@/app/components/instructor/CourseTable";

type Course = {
  _id: string;
  title: string;
  slug: string;
  thumbnailURL: string;
  status: "draft" | "published";
  enrollmentCount: number;
  level: string;
  category: string;
  updatedAt: string;
};

const PAGE_SIZE = 8;
const COURSES_URL = process.env.NEXT_PUBLIC_INSTRUCTOR_COURSES!;
const DELETE_URL = process.env.NEXT_PUBLIC_MANAGE_COURSES!;

export default function CoursesPage() {
  const router = useRouter();
  const { session } = useCustomeSession();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    fetch(COURSES_URL)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
        else setError(typeof data === "string" ? data : "Failed to load courses.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this course? This action cannot be undone.")) return;
    const res = await fetch(`${DELETE_URL}?id=${id}`, { method: "DELETE" });
    if (res.ok) setCourses((prev) => prev.filter((c) => c._id !== id));
  }

  const filtered = useMemo(
    () => (filter === "all" ? courses : courses.filter((c) => c.status === filter)),
    [courses, filter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const published = courses.filter((c) => c.status === "published");
  const totalStudents = published.reduce((sum, c) => sum + c.enrollmentCount, 0);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="pt-8 pb-12 px-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-on-surface tracking-tight">
              Course Management
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Manage your curriculum, monitor student engagement, and publish new content.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push("/instructor/quizzes")}
              className="inline-flex items-center gap-2 bg-surface-container-high text-on-surface px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>quiz</span>
              Manage Quizzes
            </button>
            <button
              onClick={() => router.push("/instructor/create")}
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 active:scale-95 transition-all"
              style={{ boxShadow: "0 0 20px rgba(16,185,129,0.2)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Create New Course
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  menu_book
                </span>
              </div>
              <span className="text-[13px] text-on-surface-variant font-medium">Total Courses</span>
            </div>
            <div className="text-3xl font-semibold text-on-surface">{courses.length}</div>
            <div className="mt-2 text-primary text-[12px] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
              {published.length} published · {courses.length - published.length} draft
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span
                  className="material-symbols-outlined text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  group
                </span>
              </div>
              <span className="text-[13px] text-on-surface-variant font-medium">Active Students</span>
            </div>
            <div className="text-3xl font-semibold text-on-surface">
              {totalStudents.toLocaleString()}
            </div>
            <div className="mt-2 text-primary text-[12px] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
              Across {published.length} course{published.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-base font-semibold text-on-surface">All Courses</h3>
              <button
                onClick={() => setFilter("published")}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                  filter === "published"
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                }`}
              >
                Published: {published.length}
              </button>
              <button
                onClick={() => setFilter("draft")}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                  filter === "draft"
                    ? "bg-surface-container-highest text-on-surface border-white/20"
                    : "bg-surface-container-highest text-on-surface-variant border-white/5 hover:border-white/20"
                }`}
              >
                Draft: {courses.length - published.length}
              </button>
              {filter !== "all" && (
                <button
                  onClick={() => { setFilter("all"); setPage(1); }}
                  className="text-[11px] text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Clear filter ×
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list</span>
              </button>
              <button className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>sort</span>
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-20 text-center text-on-surface-variant">
              <span
                className="material-symbols-outlined animate-spin block mx-auto mb-3"
                style={{ fontSize: 36 }}
              >
                progress_activity
              </span>
              <p className="text-sm">Loading courses...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-error">
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <CourseTable courses={paginated} onDelete={handleDelete} />
          )}

          {/* Pagination */}
          {!loading && !error && filtered.length > 0 && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
              <p className="text-[11px] text-on-surface-variant">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length} course{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-white/10 text-on-surface-variant hover:bg-white/5 disabled:opacity-30 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-[12px] font-semibold border transition-all ${
                      n === page
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "border-white/10 text-on-surface-variant hover:bg-white/5"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-white/10 text-on-surface-variant hover:bg-white/5 disabled:opacity-30 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
