import { Skeleton } from "@/components/Skeleton";

export default function EducationLoading() {
  return (
    <div className="pt-16 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-12 w-64" />
        </div>
        <div className="max-w-2xl">
          <div className="glass-card rounded-2xl p-8 flex flex-col sm:flex-row items-start gap-6">
            <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
            <div className="flex-1 flex flex-col gap-3">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-5 w-64" />
              <div className="flex gap-5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
