import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  Sidebar as SidebarUI,
} from "@/components/ui/sidebar";
import { ChatList } from "@/components/chat/chat-list";
import { NewChat } from "@/components/chat/new-chat";

export const Sidebar = () => {
  return (
    <SidebarUI>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <NewChat />
        </SidebarGroup>
        <SidebarGroup className="p-0">
          <ChatList />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </SidebarUI>
  );
};
