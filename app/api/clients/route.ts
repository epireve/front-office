import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { NextRequest } from "next/server";

import { enrichClientData } from "@/lib/agents/client-enrichment/agent";
import { ClientInput } from "@/lib/agents/client-enrichment/types";
import { createClient } from "@/lib/supabase/server";

// Input validation schema
const createClientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  website: z.string().url("Please enter a valid website URL"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  industry: z.string().min(2, "Please select an industry"),
});

// Schema for client status update
const updateStatusSchema = z.object({
  clientId: z.string(),
  status: z.enum(["pending_enrichment", "enriched", "failed", "cancelled"]),
});

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const json = await req.json();

    // Validate input
    const validatedData = createClientSchema.parse(json);

    // Create client record
    const { data: client, error: insertError } = await supabase
      .from("clients")
      .insert({
        name: validatedData.name,
        website: validatedData.website,
        address: validatedData.address,
        industry: validatedData.industry,
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create client: ${insertError.message}`);
    }

    // Start enrichment process
    const enrichmentInput: ClientInput = {
      id: client.id,
      name: client.name,
      website: client.website,
      industry: client.industry,
    };

    // Create enrichment log
    await supabase.from("enrichment_logs").insert({
      client_id: client.id,
      status: "processing",
    });

    // Trigger enrichment process
    const enrichedData = await enrichClientData(enrichmentInput);

    // Update client with enriched data
    const { error: updateError } = await supabase
      .from("clients")
      .update({
        enriched_data: enrichedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", client.id);

    if (updateError) {
      throw new Error(`Failed to update client with enriched data: ${updateError.message}`);
    }

    // Update enrichment log
    await supabase
      .from("enrichment_logs")
      .update({
        status: "completed",
        metadata: { enrichedData },
      })
      .eq("client_id", client.id);

    return NextResponse.json({
      client: {
        ...client,
        enriched_data: enrichedData,
      },
    });
  } catch (error) {
    console.error("Client creation failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(req.url);
    
    const query = supabase.from("clients").select("*");

    // Add filters if provided
    const status = searchParams.get("status");
    const industry = searchParams.get("industry");

    if (status) {
      query.eq("status", status);
    }

    if (industry) {
      query.eq("industry", industry);
    }

    const { data: clients, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, status } = updateStatusSchema.parse(body);

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from("clients")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", clientId);

    if (error) {
      console.error("Error updating client status:", error);
      return NextResponse.json(
        { error: "Failed to update client status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/clients:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 