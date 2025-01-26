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
  "/": "Simple Chat",
  "/structured_output": "Structured Output",
  "/agents": "Agents",
  "/retrieval": "Retrieval",
  "/retrieval_agents": "Retrieval Agents",
};

export function AppBreadcrumb() {
  const pathname = usePathname();
  const currentPage = routeMap[pathname as keyof typeof routeMap] || "404";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">Front Office</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
