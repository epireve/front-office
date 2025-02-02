import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  MapPin,
  Building2,
  Users,
  DollarSign,
  Calendar,
  Link,
  Briefcase,
  Code2,
  Target,
  MapPinned,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { EnrichmentTimer } from "@/components/clients/enrichment-timer";
import { useState } from "react";

interface ClientDetailsSheetProps {
  client: {
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
    updated_at?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientDeleted?: () => void;
}

const FlushDataButton = ({ clientId }: { clientId: string }) => {
  const handleFlushData = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("clients")
        .update({
          enriched_data: null,
          status: "pending_enrichment",
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId);

      if (error) throw error;

      toast.success("Successfully flushed enriched data");
    } catch (error) {
      console.error("Error flushing data:", error);
      toast.error("Failed to flush enriched data");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2 className="w-4 h-4" />
          Flush Enriched Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all enriched data for this client. The
            data will need to be re-enriched to restore it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleFlushData}>
            Flush Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const DeleteButton = ({
  clientId,
  onDelete,
}: {
  clientId: string;
  onDelete: () => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();

      // First, delete all related enrichment logs
      const { error: logsError } = await supabase
        .from("enrichment_logs")
        .delete()
        .eq("client_id", clientId);

      if (logsError) {
        console.error("Error deleting enrichment logs:", logsError);
        throw logsError;
      }

      // Then delete the client
      const { error: clientError } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId);

      if (clientError) {
        console.error("Error deleting client:", clientError);
        throw clientError;
      }

      toast.success("Client deleted successfully");
      onDelete();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete client",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Delete Client
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            client and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Client"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export function ClientDetailsSheet({
  client,
  open,
  onOpenChange,
  onClientDeleted,
}: ClientDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{client.name}</SheetTitle>
          <div className="flex flex-col gap-2">
            <SheetDescription>
              Added on {new Date(client.created_at).toLocaleDateString()}
            </SheetDescription>
            {client.status === "pending_enrichment" && (
              <EnrichmentTimer
                startTime={client.updated_at || client.created_at}
              />
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-180px)] pr-4">
          <div className="mt-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="mb-4 text-sm font-medium text-gray-500">
                Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-gray-500" />
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {client.website}
                  </a>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">{client.address}</span>
                </div>
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">{client.industry}</span>
                </div>
                {client.email && (
                  <div className="flex items-center">
                    <Link className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Enriched Data */}
            {client.enriched_data && (
              <>
                <div>
                  <h3 className="mb-4 text-sm font-medium text-gray-500">
                    Company Details
                  </h3>
                  <div className="space-y-3">
                    {client.enriched_data.employeeCount && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          {client.enriched_data.employeeCount} employees
                        </span>
                      </div>
                    )}
                    {client.enriched_data.revenue && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          Revenue: {client.enriched_data.revenue}
                        </span>
                      </div>
                    )}
                    {client.enriched_data.founded && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          Founded: {client.enriched_data.founded}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {client.enriched_data.description && (
                  <>
                    <div>
                      <h3 className="mb-4 text-sm font-medium text-gray-500">
                        Description
                      </h3>
                      <p className="text-sm text-gray-600">
                        {client.enriched_data.description}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Social Media */}
                {client.enriched_data.socialMedia &&
                  Object.keys(client.enriched_data.socialMedia).length > 0 && (
                    <>
                      <div>
                        <h3 className="mb-4 text-sm font-medium text-gray-500">
                          Social Media
                        </h3>
                        <div className="space-y-3">
                          {client.enriched_data.socialMedia.linkedin && (
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                              <a
                                href={client.enriched_data.socialMedia.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                          {client.enriched_data.socialMedia.twitter && (
                            <div className="flex items-center">
                              <Link className="w-4 h-4 mr-2 text-gray-500" />
                              <a
                                href={client.enriched_data.socialMedia.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                Twitter Profile
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                {/* Technologies */}
                {client.enriched_data.technologies &&
                  client.enriched_data.technologies.length > 0 && (
                    <>
                      <div>
                        <h3 className="mb-4 text-sm font-medium text-gray-500">
                          Technologies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {client.enriched_data.technologies.map((tech) => (
                            <div
                              key={tech}
                              className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                            >
                              {tech}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                {/* Competitors */}
                {client.enriched_data.competitors &&
                  client.enriched_data.competitors.length > 0 && (
                    <>
                      <div>
                        <h3 className="mb-4 text-sm font-medium text-gray-500">
                          Competitors
                        </h3>
                        <div className="space-y-2">
                          {client.enriched_data.competitors.map(
                            (competitor) => (
                              <div
                                key={competitor}
                                className="flex items-center"
                              >
                                <Target className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm">{competitor}</span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                {/* Locations */}
                {client.enriched_data.locations &&
                  client.enriched_data.locations.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-sm font-medium text-gray-500">
                        Office Locations
                      </h3>
                      <div className="space-y-2">
                        {client.enriched_data.locations.map((location) => (
                          <div key={location} className="flex items-center">
                            <MapPinned className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm">{location}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
          <DeleteButton
            clientId={client.id}
            onDelete={() => {
              onOpenChange(false);
              onClientDeleted?.();
            }}
          />
          <FlushDataButton clientId={client.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
