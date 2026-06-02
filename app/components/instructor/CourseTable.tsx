"use client";
import { useRouter } from "next/navigation";

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
  description?: string;
};

type Props = {
  courses: Course[];
  onDelete: (id: string) => void;
};

function StatusBadge({ status }: { status: Course["status"] }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant border border-white/10 text-[11px] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />
      Draft
    </span>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function CourseTable({ courses, onDelete }: Props) {
  const router = useRouter();

  function goEdit(course: Course) {
    const q = new URLSearchParams({
      id: course._id,
      title: course.title,
      description: course.description ?? "",
    });
    router.push(`/instructor/courses/edit?${q}`);
  }

  if (courses.length === 0) {
    return (
      <div className="py-20 text-center text-on-surface-variant">
        <span className="material-symbols-outlined block mx-auto mb-3" style={{ fontSize: 48 }}>
          menu_book
        </span>
        <p className="text-sm">No courses yet. Create your first course!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-on-surface-variant border-b border-white/5 bg-white/2 text-[11px] font-semibold uppercase tracking-wider">
            <th className="px-6 py-4">Course Details</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Students</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {courses.map((course) => (
            <tr key={course._id} className="group hover:bg-white/3 transition-colors">
              {/* Details */}
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-20 rounded-lg overflow-hidden shrink-0 bg-surface-container-high relative">
                    {course.thumbnailURL ? (
                      <img
                        src={course.thumbnailURL}
                        alt={course.title}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>
                          image
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-background/60 to-transparent" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {course.title}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-1 capitalize">
                      {course.category} · {course.level}
                    </p>
                    <p className="text-[11px] text-on-surface-variant/60 mt-0.5 italic">
                      Updated {timeAgo(course.updatedAt)}
                    </p>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="px-6 py-5">
                <StatusBadge status={course.status} />
              </td>

              {/* Students */}
              <td className="px-6 py-5">
                {course.status === "published" ? (
                  <div>
                    <p className="text-[13px] font-medium text-on-surface">
                      {course.enrollmentCount.toLocaleString()}
                    </p>
                    <div className="w-24 h-1 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((course.enrollmentCount / 1500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-[13px] text-on-surface-variant">—</span>
                )}
              </td>

              {/* Actions */}
              <td className="px-6 py-5">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-200">
                  <button
                    title="Edit"
                    onClick={() => goEdit(course)}
                    className="p-2 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                  </button>
                  <button
                    title="Analytics"
                    className="p-2 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>monitoring</span>
                  </button>
                  <button
                    title="Delete"
                    onClick={() => onDelete(course._id)}
                    className="p-2 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-error hover:bg-error/10 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
