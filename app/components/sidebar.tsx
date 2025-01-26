"use client";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <ScrollArea className="h-full">
            <SidebarContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex h-screen w-64 flex-col border-r",
          className,
        )}
      >
        <ScrollArea className="flex-1">
          <SidebarContent />
        </ScrollArea>
      </div>
    </>
  );
}

function SidebarContent() {
  return (
    <div className="py-4 space-y-4">
      <div className="px-3 py-2">
        <h2 className="px-4 mb-2 text-lg font-semibold tracking-tight">
          Front Office
        </h2>
        <nav className="space-y-1">
          <Link href="/" passHref>
            <Button variant="ghost" className="justify-start w-full">
              Simple Chat
            </Button>
          </Link>
          <Link href="/structured" passHref>
            <Button variant="ghost" className="justify-start w-full">
              Structured Output
            </Button>
          </Link>
          <Link href="/agents" passHref>
            <Button variant="ghost" className="justify-start w-full">
              Agents
            </Button>
          </Link>
          <Link href="/retrieval" passHref>
            <Button variant="ghost" className="justify-start w-full">
              Retrieval
            </Button>
          </Link>
          <Link href="/retrieval_agents" passHref>
            <Button variant="ghost" className="justify-start w-full">
              Retrieval Agents
            </Button>
          </Link>
        </nav>
      </div>
    </div>
  );
}
