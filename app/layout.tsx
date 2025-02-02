import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/supabase-auth-provider";
import { Header } from "@/components/header";

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
        <AuthProvider>
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
                  <Header />
                  <main className="flex-1 w-full overflow-y-auto">
                    <div className="flex flex-col gap-4 p-4 max-w-[100rem] mx-auto">
                      {children}
                    </div>
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
