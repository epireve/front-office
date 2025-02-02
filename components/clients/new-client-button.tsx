"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewClientForm } from "./new-client-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface NewClientButtonProps {
  onClientAdded?: () => void;
}

export function NewClientButton({ onClientAdded }: NewClientButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <NewClientForm
          onSuccess={() => {
            setOpen(false);
            onClientAdded?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
