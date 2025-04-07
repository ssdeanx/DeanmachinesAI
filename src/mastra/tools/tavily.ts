import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { TavilyClient } from "@agentic/tavily";
import { env } from "process";

/**
 * Configuration for Tavily search
 */
interface TavilyConfig {
  apiKey?: string;
}

/**
 * Creates a configured Tavily search tool
 */
export function createTavilySearchTool(config: TavilyConfig = {}) {
  const tavily = new TavilyClient({
    apiKey: config.apiKey ?? env.TAVILY_API_KEY,
  });

  return createTool({
    id: "tavily-search",
    description: "Performs web searches using Tavily API",
    inputSchema: z.object({
      query: z.string().describe("Search query"),
    }),
    outputSchema: z.object({
      results: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          content: z.string(),
        })
      ),
    }),
    execute: async ({ context }) => {
      try {
        const response = await tavily.search(context.query);
        return { results: response.results };
      } catch (error) {
        throw new Error(
          `Tavily search failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    },
  });
}
