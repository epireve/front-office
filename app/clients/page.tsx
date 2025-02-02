"use client";

import { useState, useEffect } from "react";
import { useRealtimeClients } from "@/lib/hooks/useRealtimeClients";
import { ClientsTable } from "@/components/clients/clients-table";
import { ClientGrid } from "@/components/clients/client-grid";
import { NewClientButton } from "@/components/clients/new-client-button";
import { PageHeader } from "@/components/ui/page-header";
import { ViewToggle } from "@/components/clients/view-toggle";
import { getClients } from "./actions";

interface Client {
  id: string;
  name: string;
  website: string;
  address: string;
  industry: string;
  email?: string;
  status: string;
  created_at: string;
  enriched_data?: {
    employeeCount?: string;
    revenue?: string;
    founded?: string;
    description?: string;
    socialMedia?: {
      linkedin?: string;
      twitter?: string;
    };
    technologies?: string[];
    competitors?: string[];
    locations?: string[];
  };
}

export default function ClientsPage() {
  // Enable real-time updates
  useRealtimeClients();

  const [view, setView] = useState<"grid" | "table">("grid");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    const { success, clients: loadedClients } = await getClients();
    if (success && loadedClients) {
      setClients(loadedClients);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Save view preference to localStorage
  useEffect(() => {
    const savedView = localStorage.getItem("clientsView");
    if (savedView === "grid" || savedView === "table") {
      setView(savedView);
    }
  }, []);

  const handleViewChange = (newView: "grid" | "table") => {
    setView(newView);
    localStorage.setItem("clientsView", newView);
  };

  return (
    <div className="container py-6 mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Clients"
          description="Manage and monitor your client portfolio."
        />
        <div className="flex items-center gap-4">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          <NewClientButton onClientAdded={loadClients} />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : view === "grid" ? (
        <ClientGrid clients={clients} onRefresh={loadClients} />
      ) : (
        <ClientsTable clients={clients} onRefresh={loadClients} />
      )}
    </div>
  );
}
