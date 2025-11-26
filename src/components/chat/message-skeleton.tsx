import { Skeleton } from "@/components/ui/skeleton";

export const MessageSkeleton = () => {
  return (
    <div className="rounded-lg border p-4 mx-4 my-2 rounded-tl-none space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-24 w-32" />
        <Skeleton className="h-24 w-32" />
      </div>
    </div>
  );
};

