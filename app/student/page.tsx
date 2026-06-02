"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomeSession } from "@/store";

type Course = {
  _id: string;
  title: string;
  description?: string;
  thumbnailURL?: string;
  category?: string;
  level?: string;
};

type Quiz = {
  _id: string;
  title: string;
  courseId: string;
  lessonId: string;
  passingScore: number;
  questions: Array<{ _id: string; points: number }>;
};

type Activity = {
  _id?: string;
  type: "lesson_completed" | "quiz_submitted" | "course_enrolled";
  createdAt: string;
};

type CourseProgress = {
  _id: string;
  courseId: Course | string;
  completedLessons: string[];
  progressPercentage: number;
  isCompleted: boolean;
  lastAccessedAt: string;
};

type CourseCard = Course & {
  progressPercentage?: number;
  completedLessonsCount?: number;
  isCompleted?: boolean;
  lastAccessedAt?: string;
};

const DASHBOARD_URL = process.env.NEXT_PUBLIC_STUDENT_DASHBOARD!;
const ENROLLMENTS_URL = process.env.NEXT_PUBLIC_STUDENT_ENROLLMENTS!;
const UPCOMING_QUIZZES_URL = process.env.NEXT_PUBLIC_STUDENT_UPCOMING_QUIZZES!;
const ACTIVITIES_URL = process.env.NEXT_PUBLIC_STUDENT_ACTIVITIES!;

function activityLabel(type: Activity["type"]) {
  if (type === "lesson_completed") return "Lesson completed";
  if (type === "quiz_submitted") return "Quiz submitted";
  return "Course enrolled";
}

