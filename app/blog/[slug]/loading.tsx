import { SkeletonBlogPost } from "@/components/Skeleton";

export default function BlogPostLoading() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SkeletonBlogPost />
      </div>
    </div>
  );
}
