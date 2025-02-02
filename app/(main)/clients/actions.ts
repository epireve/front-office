'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for client input validation
const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  website: z.string().url("Invalid website URL"),
  address: z.string().min(1, "Address is required"),
  industry: z.string().min(1, "Industry is required"),
  email: z.string().email("Invalid email").optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export async function createNewClient(data: ClientFormData) {
  console.log('Creating new client with data:', data);
  
  try {
    // Validate input
    const validatedData = clientSchema.parse(data);
    console.log('Data validation passed');

    // Get Supabase instance with cookies
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Insert new client
    const { data: client, error: insertError } = await supabase
      .from('clients')
      .insert({
        name: validatedData.name,
        website: validatedData.website,
        address: validatedData.address,
        industry: validatedData.industry,
        email: validatedData.email,
        status: 'pending_enrichment',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting client:', insertError);
      throw insertError;
    }

    console.log('Client created successfully:', client);

    // Get current request headers to maintain auth context
    const headersList = headers();
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const host = headersList.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Trigger enrichment process with absolute URL
    console.log('Triggering enrichment at:', `${baseUrl}/api/enrich`);
    
    const enrichmentResponse = await fetch(`${baseUrl}/api/enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieStore.toString(), // Forward auth cookies
      },
      body: JSON.stringify({
        clientId: client.id,
        name: client.name,
        website: client.website,
        industry: client.industry,
        isInitialEnrichment: true, // Flag to indicate this is a new client
      }),
    });

    if (!enrichmentResponse.ok) {
      const enrichmentResult = await enrichmentResponse.json();
      console.error('Enrichment API error:', enrichmentResult);
      throw new Error(enrichmentResult.error || 'Failed to trigger enrichment process');
    }

    console.log('Enrichment process triggered successfully');
    revalidatePath('/clients');
    
    return { 
      success: true, 
      client,
      message: 'Client created and enrichment process started'
    };

  } catch (error) {
    console.error('Error creating client:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error 
    };
  }
}

export async function getClients() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      return {
        success: false,
        clients: null,
        error: error.message
      };
    }

    return {
      success: true,
      clients,
      error: null
    };
  } catch (error) {
    console.error('Error fetching clients:', error);
    return {
      success: false,
      clients: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
