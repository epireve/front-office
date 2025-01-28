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
import { createNewClient } from "@/app/clients/actions";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    website: z
      .string()
      .min(1, "Website is required")
      .transform((val) => {
        // Remove any existing protocol
        let url = val.replace(/^(https?:\/\/)/, "");
        // Add https:// if no protocol exists
        return `https://${url}`;
      }),
    address: z
      .string()
      .min(1, "Address is required")
      .describe("Enter location details like district, state, country"),
    industry: z.string().min(1, "Industry is required"),
    customIndustry: z.string().min(1, "Please specify the industry"),
    email: z.string().email().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // If industry is "other", customIndustry must be provided
      if (data.industry === "other") {
        return data.customIndustry.length > 0;
      }
      return true;
    },
    {
      message: "Please specify the industry",
      path: ["customIndustry"],
    },
  );

const industries = [
  "technology",
  "healthcare",
  "finance",
  "retail",
  "manufacturing",
  "education",
  "real_estate",
  "energy",
  "transportation",
  "hospitality",
  "media",
  "agriculture",
  "construction",
  "other",
] as const;

export function NewClientForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      website: "",
      address: "",
      industry: "",
      customIndustry: "",
      email: "",
    },
  });

  const selectedIndustry = form.watch("industry");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Use custom industry value when "other" is selected
      const finalIndustry =
        values.industry === "other" ? values.customIndustry : values.industry;

      await createNewClient({
        name: values.name,
        website: values.website,
        address: values.address,
        industry: finalIndustry,
        email: values.email || undefined,
      });

      toast({
        title: "Success",
        description: "Client added successfully. Starting data enrichment...",
      });
      form.reset();
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create client",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> New Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enter basic client information. Our AI agent will automatically
            enrich the profile with additional details.
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
                    <Input placeholder="District, State, Country" {...field} />
                  </FormControl>
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
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry.charAt(0).toUpperCase() +
                            industry.slice(1).replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedIndustry === "other" && (
              <FormField
                control={form.control}
                name="customIndustry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter industry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="contact@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4 space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Processing..." : "Add Client"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
