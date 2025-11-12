"use client";

import { SidebarToggle } from "@/components/common/sidebar-toggle";
import { Login } from "@/components/user/login";
import { User } from "@/components/user/user";
import { useSession } from "next-auth/react";

export const Header = () => {
  const { data: session } = useSession();

  const renderUserOrLogin = () => {
    if (session) {
      return <User />;
    }
    return <Login />;
  };

  return (
    <div className="flex justify-between items-center px-4 py-2 border-b">
      <div className="flex items-center gap-2">
        <SidebarToggle />
        <h1 className="text-xl font-medium">
          Multimodal Interactive Chat2Edit
        </h1>
      </div>
      {renderUserOrLogin()}
    </div>
  );
};
