const steps = [
  { n: 1, label: "Course Info" },
  { n: 2, label: "Curriculum" },
  { n: 3, label: "Review" },
];

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition-all ${
                s.n < current
                  ? "bg-primary border-primary text-on-primary"
                  : s.n === current
                  ? "border-primary text-primary bg-primary/10"
                  : "border-white/20 text-on-surface-variant"
              }`}
            >
              {s.n < current ? (
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  check
                </span>
              ) : (
                s.n
              )}
            </div>
            <span
              className={`text-[11px] font-semibold whitespace-nowrap ${
                s.n === current ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-px mx-3 mb-5 transition-all ${
                s.n < current ? "bg-primary" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
