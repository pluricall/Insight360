import { Skeleton } from "@/components/ui/skeleton";

export function FormSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-2 w-24 rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}