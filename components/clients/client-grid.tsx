"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClientDetailsSheet } from "./client-details-sheet";
import { ReEnrichDialog } from "./re-enrich-dialog";
import { useToast } from "@/components/ui/use-toast";
import { EnrichmentTimer } from "@/components/clients/enrichment-timer";
import {
  Globe,
  MapPin,
  Building2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  website: string;
  address: string;
  industry: string;
  email?: string;
  status: string;
  created_at: string;
  updated_at?: string;
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

interface ClientGridProps {
  clients: Client[];
  onRefresh: () => void;
}

export function ClientGrid({ clients, onRefresh }: ClientGridProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToReEnrich, setClientToReEnrich] = useState<Client | null>(null);
  const [showReEnrich, setShowReEnrich] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();

  const handleCancelEnrichment = async (clientId: string) => {
    try {
      setIsCancelling(true);
      const response = await fetch("/api/enrich/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel enrichment");
      }

      toast({
        title: "Enrichment Cancelled",
        description: "The enrichment process has been cancelled.",
      });
      onRefresh();
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

  if (!clients?.length) {
    return (
      <div className="p-4 text-gray-500">
        No clients found. Add your first client to get started!
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card
            key={client.id}
            className="p-6 transition-shadow hover:shadow-lg"
          >
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
                <Badge
                  variant={
                    client.status === "enriched"
                      ? "default"
                      : client.status === "pending_enrichment"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {client.status}
                </Badge>
                {client.status === "pending_enrichment" && (
                  <EnrichmentTimer
                    startTime={client.updated_at || client.created_at}
                  />
                )}
                {client.status === "pending_enrichment" ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => handleCancelEnrichment(client.id)}
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
                        });
                        return;
                      }
                      setClientToReEnrich(client);
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
                onClick={() => setSelectedClient(client)}
              >
                View Details
                <ArrowUpRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedClient && (
        <ClientDetailsSheet
          client={selectedClient}
          open={!!selectedClient}
          onOpenChange={(open) => !open && setSelectedClient(null)}
          onClientDeleted={onRefresh}
        />
      )}

      {clientToReEnrich && (
        <ReEnrichDialog
          clientId={clientToReEnrich.id}
          clientName={clientToReEnrich.name}
          clientWebsite={clientToReEnrich.website}
          clientIndustry={clientToReEnrich.industry}
          open={showReEnrich}
          onOpenChange={(open) => {
            setShowReEnrich(open);
            if (!open) setClientToReEnrich(null);
          }}
        />
      )}
    </>
  );
}
