import { cn } from "@/lib/utils";

// ── Base block ──────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

// ── Page section header (label + title + subtitle) ──────────────────────────
export function SkeletonHeader() {
  return (
    <div className="mb-14">
      <Skeleton className="h-4 w-28 mb-4" />
      <Skeleton className="h-12 w-72 mb-4" />
      <Skeleton className="h-5 w-96 max-w-full" />
    </div>
  );
}

// ── Generic card ─────────────────────────────────────────────────────────────
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card rounded-2xl p-6 flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-20 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex gap-2 pt-3 border-t border-border/60">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
    </div>
  );
}

// ── Blog post list card (horizontal layout) ──────────────────────────────────
export function SkeletonBlogCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col md:flex-row">
      {/* Cover image placeholder */}
      <Skeleton className="md:w-60 h-48 md:h-auto shrink-0 rounded-none" />
      <div className="p-7 flex flex-col gap-4 flex-1">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
        <Skeleton className="h-8 w-3/4" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center justify-between mt-auto">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

// ── Blog post detail skeleton ─────────────────────────────────────────────────
export function SkeletonBlogPost() {
  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Skeleton className="h-4 w-28" />
      {/* Tags */}
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-16 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
      {/* Title */}
      <Skeleton className="h-14 w-4/5" />
      <Skeleton className="h-14 w-3/5" />
      {/* Excerpt */}
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-5/6" />
      {/* Date */}
      <Skeleton className="h-4 w-36" />
      {/* Cover image */}
      <Skeleton className="h-72 w-full rounded-2xl mt-2" />
      {/* Content blocks */}
      <div className="flex flex-col gap-4 mt-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-8 w-44 mt-4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-32 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

// ── GitHub repo card ──────────────────────────────────────────────────────────
export function SkeletonRepoCard() {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>
      <div className="flex gap-4 pt-3 border-t border-border/60">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>
    </div>
  );
}

// ── Hire page service card ────────────────────────────────────────────────────
export function SkeletonServiceCard() {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 h-full">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-6 w-3/4" />
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex gap-2 pt-3 border-t border-border/60">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>
    </div>
  );
}
