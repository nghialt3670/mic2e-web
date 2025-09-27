import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  Sidebar as SidebarUI,
} from "@/components/ui/sidebar";
import { NewChat } from "@/features/chat/components/new-chat";

export const Sidebar = () => {
  return (
    <SidebarUI>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <NewChat />
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </SidebarUI>
  );
};
