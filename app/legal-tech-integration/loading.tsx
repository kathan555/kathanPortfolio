import { Skeleton } from "@/components/Skeleton";

export default function LegalTechIntegrationLoading() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="mb-16 max-w-3xl">
          <Skeleton className="h-7 w-48 rounded-full mb-5" />
          <Skeleton className="h-14 w-full mb-3" />
          <Skeleton className="h-14 w-3/5 mb-5" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-4/5 mb-8" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-12 w-48 rounded-xl" />
            <Skeleton className="h-12 w-44 rounded-xl" />
          </div>
        </div>

        {/* Problem grid */}
        <div className="mb-16">
          <Skeleton className="h-4 w-28 mb-3" />
          <Skeleton className="h-10 w-80 max-w-full mb-3" />
          <Skeleton className="h-5 w-full max-w-2xl mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 flex items-start gap-4">
                <Skeleton className="w-5 h-5 rounded shrink-0 mt-0.5" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-5 w-56 max-w-full" />
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
          <Skeleton className="h-10 w-96 max-w-full mb-3" />
          <Skeleton className="h-5 w-full max-w-2xl mb-8" />
          <Skeleton className="h-56 sm:h-44 w-full rounded-2xl mb-8" />
          <div className="grid sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 flex flex-col gap-3">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Code blocks */}
        <div className="mb-16">
          <Skeleton className="h-4 w-28 mb-3" />
          <Skeleton className="h-10 w-full max-w-xl mb-3" />
          <Skeleton className="h-5 w-full max-w-2xl mb-8" />
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-border/60 flex gap-3">
                  <Skeleton className="w-5 h-5 rounded shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-5 w-72 max-w-full" />
                    <Skeleton className="h-3.5 w-full max-w-lg" />
                  </div>
                </div>
                <Skeleton className="w-full rounded-none h-56 sm:h-72" />
              </div>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div className="mb-16">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 flex items-start gap-4">
                <Skeleton className="h-6 w-24 rounded-md shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagements */}
        <div className="mb-16">
          <Skeleton className="h-4 w-36 mb-3" />
          <Skeleton className="h-10 w-96 max-w-full mb-3" />
          <Skeleton className="h-5 w-full max-w-2xl mb-8" />
          <div className="grid md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 flex flex-col gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-32 mt-2" />
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <Skeleton className="h-4 w-16 mb-3" />
          <Skeleton className="h-10 w-80 max-w-full mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl px-6 py-5">
                <Skeleton className="h-5 w-full max-w-md" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass-card rounded-2xl p-10 sm:p-14 flex flex-col items-center gap-5">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-10 w-80 max-w-full" />
          <Skeleton className="h-5 w-full max-w-lg" />
          <Skeleton className="h-5 w-4/5 max-w-lg" />
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            <Skeleton className="h-14 w-56 rounded-xl" />
            <Skeleton className="h-14 w-56 rounded-xl" />
          </div>
        </div>

      </div>
    </div>
  );
}
