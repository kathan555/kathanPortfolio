import { Skeleton } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl flex flex-col gap-6">
          {/* Availability badge */}
          <Skeleton className="h-9 w-80 rounded-full" />

          {/* Name */}
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-72" />
            <Skeleton className="h-20 w-64" />
          </div>

          {/* Title */}
          <Skeleton className="h-7 w-96 max-w-full" />

          {/* Meta */}
          <div className="flex gap-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-2 max-w-2xl">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>

          {/* CTAs */}
          <div className="flex gap-4">
            <Skeleton className="h-12 w-36 rounded-xl" />
            <Skeleton className="h-12 w-40 rounded-xl" />
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>

          {/* Social icons */}
          <div className="flex gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-10 h-10 rounded-xl" />
          </div>

          {/* Stats grid */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 flex flex-col items-center gap-2">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
