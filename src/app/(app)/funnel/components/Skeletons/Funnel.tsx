import { Skeleton } from "@/components/ui/skeleton";

export function FunnelAndDonutSkeleton() {
  return (
    <div className="flex flex-row items-center justify-between">
            <Skeleton className="w-[500px] h-[380px]" />
            <Skeleton className="w-[200px] h-[200px] rounded-full" />
          </div>
  );
}
