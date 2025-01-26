"use client";

import * as React from "react";
import {
  MessageSquare,
  LayoutDashboard,
  Bot,
  Database,
  FolderSearch,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Front Office navigation items
const navItems = [
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

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sidebar
      variant="floating"
      className="bg-background border-border"
      {...props}
    >
      <SidebarHeader className="border-b border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <button onClick={() => router.push("/")}>
                <div className="flex items-center justify-center rounded-lg aspect-square size-8 bg-primary text-primary-foreground">
                  <MessageSquare className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-foreground">
                    Front Office
                  </span>
                  <span className="text-xs text-muted-foreground">
                    AI Assistant
                  </span>
                </div>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "text-foreground hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href &&
                      "bg-accent text-accent-foreground",
                  )}
                >
                  <button onClick={() => router.push(item.href)}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
