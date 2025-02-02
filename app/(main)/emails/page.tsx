"use client";

import { Plus, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailDraft {
  id: string;
  subject: string;
  recipient: string;
  status: "draft" | "scheduled" | "sent";
  createdAt: string;
  scheduledFor?: string;
}

const mockEmails: EmailDraft[] = [
  {
    id: "1",
    subject: "Proposal for Software Development Services",
    recipient: "john@techcorp.com",
    status: "draft",
    createdAt: "2024-03-15",
  },
  {
    id: "2",
    subject: "Updated Service Agreement",
    recipient: "sarah@innovate.com",
    status: "scheduled",
    createdAt: "2024-03-14",
    scheduledFor: "2024-03-16",
  },
  // Add more mock emails as needed
];

export default function EmailsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-end mb-6">
        <Button>
          <Plus className="w-4 h-4 mr-2" /> New Email
        </Button>
      </div>

      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="drafts">
            <Mail className="w-4 h-4 mr-2" />
            Drafts
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Clock className="w-4 h-4 mr-2" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="sent">
            <Send className="w-4 h-4 mr-2" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockEmails
              .filter((email) => email.status === "draft")
              .map((email) => (
                <EmailCard key={email.id} email={email} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockEmails
              .filter((email) => email.status === "scheduled")
              .map((email) => (
                <EmailCard key={email.id} email={email} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="sent">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockEmails
              .filter((email) => email.status === "sent")
              .map((email) => (
                <EmailCard key={email.id} email={email} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmailCard({ email }: { email: EmailDraft }) {
  return (
    <Card className="p-4 transition-shadow hover:shadow-lg">
      <div className="flex flex-col space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{email.subject}</h3>
          <p className="text-sm text-gray-600">{email.recipient}</p>
        </div>
        <div className="space-y-1 text-xs text-gray-500">
          <p>Created: {email.createdAt}</p>
          {email.scheduledFor && <p>Scheduled: {email.scheduledFor}</p>}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            Edit
          </Button>
          {email.status === "draft" && (
            <Button variant="outline" size="sm" className="flex-1">
              Schedule
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
