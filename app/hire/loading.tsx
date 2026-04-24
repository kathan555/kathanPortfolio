import { Skeleton, SkeletonServiceCard } from "@/components/Skeleton";

export default function HireLoading() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero skeleton */}
        <div className="mb-16 max-w-3xl">
          <Skeleton className="h-8 w-52 rounded-full mb-6" />
          <Skeleton className="h-16 w-full mb-3" />
          <Skeleton className="h-16 w-3/4 mb-5" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-5/6 mb-8" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-48 rounded-xl" />
            <Skeleton className="h-12 w-52 rounded-xl" />
          </div>
        </div>

        {/* Pricing tiers skeleton */}
        <div className="mb-20">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-9 w-56 mb-6" />
          <div className="grid sm:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Services grid skeleton */}
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-9 w-40 mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonServiceCard key={i} />
          ))}
        </div>

        {/* Why Me skeleton */}
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-9 w-36 mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>

        {/* Process skeleton */}
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-9 w-64 mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 flex flex-col gap-3">
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>

        {/* CTA card skeleton */}
        <div className="glass-card rounded-2xl p-10 sm:p-14 text-center flex flex-col items-center gap-5">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-96 max-w-full" />
          <Skeleton className="h-5 w-80 max-w-full" />
          <div className="flex gap-4 mt-2">
            <Skeleton className="h-14 w-44 rounded-xl" />
            <Skeleton className="h-14 w-44 rounded-xl" />
          </div>
        </div>

      </div>
    </div>
  );
}
