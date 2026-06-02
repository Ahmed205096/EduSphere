"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomeSession } from "@/store";
import DashboardStats from "../components/instructor/DashboardStats";
import ActivitySection from "../components/instructor/ActivitySection";

type DashboardData = {
  stats: {
    totalStudents: number;
    activeCourses: number;
    totalCourses: number;
    totalEnrollments: number;
    completedLessons: number;
    lessonsCount: number;
  };
  recentEnrollments: Array<{
    _id: string;
    studentName: string;
    studentEmail: string;
    studentImage?: string;
    courseTitle: string;
    enrolledAt: string;
  }>;
  engagement: {
    averageProgress: number;
    quizPassRate: number;
    activeStudents: number;
  };
};

const emptyDashboard: DashboardData = {
  stats: {
    totalStudents: 0,
    activeCourses: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    completedLessons: 0,
    lessonsCount: 0,
  },
  recentEnrollments: [],
  engagement: {
    averageProgress: 0,
    quizPassRate: 0,
    activeStudents: 0,
  },
};

export default function InstructorDashboard() {
  const router = useRouter();
  const { session } = useCustomeSession();
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/instructor/dashboard", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || typeof data === "string") {
          throw new Error(
            typeof data === "string" ? data : "Failed to load dashboard.",
          );
        }

        setDashboard(data);
      } catch (err: any) {
        setError(err.message ?? "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30">
      <main className="pt-8 pb-12 px-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-on-surface tracking-tight">
              Instructor Dashboard
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}. Here&apos;s
              what&apos;s happening today.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-surface-container-high text-on-surface text-sm font-medium rounded-lg flex items-center gap-2 border border-white/5 hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                calendar_today
              </span>
              Last 30 Days
            </button>
            <button
              onClick={() => router.push("/instructor/create")}
              className="px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                add
              </span>
              Create Course
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <DashboardStats
          totalStudents={dashboard.stats.totalStudents}
          activeCourses={dashboard.stats.activeCourses}
          totalCourses={dashboard.stats.totalCourses}
          completedLessons={dashboard.stats.completedLessons}
          lessonsCount={dashboard.stats.lessonsCount}
          loading={loading}
        />
        <ActivitySection
          recentEnrollments={dashboard.recentEnrollments}
          engagement={dashboard.engagement}
          totalEnrollments={dashboard.stats.totalEnrollments}
          completedLessons={dashboard.stats.completedLessons}
          loading={loading}
        />
      </main>
    </div>
  );
}
