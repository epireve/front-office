"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Loader2 } from "lucide-react";
import { createNewClient } from "@/app/(main)/clients/actions";
import { useToast } from "@/components/ui/use-toast";

const normalizeUrl = (url: string) => {
  if (!url) return url;
  url = url.trim().toLowerCase();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  try {
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch (e) {
    return url;
  }
};

const clientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  website: z
    .string()
    .min(1, "Website is required")
    .transform(normalizeUrl)
    .pipe(z.string().url("Please enter a valid website URL")),
  address: z
    .string()
    .min(2, "Please enter a location (city, state, country, etc.)"),
  industry: z.string().min(2, "Please select or enter an industry"),
  customIndustry: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Other",
];

interface NewClientFormProps {
  onSuccess?: () => void;
}

export function NewClientForm({ onSuccess }: NewClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const { toast } = useToast();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      website: "",
      address: "",
      industry: "",
      customIndustry: "",
    },
  });

  async function onSubmit(data: ClientFormValues) {
    setIsLoading(true);
    try {
      // If "Other" is selected, use the custom industry value
      const finalData = {
        ...data,
        industry:
          data.industry === "Other" ? data.customIndustry! : data.industry,
      };

      const result = await createNewClient(finalData);

      if (result.success) {
        toast({
          title: "Success",
          description: "Client added successfully. Starting data enrichment...",
        });
        form.reset();
        onSuccess?.();
      } else {
        throw new Error(result.error || "Failed to create client");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create client",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogDescription>
          Enter basic client information. Our AI agent will automatically enrich
          the profile with additional details.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Company website URL - no need to add https://
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="City, State, Country, etc." {...field} />
                </FormControl>
                <FormDescription>
                  General location for research purposes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setShowCustomIndustry(value === "Other");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {showCustomIndustry && (
            <FormField
              control={form.control}
              name="customIndustry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specify Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter industry type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className="flex justify-end pt-4 space-x-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? "Processing..." : "Add Client"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
