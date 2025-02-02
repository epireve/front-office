import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
      className="h-full"
    >
      <div className="relative flex w-full h-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 w-0 min-h-0">
          <Header />
          <main className="flex-1 w-full overflow-y-auto">
            <div className="flex flex-col gap-4 p-4 max-w-[100rem] mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
