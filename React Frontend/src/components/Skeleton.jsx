function Skeleton({ className = "", count = 1 }) {
  const items = Array.from({ length: count });
  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`}
        />
      ))}
    </>
  );
}

function SkeletonCard({ rows = 3 }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow border border-slate-100 dark:border-slate-700 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      {rows > 1 && <Skeleton className="h-3 w-2/3" />}
      {rows > 2 && <Skeleton className="h-3 w-1/2" />}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow border border-slate-100 dark:border-slate-700">
      <Skeleton className="h-4 w-1/4 mb-4" />
      <div className="flex items-end gap-2 h-32">
        {[40, 60, 30, 80, 50, 70, 45, 90, 55, 65, 35, 75].map((h, i) => (
          <div key={i} className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-t-lg animate-pulse" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonChart };
