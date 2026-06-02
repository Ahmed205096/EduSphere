type DashboardStatsProps = {
  totalStudents: number;
  activeCourses: number;
  totalCourses: number;
  completedLessons: number;
  lessonsCount: number;
  loading?: boolean;
};

export default function DashboardStats({
  totalStudents,
  activeCourses,
  totalCourses,
  completedLessons,
  lessonsCount,
  loading = false,
}: DashboardStatsProps) {
  const lessonProgress =
    lessonsCount > 0 ? Math.round((completedLessons / lessonsCount) * 100) : 0;
  const stats = [
    {
      icon: "group",
      label: "Total Students",
      value: totalStudents.toLocaleString(),
      change: "Enrolled",
      progress: Math.min(totalStudents * 10, 100),
    },
    {
      icon: "menu_book",
      label: "Active Courses",
      value: activeCourses.toLocaleString(),
      change: `${totalCourses} total`,
      progress: totalCourses > 0 ? (activeCourses / totalCourses) * 100 : 0,
      neutral: true,
    },
    {
      icon: "task_alt",
      label: "Lessons Completed",
      value: completedLessons.toLocaleString(),
      change: `${lessonProgress}%`,
      progress: lessonProgress,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-card rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <span
                className="p-2 bg-primary/10 rounded-lg text-primary material-symbols-outlined"
                style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
              >
                {stat.icon}
              </span>
              <span
                className={`text-xs font-semibold ${
                  stat.neutral ? "text-on-surface-variant" : "text-primary"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              {stat.label}
            </p>
            <h3 className="text-2xl font-semibold text-on-surface mt-1">
              {loading ? "..." : stat.value}
            </h3>
          </div>
          <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${stat.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
