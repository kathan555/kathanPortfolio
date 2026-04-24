import { SkeletonHeader, SkeletonCard } from "@/components/Skeleton";

export default function ProjectsLoading() {
  return (
    <div className="pt-16 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SkeletonHeader />
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="min-h-[320px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
