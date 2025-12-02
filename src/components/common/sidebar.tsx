import { ChatList } from "@/components/chat/chat-list";
import { NewChat } from "@/components/chat/new-chat";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  Sidebar as SidebarUI,
} from "@/components/ui/sidebar";

export const Sidebar = () => {
  return (
    <SidebarUI>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <NewChat />
        </SidebarGroup>
        <SidebarGroup className="p-0 flex-1 min-h-0">
          <ChatList />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </SidebarUI>
  );
};
