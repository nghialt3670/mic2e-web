import { Skeleton } from "@/components/ui/skeleton";

export default function ChatsLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex w-full flex-1 items-start justify-center max-w-5xl overflow-y-scroll py-4 px-4">
        <div className="flex w-full flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      <div className="relative flex w-full max-w-5xl items-center justify-center px-4 pb-10">
        <div className="w-full rounded-2xl border bg-background/80 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}


