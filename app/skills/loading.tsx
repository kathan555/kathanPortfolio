import { Skeleton } from "@/components/Skeleton";

export default function SkillsLoading() {
  return (
    <div className="pt-16 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14">
          <Skeleton className="h-4 w-20 mb-4" />
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>

        {/* Category cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 flex flex-col gap-5">
              {/* Category header */}
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <Skeleton className="h-5 w-36" />
              </div>
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: i === 4 ? 10 : 4 }).map((_, j) => (
                  <Skeleton
                    key={j}
                    className={`h-7 rounded-lg ${
                      j % 3 === 0 ? "w-16" : j % 3 === 1 ? "w-24" : "w-20"
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
