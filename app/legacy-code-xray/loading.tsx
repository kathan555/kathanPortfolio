import { Skeleton } from "@/components/Skeleton";

export default function XrayLoading() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-10">
          <Skeleton className="h-6 w-56 mb-5 rounded-full" />
          <Skeleton className="h-14 w-3/4 mb-5" />
          <Skeleton className="h-5 w-full max-w-2xl mb-2" />
          <Skeleton className="h-5 w-4/5 max-w-xl" />
        </div>
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
          <Skeleton className="h-72 w-full rounded-xl mb-5" />
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
