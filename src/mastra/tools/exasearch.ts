import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import {
  searchWeb,
  searchWithFilters,
  searchForRAG,
  type ExaSearchConfig,
  type ExaSearchResult,
} from "../services/exasearch";

// Export types for consumers
export type { ExaSearchConfig, ExaSearchResult };

/**
 * Exa search tool for web content retrieval
 */
export const exaSearchTool = createTool({
  id: "exa-search",
  description:
    "Performs web searches using Exa search API with various filtering options",
  inputSchema: z.object({
    query: z.string().describe("The search query to execute"),
    numResults: z.number().optional().default(5),
    filters: z
      .object({
        site: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        recentOnly: z.boolean().optional(),
      })
      .optional(),
    useRAG: z.boolean().optional().default(false),
  }),
  outputSchema: z.object({
    results: z.string().describe("Formatted search results"),
    error: z.string().optional().describe("Error message if search failed"),
  }),
  execute: async ({ context }) => {
    try {
      if (context.useRAG) {
        const results = await searchForRAG(context.query, {
          numResults: context.numResults,
          useHighlights: true,
        });
        return { results };
      }

      if (context.filters) {
        const results = await searchWithFilters(
          context.query,
          context.filters,
          {
            numResults: context.numResults,
          }
        );
        return { results: JSON.stringify(results, null, 2) };
      }

      const results = await searchWeb(context.query, {
        numResults: context.numResults,
      });
      return { results: JSON.stringify(results, null, 2) };
    } catch (error) {
      return {
        results: "",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during search",
      };
    }
  },
});

// Default export for easier importing
export default exaSearchTool;
