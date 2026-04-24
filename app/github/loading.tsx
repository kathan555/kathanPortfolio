import { SkeletonHeader, SkeletonRepoCard } from "@/components/Skeleton";
import { Skeleton } from "@/components/Skeleton";

export default function GithubLoading() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-14">
          <Skeleton className="h-4 w-28 mb-4" />
          <Skeleton className="h-14 w-80 mb-4" />
          <Skeleton className="h-5 w-64 mb-5" />
          <Skeleton className="h-10 w-52 rounded-xl" />
        </div>

        {/* Repo grid skeleton */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonRepoCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
