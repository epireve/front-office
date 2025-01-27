import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ReEnrichDialogProps {
  clientId: string;
  clientName: string;
  clientWebsite: string;
  clientIndustry: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReEnrichDialog({
  clientId,
  clientName,
  clientWebsite,
  clientIndustry,
  open,
  onOpenChange,
}: ReEnrichDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReEnrich = async () => {
    try {
      console.log("Starting re-enrichment for client:", {
        clientId,
        clientName,
        clientWebsite,
        clientIndustry,
      });
      setIsLoading(true);

      // First update client status to pending
      const statusUpdate = await fetch("/api/clients", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          status: "pending_enrichment",
        }),
      });

      if (!statusUpdate.ok) {
        const errorData = await statusUpdate.json();
        console.error("Status update failed:", errorData);
        throw new Error(errorData.error || "Failed to update client status");
      }

      // Then start enrichment process
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          name: clientName,
          website: clientWebsite,
          industry: clientIndustry,
          forceUpdate: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Enrichment failed:", errorData);
        throw new Error(
          errorData.error || "Failed to start enrichment process",
        );
      }

      console.log("Re-enrichment started successfully");
      toast({
        title: "Enrichment Started",
        description:
          "The enrichment process has been started. This may take a few minutes.",
        variant: "default",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error starting enrichment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start enrichment process. Please try again.",
        variant: "destructive",
      });

      // If status update succeeded but enrichment failed, revert status
      try {
        await fetch("/api/clients", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId,
            status: "failed",
          }),
        });
      } catch (revertError) {
        console.error("Failed to revert client status:", revertError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Re-run Enrichment</DialogTitle>
          <DialogDescription>
            This will use AI to gather fresh information about {clientName}.
            This process will consume LLM credits and may take a few minutes to
            complete.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 mt-2 space-y-3 text-sm border rounded-lg bg-muted/50">
          <p className="font-medium">This process will:</p>
          <ul className="ml-4 space-y-1 list-disc">
            <li>Scrape the latest content from the company website</li>
            <li>Perform advanced search for recent company information</li>
            <li>Use AI to analyze and structure the gathered data</li>
            <li>Update the client profile with fresh insights</li>
          </ul>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReEnrich}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Start Enrichment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
