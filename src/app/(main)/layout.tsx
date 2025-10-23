import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Sidebar } from "@/components/common/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
