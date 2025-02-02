"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientDetailsSheet } from "./client-details-sheet";
import { ReEnrichDialog } from "./re-enrich-dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Globe, RefreshCw, XCircle } from "lucide-react";

interface Client {
  id: string;
  name: string;
  website: string;
  address: string;
  industry: string;
  email?: string;
  status: string;
  created_at: string;
  enriched_data?: any;
}

interface ClientsTableProps {
  clients: Client[];
  onRefresh: () => void;
}

export function ClientsTable({ clients, onRefresh }: ClientsTableProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No clients found. Add your first client to get started!
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-primary"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      {client.website}
                    </a>
                  </TableCell>
                  <TableCell>{client.industry}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {new Date(client.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {client.status === "pending_enrichment" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelEnrichment(client.id)}
                          disabled={isCancelling}
                        >
                          <XCircle
                            className={cn(
                              "w-4 h-4",
                              isCancelling && "animate-pulse",
                            )}
                          />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (client.status === "pending_enrichment") {
                              toast({
                                title: "Enrichment in Progress",
                                description:
                                  "Please wait for the current enrichment to complete.",
                              });
                              return;
                            }
                            setSelectedClient(client);
                            setShowReEnrich(true);
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedClient(client)}
                      >
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedClient && (
        <>
          <ClientDetailsSheet
            client={selectedClient}
            open={!!selectedClient}
            onOpenChange={(open) => !open && setSelectedClient(null)}
            onClientDeleted={onRefresh}
          />
          <ReEnrichDialog
            clientId={selectedClient.id}
            clientName={selectedClient.name}
            clientWebsite={selectedClient.website}
            clientIndustry={selectedClient.industry}
            open={showReEnrich}
            onOpenChange={setShowReEnrich}
          />
        </>
      )}
    </>
  );
}
