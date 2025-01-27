import { BaseMessage } from "langchain/schema";

export interface ClientInput {
  id: string;
  name: string;
  website: string;
  industry: string;
}

export interface EnrichedData {
  employeeCount?: string;
  revenue?: string;
  founded?: string;
  description?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
  };
  competitors?: string[];
  technologies?: string[];
  locations?: string[];
}

export interface EnrichmentState {
  client: ClientInput;
  enrichedData: Partial<EnrichedData>;
  scrapedContent?: string;
  currentStep: "INIT" | "SCRAPING" | "ANALYZING" | "ENRICHING" | "DONE" | "ERROR";
  error?: string;
  messages: BaseMessage[];
}

export interface EnrichmentConfig {
  maxRetries: number;
  scrapingTimeout: number;
  enrichmentTimeout: number;
}

export type EnrichmentAction = 
  | { type: "SCRAPE_WEBSITE" }
  | { type: "ANALYZE_CONTENT" }
  | { type: "ENRICH_DATA" }
  | { type: "ERROR"; error: string }
  | { type: "DONE" }; 