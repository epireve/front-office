import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { TavilySearchTool } from "@/lib/tools/search";
import { JinaReaderTool } from "@/lib/tools/reader";

interface EnrichmentState {
  clientId: string;
  name: string;
  website: string;
  industry: string;
  websiteContent?: string;
  searchResults?: any[];
  enrichedData?: Record<string, any>;
  error?: string;
}

export async function POST(request: NextRequest) {
  let requestBody: { clientId: string } | null = null;
  
  try {
    const body = await request.json();
    const { clientId, name, website, industry, forceUpdate } = body;
    requestBody = { clientId }; // Store for error handling

    console.log("Received enrichment request:", {
      clientId,
      name,
      website,
      industry,
      forceUpdate,
    });

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check if enrichment is already in progress unless force update
    if (!forceUpdate) {
      const { data: client } = await supabase
        .from("clients")
        .select("status")
        .eq("id", clientId)
        .single();

      if (client?.status === "pending_enrichment") {
        console.log("Enrichment already in progress for client:", clientId);
        return NextResponse.json(
          { error: "Enrichment already in progress" },
          { status: 400 }
        );
      }
    }

    // Create new enrichment log
    const { error: logError } = await supabase.from("enrichment_logs").insert({
      client_id: clientId,
      status: "pending",
      metadata: {
        started_at: new Date().toISOString(),
        force_update: forceUpdate,
      },
    });

    if (logError) {
      console.error("Error creating enrichment log:", logError);
    }

    // Initialize tools
    console.log("Initializing enrichment tools...");
    const reader = new JinaReaderTool({
      name: "jina-reader",
      description: "Converts any URL to LLM-friendly content",
      withGeneratedAlt: true,
      timeout: 30000,
      cacheControl: {
        noCache: true,
      },
    });

    const searcher = new TavilySearchTool({
      maxResults: 5,
      searchDepth: "advanced",
      includeRawContent: true,
      includeImages: false,
    });

    // Initialize LLM
    const llm = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0,
    });

    // Create enrichment chain
    const enrichmentChain = RunnableSequence.from([
      // Step 1: Scrape website
      async (state: EnrichmentState) => {
        console.log("Starting website scraping for:", state.website);
        try {
          const content = await reader.call(state.website);
          console.log("Website scraping completed successfully");
          return {
            ...state,
            websiteContent: content,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("Website scraping failed:", errorMessage);
          throw new Error(`Failed to scrape website: ${errorMessage}`);
        }
      },
      // Step 2: Search for company info
      async (state: EnrichmentState) => {
        console.log("Starting company search for:", state.name);
        try {
          const results = await searcher.call(
            `${state.name} company information revenue employees founded headquarters`
          );
          console.log("Company search completed successfully");
          return {
            ...state,
            searchResults: results,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("Company search failed:", errorMessage);
          throw new Error(`Failed to search company: ${errorMessage}`);
        }
      },
      // Step 3: Analyze data
      async (state: EnrichmentState) => {
        console.log("Starting data analysis for:", state.name);
        try {
          const prompt = ChatPromptTemplate.fromTemplate(`You are an expert business analyst. Analyze the following information and extract key details.

Company Name: {name}

Website Content:
{websiteContent}

Search Results:
{searchResults}

Return a JSON object with ONLY the following fields. Use "unknown" for any values that cannot be determined:

employeeCount: number or range
revenue: annual revenue or range
founded: year
description: brief company description
socialMedia: object with linkedin and twitter URLs
technologies: array of technology names
competitors: array of competitor names
locations: array of office locations

Important: Return ONLY the JSON object with no additional text, markdown, or explanation.`);

          const chain = prompt.pipe(llm);
          const response = await chain.invoke({
            name: state.name,
            websiteContent: state.websiteContent || "",
            searchResults: JSON.stringify(state.searchResults || []),
          });

          let enrichedData;
          if (typeof response.content === 'string') {
            // Remove any markdown formatting if present
            const jsonStr = response.content.replace(/```json\s*|\s*```/g, '').trim();
            enrichedData = JSON.parse(jsonStr);
          } else if (Array.isArray(response.content)) {
            const jsonContent = response.content
              .map(msg => {
                if (typeof msg === 'object' && 'type' in msg && msg.type === 'text') {
                  // Clean the text content
                  return msg.text.replace(/```json\s*|\s*```/g, '').trim();
                }
                return null;
              })
              .filter(Boolean)[0];
            if (!jsonContent) throw new Error("Could not find valid JSON response");
            enrichedData = JSON.parse(jsonContent);
          } else {
            throw new Error("Unexpected response format from LLM");
          }
            
          console.log("Data analysis completed successfully");

          return {
            ...state,
            enrichedData,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("Data analysis failed:", errorMessage);
          throw new Error(`Failed to analyze data: ${errorMessage}`);
        }
      },
    ]);

    // Run enrichment chain
    console.log("Starting enrichment chain...");
    const finalState = await enrichmentChain.invoke({
      clientId,
      name,
      website,
      industry,
    });

    console.log("Enrichment chain completed successfully");

    // Update client with enriched data
    const { error: updateError } = await supabase
      .from("clients")
      .update({
        status: "enriched",
        enriched_data: finalState.enrichedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);

    if (updateError) {
      console.error("Failed to update client:", updateError);
      return NextResponse.json(
        { error: "Failed to update client with enriched data" },
        { status: 500 }
      );
    }

    // Update enrichment log
    await supabase
      .from("enrichment_logs")
      .update({
        status: "completed",
        metadata: {
          completed_at: new Date().toISOString(),
          enriched_data: finalState.enrichedData,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("client_id", clientId);

    console.log("Enrichment completed successfully");
    return NextResponse.json({ 
      success: true,
      enriched_data: finalState.enrichedData 
    });
  } catch (error) {
    console.error("Enrichment process failed:", error);

    if (requestBody?.clientId) {
      // Update client status to failed
      const cookieStore = cookies();
      const supabase = createClient(cookieStore);
      
      await supabase
        .from("clients")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestBody.clientId);

      // Update enrichment log
      await supabase
        .from("enrichment_logs")
        .update({
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          updated_at: new Date().toISOString(),
        })
        .eq("client_id", requestBody.clientId);
    }

    return NextResponse.json(
      { error: "Failed to enrich client data" },
      { status: 500 }
    );
  }
} 