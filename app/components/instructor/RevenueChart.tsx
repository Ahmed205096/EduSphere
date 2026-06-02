const chartData = [
  { month: "Jan", pct: 40, amount: "$18.2k" },
  { month: "Feb", pct: 55, amount: "$24.5k" },
  { month: "Mar", pct: 48, amount: "$21.1k" },
  { month: "Apr", pct: 72, amount: "$32.8k" },
  { month: "May", pct: 85, amount: "$39.4k" },
  { month: "Jun", pct: 100, amount: "$45.2k" },
];

const topCourses = [
  { title: "Advanced UI/UX Systems", earned: "$12,400" },
  { title: "React Patterns 2024", earned: "$9,200" },
  { title: "Fullstack Mastery", earned: "$7,850" },
];

export default function RevenueChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
      {/* Chart */}
      <div className="lg:col-span-3 glass-card rounded-xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h4 className="text-base font-semibold text-on-surface">Revenue Growth</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Earnings performance over the last 6 months
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-1 text-xs text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Revenue
            </span>
            <span className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
              <span className="w-2 h-2 rounded-full bg-white/20 inline-block" />
              Projected
            </span>
          </div>
        </div>

        <div className="flex items-end gap-3 h-48">
          {chartData.map((bar) => (
            <div key={bar.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative group" style={{ height: `${bar.pct}%` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-primary/10 rounded-t-md hover:brightness-125 transition-all duration-300" />
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-surface px-2 py-1 rounded border border-primary/20 text-[10px] whitespace-nowrap z-10 text-on-surface pointer-events-none">
                  {bar.amount}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-3 text-[11px] text-on-surface-variant font-medium">
          {chartData.map((bar) => (
            <span key={bar.month} className="flex-1 text-center">
              {bar.month}
            </span>
          ))}
        </div>
      </div>

      {/* Top Performing */}
      <div className="glass-card rounded-xl p-6 flex flex-col">
        <h4 className="text-base font-semibold text-on-surface mb-5">Top Performing</h4>
        <div className="space-y-5 flex-1">
          {topCourses.map((course) => (
            <div key={course.title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
                >
                  menu_book
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-on-surface truncate">{course.title}</p>
                <p className="text-[12px] text-primary">{course.earned} earned</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-5 py-2 border border-white/10 rounded-lg text-[12px] text-on-surface-variant hover:bg-white/5 transition-all font-medium">
          View All Content
        </button>
      </div>
    </div>
  );
}