function timeLabel(value?: string) {
  if (!value) return "Recently";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { session } = useCustomeSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const [dashboardRes, enrollmentsRes, quizzesRes, activitiesRes] = await Promise.all([
          fetch(DASHBOARD_URL),
          fetch(ENROLLMENTS_URL),
          fetch(UPCOMING_QUIZZES_URL),
          fetch(ACTIVITIES_URL),
        ]);

        const [dashboardData, enrollmentsData, quizzesData, activitiesData] = await Promise.all([
          dashboardRes.json(),
          enrollmentsRes.json(),
          quizzesRes.json(),
          activitiesRes.json(),
        ]);

        if (dashboardRes.ok && Array.isArray(dashboardData)) {
          setProgress(dashboardData);
        }
        if (enrollmentsRes.ok && Array.isArray(enrollmentsData)) {
          setCourses(enrollmentsData);
        }
        if (quizzesRes.ok && Array.isArray(quizzesData)) {
          setQuizzes(quizzesData);
        }
        if (activitiesRes.ok && Array.isArray(activitiesData)) {
          setActivities(activitiesData.slice(-8).reverse());
        }

        if (!dashboardRes.ok && !enrollmentsRes.ok && !quizzesRes.ok && !activitiesRes.ok) {
          throw new Error("Could not load student dashboard.");
        }
      } catch (err: any) {
        setError(err.message ?? "Could not load student dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const courseCards = useMemo<CourseCard[]>(() => {
    if (progress.length === 0) return courses;

    return progress.reduce<CourseCard[]>((cards, item) => {
      if (!item.courseId || typeof item.courseId === "string") return cards;

      cards.push({
          ...item.courseId,
          progressPercentage: item.progressPercentage,
          completedLessonsCount: item.completedLessons?.length ?? 0,
          isCompleted: item.isCompleted,
          lastAccessedAt: item.lastAccessedAt,
      });

      return cards;
    }, []);
  }, [courses, progress]);

  const completedLessonsCount = useMemo(
    () =>
      progress.reduce(
        (sum, item) => sum + (item.completedLessons?.length ?? 0),
        0,
      ),
    [progress],
  );

  const stats = useMemo(
    () => [
      {
        label: "Courses in progress",
        value: (progress.length || courses.length).toString(),
        icon: "menu_book",
      },
      {
        label: "Completed lessons",
        value: completedLessonsCount.toString(),
        icon: "task_alt",
      },
      { label: "Upcoming quizzes", value: quizzes.length.toString(), icon: "quiz" },
      { label: "Recent activities", value: activities.length.toString(), icon: "history" },
    ],
    [activities.length, completedLessonsCount, courses.length, progress.length, quizzes.length],
  );

  function openStudentCourse(courseId: string) {
    router.push(`/student/course?courseId=${courseId}`);
  }

  function openStudentCourseOnKey(e: React.KeyboardEvent, courseId: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openStudentCourse(courseId);
    }
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-xl border border-white/10 bg-surface-container-low p-6">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-primary">
            Student Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
            Track your enrolled courses, upcoming quizzes, and recent activity.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-surface-container-low p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
                  >
                    {stat.icon}
                  </span>
                </span>
                {loading && (
                  <span className="h-2 w-12 animate-pulse rounded bg-white/10" />
                )}
              </div>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-[12px] text-on-surface-variant">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-xl border border-white/10 bg-surface-container-low p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Enrolled courses</h2>
              <span className="text-[12px] text-on-surface-variant">
                {courseCards.length} course{courseCards.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <EmptyBlock text="Loading enrollments..." />
            ) : courseCards.length === 0 ? (
              <EmptyBlock text="No enrolled courses yet." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {courseCards.map((course) => (
                  <article
                    key={course._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openStudentCourse(course._id)}
                    onKeyDown={(e) => openStudentCourseOnKey(e, course._id)}
                    className="cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-surface-container transition-colors hover:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/50"
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
                    <div className="p-3">
                      <h3 className="line-clamp-1 text-sm font-semibold">
                        {course.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[12px] text-on-surface-variant">
                        {course.description || "Continue your course progress."}
                      </p>
                      {course.progressPercentage !== undefined && (
                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-[11px] text-on-surface-variant">
                            <span>{course.completedLessonsCount ?? 0} lessons completed</span>
                            <span>{Math.round(course.progressPercentage)}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(course.progressPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="mt-3 flex gap-2">
                        {course.level && (
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                            {course.level}
                          </span>
                        )}
                        {course.category && (
                          <span className="rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant">
                            {course.category}
                          </span>
                        )}
                      </div>
                      <span className="mt-3 block w-full rounded-lg bg-primary px-3 py-2 text-center text-[12px] font-semibold text-on-primary">
                        Continue course
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-white/10 bg-surface-container-low p-5">
            <h2 className="mb-4 text-base font-semibold">Upcoming quizzes</h2>
            {loading ? (
              <EmptyBlock text="Loading quizzes..." />
            ) : quizzes.length === 0 ? (
              <EmptyBlock text="No upcoming quizzes." />
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="rounded-lg border border-white/10 bg-surface-container p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="rounded-lg bg-primary/10 p-2 text-primary">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          quiz
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-1 text-sm font-semibold">
                          {quiz.title}
                        </h3>
                        <p className="mt-1 text-[12px] text-on-surface-variant">
                          {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""} · Pass {quiz.passingScore}%
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/quiz/student?quizId=${quiz._id}`)}
                        className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-on-primary hover:brightness-110"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="mt-4 rounded-xl border border-white/10 bg-surface-container-low p-5">
          <h2 className="mb-4 text-base font-semibold">Recent activity</h2>
          {loading ? (
            <EmptyBlock text="Loading activity..." />
          ) : activities.length === 0 ? (
            <EmptyBlock text="No recent activity yet." />
          ) : (
            <div className="space-y-2">
              {activities.map((activity, index) => (
                <div
                  key={activity._id ?? `${activity.type}-${index}`}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-surface-container px-3 py-2"
                >
                  <span className="rounded-lg bg-surface-container-high p-2 text-on-surface-variant">
                    <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
                      history
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{activityLabel(activity.type)}</p>
                    <p className="text-[12px] text-on-surface-variant">
                      {timeLabel(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-white/15 text-center">
      <p className="max-w-56 text-sm text-on-surface-variant">{text}</p>
    </div>
  );
}
