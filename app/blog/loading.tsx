import { SkeletonHeader, SkeletonBlogCard } from "@/components/Skeleton";

export default function BlogLoading() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SkeletonHeader />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlogCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
