"use client";

import { NewClientForm } from "@/components/clients/new-client-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Building2, Clock, ArrowUpRight } from "lucide-react";

interface Client {
  id: string;
  name: string;
  company: string;
  website: string;
  address: string;
  industry: string;
  email: string;
  lastContact: string;
  status: "active" | "inactive";
  enrichedData?: {
    employeeCount?: string;
    revenue?: string;
    founded?: string;
    description?: string;
    socialMedia?: {
      linkedin?: string;
      twitter?: string;
    };
  };
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Tech Corp",
    company: "Tech Corp Inc.",
    website: "https://techcorp.com",
    address: "123 Tech Street, San Francisco, CA",
    industry: "Technology",
    email: "contact@techcorp.com",
    lastContact: "2024-03-15",
    status: "active",
    enrichedData: {
      employeeCount: "500-1000",
      revenue: "$50M-$100M",
      founded: "2010",
      description: "Leading provider of enterprise software solutions",
      socialMedia: {
        linkedin: "https://linkedin.com/company/techcorp",
        twitter: "https://twitter.com/techcorp",
      },
    },
  },
  // Add more mock clients as needed
];

export default function ClientsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-end mb-6">
        <NewClientForm />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockClients.map((client) => (
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
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  client.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {client.status}
              </span>
            </div>

            {client.enrichedData && (
              <div className="pt-4 mt-4 border-t">
                <h4 className="mb-2 text-sm font-medium text-gray-900">
                  AI Enriched Data
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Employees:</span>
                    <p>{client.enrichedData.employeeCount}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Revenue:</span>
                    <p>{client.enrichedData.revenue}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Founded:</span>
                    <p>{client.enrichedData.founded}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {client.enrichedData.description}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Last Contact: {client.lastContact}
              </div>
              <Button variant="outline" size="sm">
                View Details
                <ArrowUpRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
