"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Proposal {
  id: string;
  title: string;
  client: string;
  status: "draft" | "review" | "approved" | "sent";
  createdAt: string;
  lastModified: string;
}

const mockProposals: Proposal[] = [
  {
    id: "1",
    title: "Software Development Services",
    client: "Tech Corp",
    status: "draft",
    createdAt: "2024-03-15",
    lastModified: "2024-03-15",
  },
  // Add more mock proposals as needed
];

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  sent: "bg-blue-100 text-blue-800",
};

export default function ProposalsPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-end">
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Proposal
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockProposals.map((proposal) => (
          <Card
            key={proposal.id}
            className="p-4 transition-shadow hover:shadow-lg"
          >
            <div className="flex flex-col space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{proposal.title}</h3>
                  <p className="text-sm text-gray-600">{proposal.client}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    statusColors[proposal.status]
                  }`}
                >
                  {proposal.status}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <p>Created: {proposal.createdAt}</p>
                <p>Last Modified: {proposal.lastModified}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Preview
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
