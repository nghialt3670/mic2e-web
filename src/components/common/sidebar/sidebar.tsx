import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  Sidebar as SidebarUI,
} from "@/components/ui/sidebar";
import { NewChat } from "@/features/chat/components/new-chat";
import { ChatList } from "@/features/chat/components/chat-list";

export const Sidebar = () => {
  return (
    <SidebarUI>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <NewChat />
        </SidebarGroup>
        <SidebarGroup>
          <ChatList />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </SidebarUI>
  );
};
