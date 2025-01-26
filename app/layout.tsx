import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Front Office",
  description: "Built with LangChain, Vercel AI SDK, and Shadcn UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={cn(inter.className, "h-full")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
                <header className="sticky top-0 z-10 flex items-center h-16 gap-2 px-4 shrink-0 bg-background">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="h-4 mr-2" />
                  <AppBreadcrumb />
                  <div className="flex-1" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 w-full overflow-y-auto">
                  <div className="flex flex-col gap-4 p-4 max-w-[100rem] mx-auto">
                    {children}
                  </div>
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
