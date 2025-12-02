import { Skeleton } from "@/components/ui/skeleton";

export const MessageSkeleton = () => {
  return (
    <div className="rounded-lg border p-2 size-fit">
      <Skeleton className="h-6 w-40" />
    </div>
  );
};
