import "./globals.css";
import { Inter } from "next/font/google";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  MessageSquare,
  LayoutDashboard,
  Bot,
  Database,
  FolderSearch,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Front Office",
  description: "Built with LangChain, Vercel AI SDK, and Shadcn UI",
};

const items = [
  {
    title: "Simple Chat",
    href: "/",
    icon: MessageSquare,
  },
  {
    title: "Structured Output",
    href: "/structured_output",
    icon: LayoutDashboard,
  },
  {
    title: "Agents",
    href: "/agents",
    icon: Bot,
  },
  {
    title: "Retrieval",
    href: "/retrieval",
    icon: Database,
  },
  {
    title: "Retrieval Agents",
    href: "/retrieval_agents",
    icon: FolderSearch,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider defaultOpen>
          <div className="flex min-h-screen">
            <Sidebar>
              <SidebarHeader className="border-b border-border">
                <h2 className="px-2 text-lg font-semibold">Front Office</h2>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <a href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
            <main className="flex-1 p-8">{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
