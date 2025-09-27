"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export const SidebarToggle = () => {
  const { toggleSidebar } = useSidebar();

  const handleToggleClick = () => {
    toggleSidebar();
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleToggleClick}>
      <Menu />
    </Button>
  );
};
