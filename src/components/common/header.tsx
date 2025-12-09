"use client";

import { SidebarToggle } from "@/components/common/sidebar-toggle";
import { useIsMobile } from "@/hooks/use-mobile";

import { useSidebar } from "../ui/sidebar";

export const Header = () => {
  const isMobile = useIsMobile();
  const { open } = useSidebar();
  const showSidebarToggle = isMobile ? true : !open;

  return (
    <div
      className={`flex justify-between items-center ${showSidebarToggle ? "p-1 pl-2" : "p-2"}`}
    >
      <div className="flex items-center gap-2">
        {showSidebarToggle && <SidebarToggle />}
        <h1 className={`text-xl font-medium ${!showSidebarToggle && "ml-2"}`}>
          Multimodal Interactive Chat2Edit
        </h1>
      </div>
    </div>
  );
};
