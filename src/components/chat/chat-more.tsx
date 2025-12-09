"use client";

import { Loader2 } from "lucide-react";

import { Button } from "../ui/button";

export const ChatMore = () => {
  return (
    <Button variant="ghost">
      <Loader2 className="h-4 w-4 animate-spin" />
      Load more
    </Button>
  );
};
