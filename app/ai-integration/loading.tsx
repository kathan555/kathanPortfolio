import { Skeleton } from "@/components/Skeleton";

export default function AIIntegrationLoading() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="mb-16 max-w-3xl">
          <Skeleton className="h-7 w-52 rounded-full mb-5" />
          <Skeleton className="h-14 w-full mb-3" />
          <Skeleton className="h-14 w-4/5 mb-5" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* Live demo section */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-border/60" />
            <Skeleton className="h-5 w-24" />
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <Skeleton className="h-4 w-96 max-w-full mx-auto mb-6" />
          {/* Demo widget skeleton */}
          <div className="max-w-2xl mx-auto glass-card rounded-2xl overflow-hidden border-blue-500/20">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60 bg-blue-500/5">
              <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            {/* Message area */}
            <div className="p-4 min-h-[280px] flex flex-col items-center justify-center gap-5">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="text-center flex flex-col items-center gap-2">
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-3 w-72 max-w-full" />
              </div>
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-xl" />
                ))}
              </div>
            </div>
            {/* Input */}
            <div className="border-t border-border/60 p-3 flex gap-2">
              <Skeleton className="flex-1 h-10 rounded-xl" />
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            </div>
          </div>
        </div>

        {/* Why section */}
        <div className="mb-16">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-10 w-96 max-w-full mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 flex items-start gap-4">
                <Skeleton className="w-5 h-5 rounded shrink-0 mt-0.5" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-5 w-52" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <div className="mb-16">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-10 w-72 mb-8" />
          <Skeleton className="h-48 sm:h-40 w-full rounded-2xl" />
        </div>

        {/* Code blocks */}
        <div className="mb-16">
          <Skeleton className="h-4 w-28 mb-3" />
          <Skeleton className="h-10 w-56 mb-8" />
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-border/60 flex gap-3">
                  <Skeleton className="w-5 h-5 rounded shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-3.5 w-80 max-w-full" />
                  </div>
                </div>
                <Skeleton className={`w-full rounded-none ${i === 0 ? "h-28 sm:h-36" : i === 1 ? "h-40 sm:h-52" : i === 2 ? "h-48 sm:h-64" : "h-36 sm:h-44"}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Use cases */}
        <div className="mb-16">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-10 w-60 mb-8" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 flex flex-col gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA card */}
        <div className="glass-card rounded-2xl p-10 sm:p-14 flex flex-col items-center gap-5">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-full max-w-lg" />
          <Skeleton className="h-5 w-4/5 max-w-lg" />
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            <Skeleton className="h-14 w-52 rounded-xl" />
            <Skeleton className="h-14 w-52 rounded-xl" />
          </div>
        </div>

      </div>
    </div>
  );
}
