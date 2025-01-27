'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
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
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting client:', insertError);
      throw insertError;
    }

    console.log('Client created successfully:', client);

    // Start enrichment process
    const { error: enrichmentError } = await supabase
      .from('enrichment_logs')
      .insert({
        client_id: client.id,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    if (enrichmentError) {
      console.error('Error creating enrichment log:', enrichmentError);
      throw enrichmentError;
    }

    console.log('Enrichment log created successfully');

    // Trigger enrichment process
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('Triggering enrichment at:', `${appUrl}/api/enrich`);
    
    const enrichmentResponse = await fetch(`${appUrl}/api/enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: client.id,
        name: client.name,
        website: client.website,
        industry: client.industry,
      }),
    });

    if (!enrichmentResponse.ok) {
      console.error('Enrichment API error:', await enrichmentResponse.text());
      throw new Error('Failed to trigger enrichment process');
    }

    console.log('Enrichment process triggered successfully');

    revalidatePath('/clients');
    return { success: true, client };
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
      throw error;
    }

    return { success: true, clients };
  } catch (error) {
    console.error('Error fetching clients:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
} 