import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { setCancellationToken } from "@/lib/agents/client-enrichment/agent";

export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    // Set cancellation token
    setCancellationToken(clientId, true);

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Update client status to indicate cancellation
    const { error: updateError } = await supabase
      .from("clients")
      .update({ 
        status: "cancelled",
        updated_at: new Date().toISOString()
      })
      .eq("id", clientId);

    if (updateError) {
      console.error("Error updating client status:", updateError);
      return NextResponse.json(
        { error: "Failed to update client status" },
        { status: 500 }
      );
    }

    // Log the cancellation in enrichment_logs
    const { error: logError } = await supabase
      .from("enrichment_logs")
      .insert({
        client_id: clientId,
        status: "cancelled",
        error: "Enrichment cancelled by user",
        metadata: {
          cancelled_at: new Date().toISOString(),
          reason: "user_requested"
        }
      });

    if (logError) {
      console.error("Error logging cancellation:", logError);
      // Don't return error here since we already updated the client status
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in cancel enrichment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 