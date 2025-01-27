import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";
import { z } from "zod";

import {
  ClientInput,
  EnrichmentState,
  EnrichmentAction,
  EnrichedData,
} from "./types";
import { SerperSearchTool, SerperNewsSearchTool, TavilySearchTool } from "@/lib/tools/search";
import { JinaReaderTool } from "@/lib/tools/reader";

// Cancellation token store
const cancellationTokens = new Map<string, boolean>();

export function setCancellationToken(clientId: string, cancelled: boolean) {
  cancellationTokens.set(clientId, cancelled);
}

export function isCancelled(clientId: string): boolean {
  return cancellationTokens.get(clientId) || false;
}

export function clearCancellationToken(clientId: string) {
  cancellationTokens.delete(clientId);
}

// Agent setup
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
});

const reader = new JinaReaderTool({
  streaming: true,              // Get more complete results
  withGeneratedAlt: true,      // Include image captions
  timeout: 30000,              // 30 seconds timeout
  cacheControl: {
    tolerance: 3600,           // Cache for 1 hour
  },
});

// Basic search tools
const searcher = new SerperSearchTool();
const newsSearcher = new SerperNewsSearchTool();

// Advanced search tool
const tavilySearcher = new TavilySearchTool({
  searchDepth: "advanced",
  maxResults: 10,
  includeRawContent: true,
  includeImages: true,
});

// Helper function to check cancellation and throw if cancelled
function checkCancellation(clientId: string) {
  if (isCancelled(clientId)) {
    throw new Error("Enrichment process was cancelled");
  }
}

// Helper function to start the enrichment process
export async function enrichClientData(client: ClientInput): Promise<EnrichedData> {
  try {
    // Initialize cancellation token
    setCancellationToken(client.id, false);

    // Step 1: Read website content using Jina
    checkCancellation(client.id);
    const scrapedContent = await reader.call({ input: client.website });

    // Step 2: Basic company information search with Serper
    checkCancellation(client.id);
    const searchQuery = `${client.name} company information revenue employees founded`;
    const searchResults = await searcher.call({ input: searchQuery });

    // Step 3: Recent news search with Serper
    checkCancellation(client.id);
    const newsQuery = `${client.name} company news last year`;
    const newsResults = await newsSearcher.call({ input: newsQuery });

    // Step 4: Deep analysis with Tavily
    checkCancellation(client.id);
    const tavilyQuery = `${client.name} company detailed analysis competitors technologies industry market position`;
    const tavilyResults = await tavilySearcher.call({ input: tavilyQuery });

    // Step 5: Analyze all content
    checkCancellation(client.id);
    const analysisResponse = (await model.invoke([
      new SystemMessage(
        `You are an expert business analyst. Analyze the following website content, search results, news, and deep analysis to extract key information about the company.
         Focus on: employee count, revenue, founding year, company description, social media links, competitors, technologies used, and office locations.
         Format the information in a clear, structured way.
         
         Website content (including image descriptions):
         ${scrapedContent}
         
         Basic search results:
         ${searchResults}
         
         Recent news:
         ${newsResults}
         
         Deep analysis:
         ${tavilyResults}`
      ),
      new HumanMessage("Please analyze the company information from all sources, prioritizing the most reliable and recent data."),
    ])) as BaseMessage;

    // Step 6: Structure the data
    checkCancellation(client.id);
    const enrichmentResponse = (await model.invoke([
      new SystemMessage(
        `Based on the analysis, create a structured object with the following fields:
         - employeeCount: string (e.g., "100-500")
         - revenue: string (e.g., "$10M-$50M")
         - founded: string (year)
         - description: string (2-3 sentences)
         - socialMedia: object with linkedin and twitter URLs
         - competitors: array of competitor names
         - technologies: array of technology names
         - locations: array of office locations
         
         Return ONLY the JSON object, no other text.`
      ),
      new HumanMessage(analysisResponse.text),
    ])) as BaseMessage;

    // Parse the response into structured data
    const enrichedData = JSON.parse(enrichmentResponse.text) as EnrichedData;

    // Clear cancellation token
    clearCancellationToken(client.id);

    return enrichedData;
  } catch (error) {
    // Clear cancellation token on error
    clearCancellationToken(client.id);
    console.error("Client enrichment failed:", error);
    throw error;
  }
} 