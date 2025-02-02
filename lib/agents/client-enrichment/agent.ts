import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";

import {
  ClientInput,
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
  streaming: true,
  withGeneratedAlt: true,
  timeout: 30000,
  cacheControl: {
    tolerance: 3600,
  },
});

const searcher = new SerperSearchTool();
const newsSearcher = new SerperNewsSearchTool();
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

interface EnrichmentContext {
  client: ClientInput;
  scrapedContent?: string;
  searchResults?: string;
  newsResults?: string;
  tavilyResults?: string;
  analysisResults?: string;
  enrichedData?: EnrichedData;
}

// Create the enrichment chain
export async function enrichClientData(client: ClientInput): Promise<EnrichedData> {
  try {
    // Initialize cancellation token
    setCancellationToken(client.id, false);

    const enrichmentChain = RunnableSequence.from([
      // Initialize context
      new RunnablePassthrough(),
      
      // Step 1: Scrape website
      {
        scrapedContent: async (context: EnrichmentContext) => {
          checkCancellation(context.client.id);
          return reader.call({ input: context.client.website });
        },
        client: (context: EnrichmentContext) => context.client,
      },

      // Step 2: Basic search
      {
        searchResults: async (context: EnrichmentContext) => {
          checkCancellation(context.client.id);
          const searchQuery = `${context.client.name} company information revenue employees founded`;
          return searcher.call({ input: searchQuery });
        },
        scrapedContent: (context: EnrichmentContext) => context.scrapedContent,
        client: (context: EnrichmentContext) => context.client,
      },

      // Step 3: News search
      {
        newsResults: async (context: EnrichmentContext) => {
          checkCancellation(context.client.id);
          const newsQuery = `${context.client.name} company news last year`;
          return newsSearcher.call({ input: newsQuery });
        },
        searchResults: (context: EnrichmentContext) => context.searchResults,
        scrapedContent: (context: EnrichmentContext) => context.scrapedContent,
        client: (context: EnrichmentContext) => context.client,
      },

      // Step 4: Deep analysis
      {
        tavilyResults: async (context: EnrichmentContext) => {
          checkCancellation(context.client.id);
          const tavilyQuery = `${context.client.name} company detailed analysis competitors technologies industry market position`;
          return tavilySearcher.call({ input: tavilyQuery });
        },
        newsResults: (context: EnrichmentContext) => context.newsResults,
        searchResults: (context: EnrichmentContext) => context.searchResults,
        scrapedContent: (context: EnrichmentContext) => context.scrapedContent,
        client: (context: EnrichmentContext) => context.client,
      },

      // Step 5: Analyze content
      {
        analysisResults: async (context: EnrichmentContext) => {
          checkCancellation(context.client.id);
          const response = await model.invoke([
            new SystemMessage(
              `You are an expert business analyst. Analyze the following website content, search results, news, and deep analysis to extract key information about the company.
               Focus on: employee count, revenue, founding year, company description, social media links, competitors, technologies used, and office locations.
               Format the information in a clear, structured way.
               
               Website content (including image descriptions):
               ${context.scrapedContent}
               
               Basic search results:
               ${context.searchResults}
               
               Recent news:
               ${context.newsResults}
               
               Deep analysis:
               ${context.tavilyResults}`
            ),
            new HumanMessage("Please analyze the company information from all sources, prioritizing the most reliable and recent data."),
          ]);
          return response.text;
        },
        tavilyResults: (context: EnrichmentContext) => context.tavilyResults,
        newsResults: (context: EnrichmentContext) => context.newsResults,
        searchResults: (context: EnrichmentContext) => context.searchResults,
        scrapedContent: (context: EnrichmentContext) => context.scrapedContent,
        client: (context: EnrichmentContext) => context.client,
      },

      // Step 6: Structure data
      {
        enrichedData: async (context: EnrichmentContext) => {
          checkCancellation(context.client.id);
          const response = await model.invoke([
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
            new HumanMessage(context.analysisResults || ""),
          ]);
          return JSON.parse(response.text) as EnrichedData;
        },
        analysisResults: (context: EnrichmentContext) => context.analysisResults,
        client: (context: EnrichmentContext) => context.client,
      },
    ]);

    // Run the enrichment chain
    const result = await enrichmentChain.invoke({ client });

    // Clear cancellation token
    clearCancellationToken(client.id);

    if (!result.enrichedData) {
      throw new Error("Failed to enrich client data");
    }

    return result.enrichedData;
  } catch (error) {
    // Clear cancellation token on error
    clearCancellationToken(client.id);
    console.error("Client enrichment failed:", error);
    throw error;
  }
}
