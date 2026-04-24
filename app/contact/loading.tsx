import { Skeleton } from "@/components/Skeleton";

export default function ContactLoading() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16">
          <Skeleton className="h-4 w-28 mb-4" />
          <Skeleton className="h-14 w-64 mb-4" />
          <Skeleton className="h-5 w-96 max-w-full mb-2" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>

        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* Left: contact info cards */}
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))}
            <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
              <Skeleton className="h-3 w-16" />
              <div className="flex gap-3">
                <Skeleton className="h-9 w-24 rounded-xl" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-8 sm:p-10">
              <Skeleton className="h-8 w-44 mb-2" />
              <Skeleton className="h-4 w-64 mb-8" />
              <div className="flex flex-col gap-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-40 w-full rounded-xl" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
