import { Skeleton } from "@/components/Skeleton";

export default function EstimatorLoading() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-14 w-full mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-4/5 mb-6" />
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-36" />
            ))}
          </div>
        </div>

        {/* Estimator card */}
        <div className="glass-card rounded-2xl p-8 sm:p-10">
          {/* Card header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-1 flex-1 rounded-full" />
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-80 ml-11 mb-6" />

          {/* Option grid */}
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-border p-4 flex flex-col gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        <Skeleton className="h-4 w-72 mx-auto mt-6" />
      </div>
    </div>
  );
}
