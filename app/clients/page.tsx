"use client";

import { Suspense, useState } from "react";
import { NewClientForm } from "@/components/clients/new-client-form";
import { ClientDetailsSheet } from "@/components/clients/client-details-sheet";
import { ReEnrichDialog } from "@/components/clients/re-enrich-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe,
  MapPin,
  Building2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { getClients } from "./actions";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Client {
  id: string;
  name: string;
  website: string;
  address: string;
  industry: string;
  email?: string;
  last_contact?: string;
  status: string;
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
  created_at: string;
}

function ClientCard({ client }: { client: Client }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showReEnrich, setShowReEnrich] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();

  const handleCancelEnrichment = async () => {
    try {
      setIsCancelling(true);
      const response = await fetch("/api/enrich/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: client.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel enrichment");
      }

      toast({
        title: "Enrichment Cancelled",
        description: "The enrichment process has been cancelled.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error cancelling enrichment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel enrichment process.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <Card key={client.id} className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{client.name}</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="w-4 h-4 mr-2" />
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  {client.website}
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {client.address}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="w-4 h-4 mr-2" />
                {client.industry}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-1 text-xs",
                client.status === "enriched"
                  ? "bg-green-100 text-green-800"
                  : client.status === "pending_enrichment"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800",
              )}
            >
              {client.status}
            </span>
            {client.status === "pending_enrichment" ? (
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={handleCancelEnrichment}
                disabled={isCancelling}
              >
                <XCircle
                  className={cn("w-4 h-4", isCancelling && "animate-pulse")}
                />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => {
                  if (client.status === "pending_enrichment") {
                    toast({
                      title: "Enrichment in Progress",
                      description:
                        "Please wait for the current enrichment to complete.",
                      variant: "default",
                    });
                    return;
                  }
                  setShowReEnrich(true);
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {client.enriched_data && (
          <div className="pt-4 mt-4 border-t">
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              AI Enriched Data
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Employees:</span>
                <p>{client.enriched_data.employeeCount}</p>
              </div>
              <div>
                <span className="text-gray-500">Revenue:</span>
                <p>{client.enriched_data.revenue}</p>
              </div>
              <div>
                <span className="text-gray-500">Founded:</span>
                <p>{client.enriched_data.founded}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {client.enriched_data.description}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            Added: {new Date(client.created_at).toLocaleDateString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(true)}
          >
            View Details
            <ArrowUpRight className="w-3 h-3 ml-2" />
          </Button>
        </div>
      </Card>

      <ClientDetailsSheet
        client={client}
        open={showDetails}
        onOpenChange={setShowDetails}
      />

      <ReEnrichDialog
        clientId={client.id}
        clientName={client.name}
        clientWebsite={client.website}
        clientIndustry={client.industry}
        open={showReEnrich}
        onOpenChange={setShowReEnrich}
      />
    </>
  );
}

async function ClientsList() {
  const { success, clients, error } = await getClients();

  if (!success) {
    return (
      <div className="p-4 text-red-500">Error loading clients: {error}</div>
    );
  }

  if (!clients?.length) {
    return (
      <div className="p-4 text-gray-500">
        No clients found. Add your first client to get started!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}

export default function ClientsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-end mb-6">
        <NewClientForm />
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4 animate-pulse">
                  <div className="w-3/4 h-6 bg-gray-200 rounded" />
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-gray-200 rounded" />
                    <div className="w-full h-4 bg-gray-200 rounded" />
                    <div className="w-2/3 h-4 bg-gray-200 rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        }
      >
        <ClientsList />
      </Suspense>
    </div>
  );
}
