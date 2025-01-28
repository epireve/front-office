import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
import { SerperSearchTool, TavilySearchTool } from "@/lib/tools/search";

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const SYSTEM_TEMPLATE = `You are an expert business analyst and researcher. Your primary research tool is Tavily, which provides comprehensive and in-depth analysis. Use it as your default choice.

For basic fact-checking or simple queries, you can fall back to the google-search tool.

Guidelines for tool selection:
- Use tavily-search for:
  * Company research and analysis
  * Complex topics requiring deep understanding
  * When you need comprehensive results
  * When accuracy and depth are crucial

- Only use google-search for:
  * Quick fact verification
  * Simple, straightforward queries
  * When you need just basic information

Current conversation:
{chat_history}

User: {input}
Assistant: I'll help you with that using the most appropriate search tool.`;

/**
 * This handler initializes and calls an agent equipped with search tools.
 * It can perform both basic and advanced searches using Serper and Tavily.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    // Initialize search tools - Tavily first as the preferred tool
    const tools = [
      new TavilySearchTool({
        name: "tavily-search",
        description: "Primary research tool for comprehensive analysis. Use this by default, especially for company research, complex topics, or when you need detailed information. Input should be a search query.",
        searchDepth: "advanced",
        maxResults: 8,
        includeRawContent: true,
        includeImages: false,
      }),
      new SerperSearchTool({
        name: "google-search",
        description: "Basic search tool for quick fact-checking and simple queries. Only use this for straightforward lookups when Tavily would be overkill. Input should be a search query.",
      }),
    ];

    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4o-mini",
    });

    // Create a system prompt
    const systemPrompt = ChatPromptTemplate.fromTemplate(SYSTEM_TEMPLATE);

    // Create an agent with the tools
    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      tools,
      prompt: systemPrompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      maxIterations: 3,
    });

    // Stream the agent's response
    const stream = await agentExecutor.streamLog({
      input: currentMessageContent,
      chat_history: formattedPreviousMessages.join("\n"),
    });

    // Convert the stream to bytes
    const textEncoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
            const addOp = chunk.ops[0];
            if (
              addOp.path.startsWith("/logs/ChatOpenAI") &&
              typeof addOp.value === "string" &&
              addOp.value.length > 0
            ) {
              controller.enqueue(textEncoder.encode(addOp.value));
            }
          }
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(readableStream);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
