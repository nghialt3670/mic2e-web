"use client";

import { SidebarToggle } from "@/components/common/sidebar-toggle";
import { Login } from "@/features/user/components/login";
import { User } from "@/features/user/components/user";
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
    <div className="flex justify-between items-center px-4 py-2">
      <SidebarToggle />
      {renderUserOrLogin()}
    </div>
  );
};
