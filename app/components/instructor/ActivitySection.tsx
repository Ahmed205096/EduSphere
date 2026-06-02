type RecentEnrollment = {
  _id: string;
  studentName: string;
  studentEmail: string;
  studentImage?: string;
  courseTitle: string;
  enrolledAt: string;
};

type ActivitySectionProps = {
  recentEnrollments: RecentEnrollment[];
  engagement: {
    averageProgress: number;
    quizPassRate: number;
    activeStudents: number;
  };
  totalEnrollments: number;
  completedLessons: number;
  loading?: boolean;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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

export default function ActivitySection({
  recentEnrollments,
  engagement,
  totalEnrollments,
  completedLessons,
  loading = false,
}: ActivitySectionProps) {
  const engagementItems = [
    { label: "Average Course Progress", value: engagement.averageProgress },
    { label: "Quiz Pass Rate", value: engagement.quizPassRate },
    { label: "Active Students", value: engagement.activeStudents },
  ];
  const summary = [
    { value: totalEnrollments.toLocaleString(), label: "Enrollments" },
    { value: completedLessons.toLocaleString(), label: "Lessons Done" },
    { value: recentEnrollments.length.toLocaleString(), label: "Recent" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Recent Enrollments */}
      <div className="glass-card rounded-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h4 className="text-base font-semibold text-on-surface">Recent Enrollments</h4>
          <span className="text-xs font-medium text-on-surface-variant">Latest 3</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[11px] text-on-surface-variant">
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Course</th>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-on-surface-variant" colSpan={4}>
                    Loading enrollments...
                  </td>
                </tr>
              ) : recentEnrollments.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-on-surface-variant" colSpan={4}>
                    No enrollments yet.
                  </td>
                </tr>
              ) : recentEnrollments.map((enrollment) => (
                <tr key={enrollment._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {enrollment.studentImage ? (
                        <img
                          src={enrollment.studentImage}
                          alt={enrollment.studentName}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                          {initials(enrollment.studentName) || "S"}
                        </div>
                      )}
                      <span className="text-[12px] text-on-surface font-medium">{enrollment.studentName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-on-surface-variant">{enrollment.courseTitle}</td>
                  <td className="px-5 py-3 text-[12px] text-on-surface-variant">{timeLabel(enrollment.enrolledAt)}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                      Enrolled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Engagement */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h4 className="text-base font-semibold text-on-surface">Student Engagement</h4>
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>
            more_vert
          </span>
        </div>
        <div className="space-y-5">
          {engagementItems.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-2">
                <span className="text-[13px] text-on-surface font-medium">{item.label}</span>
                <span className="text-[13px] text-primary font-medium">{item.value}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-5">
          {summary.map((s, i) => (
            <div
              key={s.label}
              className={`text-center ${i === 1 ? "border-x border-white/5" : ""}`}
            >
              <p className="text-xl font-semibold text-on-surface">{s.value}</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
