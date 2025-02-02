"use client";

import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAccountNav } from "@/components/user-account-nav";
import { useAuth } from "@/components/providers/supabase-auth-provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center h-16 gap-2 px-4 shrink-0 bg-background">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4 mr-2" />
      <AppBreadcrumb />
      <div className="flex-1" />
      <ThemeToggle />
      {user && <UserAccountNav user={user} />}
    </header>
  );
}
