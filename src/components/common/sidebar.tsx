"use server";

import { ChatList } from "@/components/chat/chat-list";
import { ChatNew } from "@/components/chat/chat-new";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  Sidebar as SidebarUI,
} from "@/components/ui/sidebar";

import { Separator } from "../ui/separator";
import { UserOrLogin } from "../user/user-or-login";
import { SidebarToggle } from "./sidebar-toggle";

export const Sidebar = async () => {
  return (
    <SidebarUI>
      <SidebarHeader className="flex flex-row items-center justify-between p-1">
        <ChatNew />
        <SidebarToggle />
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <ChatList />
        </SidebarGroup>
      </SidebarContent>
      <Separator />
      <SidebarFooter className="flex flex-row items-center justify-between p-3">
        <UserOrLogin />
      </SidebarFooter>
    </SidebarUI>
  );
};
