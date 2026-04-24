import { Skeleton } from "@/components/Skeleton";

export default function ExperienceLoading() {
  return (
    <div className="pt-16 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14">
          <Skeleton className="h-4 w-28 mb-4" />
          <Skeleton className="h-12 w-56 mb-4" />
        </div>

        {/* Timeline items */}
        <div className="relative space-y-8">
          {/* Timeline line */}
          <div className="absolute left-6 top-4 bottom-4 w-px bg-muted hidden md:block" />

          {[1, 2, 3].map((_, i) => (
            <div key={i} className="relative flex gap-6 md:gap-8">
              {/* Dot */}
              <div className="hidden md:flex flex-col items-center shrink-0">
                <Skeleton className="w-12 h-12 rounded-xl" />
              </div>

              {/* Card */}
              <div className="glass-card rounded-2xl p-6 flex-1 flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-7 w-52" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                  <Skeleton className="h-8 w-36 rounded-xl" />
                </div>
                <div className="flex flex-col gap-2.5">
                  {Array.from({ length: i === 2 ? 7 : i === 1 ? 5 : 3 }).map((_, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <Skeleton className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" />
                      <Skeleton className={`h-4 ${j % 3 === 2 ? "w-3/4" : "w-full"}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
