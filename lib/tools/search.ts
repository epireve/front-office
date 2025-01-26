import { DynamicTool, DynamicToolInput } from "@langchain/core/tools";
import { tavily } from "@tavily/core";

interface SerperSearchOptions {
  num?: number;
  page?: number;
  type?: "search" | "news" | "places" | "images" | "shopping";
  gl?: string; // Country code for Google search
  hl?: string; // Language code for Google search
}

interface TavilySearchOptions {
  searchDepth?: "basic" | "advanced";
  maxResults?: number;
  includeRawContent?: boolean;
  includeImages?: boolean;
  filterDomain?: string;
  excludeDomain?: string;
}

// Initialize Tavily client
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY || "" });

export class TavilySearchTool extends DynamicTool {
  constructor(options: Partial<DynamicToolInput & TavilySearchOptions> = {}) {
    super({
      name: "tavily-search",
      description: "Primary research tool for comprehensive analysis. Use this by default for detailed information, company research, or complex topics. Input should be a search query.",
      func: async (input: string) => {
        try {
          // Use searchContext for RAG-optimized results
          const result = await tvly.searchContext(input, {
            searchDepth: options.searchDepth || "advanced",
            maxResults: options.maxResults || 8,
            includeRawContent: options.includeRawContent ?? true,
            includeImages: options.includeImages ?? false,
          });

          // Format the response as markdown
          const formattedResult = this.formatAsMarkdown(result);
          return formattedResult;
        } catch (error: any) {
          throw new Error(`Tavily search failed: ${error.message}`);
        }
      },
      ...options,
    });
  }

  private formatAsMarkdown(result: any): string {
    try {
      // Extract relevant information from the result
      const { text, context } = result;

      // Format the main content
      let markdown = text ? `${text}\n\n` : "";

      // Add context if available
      if (context && Array.isArray(context)) {
        context.forEach((item: any, index: number) => {
          if (item.content) {
            markdown += `### Source ${index + 1}\n${item.content}\n\n`;
          }
        });
      }

      return markdown.trim();
    } catch (error) {
      console.error("Error formatting markdown:", error);
      return JSON.stringify(result);
    }
  }
}

export class SerperSearchTool extends DynamicTool {
  constructor(options: Partial<DynamicToolInput> = {}) {
    super({
      name: "google-search",
      description: "Basic search tool for quick fact-checking and simple queries. Only use this for straightforward lookups when Tavily would be overkill. Input should be a search query.",
      func: async (input: string) => {
        return await searchGoogle(input);
      },
      ...options,
    });
  }
}

export async function searchGoogle(query: string, options: SerperSearchOptions = {}) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: options.num || 5,
        page: options.page,
        type: options.type,
        gl: options.gl,
        hl: options.hl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.stringify(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to search with Serper: ${error.message}`);
    }
    throw new Error("Failed to search with Serper: Unknown error");
  }
}

// Additional specialized search tools
export class SerperNewsSearchTool extends SerperSearchTool {
  constructor(options: Partial<DynamicToolInput> = {}) {
    super({
      name: "google-news-search",
      description: "Search Google News for recent news articles using Serper API. Input should be a news search query.",
      func: async (input: string) => {
        return await searchGoogle(input, { type: "news" });
      },
      ...options,
    });
  }
}

export class SerperPlacesSearchTool extends SerperSearchTool {
  constructor(options: Partial<DynamicToolInput> = {}) {
    super({
      name: "google-places-search",
      description: "Search Google Places for location information using Serper API. Input should be a place or business name.",
      func: async (input: string) => {
        return await searchGoogle(input, { type: "places" });
      },
      ...options,
    });
  }
}

export class SerperImagesSearchTool extends SerperSearchTool {
  constructor(options: Partial<DynamicToolInput> = {}) {
    super({
      name: "google-images-search",
      description: "Search Google Images using Serper API. Input should be an image search query.",
      func: async (input: string) => {
        return await searchGoogle(input, { type: "images" });
      },
      ...options,
    });
  }
} 