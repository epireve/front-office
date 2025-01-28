"use client";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeMap = {
  "/clients": "Clients",
  "/proposals": "Proposals",
  "/emails": "Email Management",
  "/": "Simple Chat",
  "/structured_output": "Structured Output",
  "/agents": "Agents",
  "/retrieval": "Retrieval",
  "/retrieval_agents": "Retrieval Agents",
  "/ai_sdk": "Langchain x AI SDK RSC",
  "/ai_sdk/agent": "Agent",
  "/ai_sdk/tools": "Tools",
};

export function AppBreadcrumb() {
  const pathname = usePathname();
  const currentPage = routeMap[pathname as keyof typeof routeMap] || "404";

  // Handle nested routes
  const isAiSdkSubpage = pathname.startsWith("/ai_sdk/");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">Front Office</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        {isAiSdkSubpage && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href="/ai_sdk">AI SDK</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
