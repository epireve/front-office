import { DynamicTool, DynamicToolInput } from "@langchain/core/tools";

interface JinaReaderOptions {
  withGeneratedAlt?: boolean;  // Enable image caption feature
  timeout?: number;            // Wait for network idle until timeout
  streaming?: boolean;         // Use streaming mode for more complete results
  cacheControl?: {
    noCache?: boolean;        // Bypass cache
    tolerance?: number;       // Cache tolerance in seconds
  };
}

export class JinaReaderTool extends DynamicTool {
  constructor(options: Partial<DynamicToolInput & JinaReaderOptions> = {}) {
    super({
      name: "jina-reader",
      description: "Converts any URL to LLM-friendly content. Input should be a URL to read.",
      func: async (input: string) => {
        return await readUrl(input, options);
      },
      ...options,
    });
  }
}

export async function readUrl(url: string, options: JinaReaderOptions = {}) {
  try {
    const headers: Record<string, string> = {
      "Accept": options.streaming ? "text/event-stream" : "text/plain",
    };

    if (options.withGeneratedAlt) {
      headers["X-With-Generated-Alt"] = "true";
    }

    if (options.timeout) {
      headers["x-timeout"] = options.timeout.toString();
    }

    if (options.cacheControl?.noCache) {
      headers["x-no-cache"] = "true";
    }

    if (options.cacheControl?.tolerance) {
      headers["x-cache-tolerance"] = options.cacheControl.tolerance.toString();
    }

    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    const response = await fetch(jinaUrl, { headers });

    if (!response.ok) {
      throw new Error(`Jina Reader API error: ${response.statusText}`);
    }

    // If streaming is enabled, we need to collect all chunks
    if (options.streaming) {
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let content = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Convert the chunk to text and append
        content += new TextDecoder().decode(value);
      }
      return content;
    }

    return await response.text();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to read URL with Jina: ${error.message}`);
    }
    throw new Error("Failed to read URL with Jina: Unknown error");
  }
} 