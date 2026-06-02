import type { CourseData, ModuleDraft } from "./types";

type Props = {
  courseData: CourseData;
  modules: ModuleDraft[];
  loading: boolean;
  error: string;
  onBack: () => void;
  onPublish: () => void;
};

export default function Step3Review({
  courseData,
  modules,
  loading,
  error,
  onBack,
  onPublish,
}: Props) {
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="space-y-6">
      {/* Course summary */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex gap-4 p-5">
          {courseData.thumbnailPreview && (
            <img
              src={courseData.thumbnailPreview}
              alt="thumbnail"
              className="w-24 h-16 object-cover rounded-lg shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-on-surface truncate">
              {courseData.title}
            </h3>
            <p className="text-[13px] text-on-surface-variant mt-0.5 line-clamp-2">
              {courseData.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[courseData.category, courseData.level, courseData.status].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-surface-container-high text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 px-5 py-3 flex gap-6 text-[12px] text-on-surface-variant">
          <span>
            <strong className="text-on-surface">{modules.length}</strong> modules
          </span>
          <span>
            <strong className="text-on-surface">{totalLessons}</strong> lessons
          </span>
        </div>
      </div>

      {/* Curriculum summary */}
      <div className="space-y-2">
        {modules.map((mod) => (
          <div key={mod.id} className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">
                {mod.order}
              </span>
              <span className="text-sm font-semibold text-on-surface">{mod.title}</span>
              <span className="ml-auto text-[11px] text-on-surface-variant">
                {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
              </span>
            </div>
            {mod.lessons.length > 0 && (
              <ul className="space-y-1 pl-8">
                {mod.lessons.map((l) => (
                  <li key={l.id} className="flex items-center gap-2 text-[12px] text-on-surface-variant">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      play_circle
                    </span>
                    {l.title || <em>Untitled lesson</em>}
                    {l.isPreview && (
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
                        Preview
                      </span>
                    )}
                    {l.attachmentFile && (
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 14 }}>
                        attach_file
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="text-sm text-error bg-error/10 px-4 py-3 rounded-xl border border-error/20">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-5 py-2.5 border border-white/10 text-on-surface-variant rounded-lg text-sm font-medium hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-40"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Back
        </button>
        <button
          onClick={onPublish}
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <span
                className="material-symbols-outlined animate-spin"
                style={{ fontSize: 18 }}
              >
                progress_activity
              </span>
              Publishing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span>
              Publish Course
            </>
          )}
        </button>
      </div>
    </div>
  );
}
