import { Skeleton } from "@/components/ui/skeleton";

export const MessageSkeleton = () => {
  return (
    <div className="rounded-lg border mx-4 my-2">
      <Skeleton className="h-10 w-full" />
    </div>
  );
};
