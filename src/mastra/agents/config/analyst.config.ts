/**
 * Analyst Agent Configuration
 *
 * This module defines the specific configuration for the Analyst Agent,
 * which specializes in interpreting data, identifying patterns,
 * and extracting meaningful insights.
 */

import { z, type ZodTypeAny } from "zod";
import type { Tool } from "@mastra/core/tools";
import {
  BaseAgentConfig,
  DEFAULT_MODELS,
  defaultResponseValidation,
} from "./config.types";

/**
 * Configuration for retrieving relevant tools for the agent
 *
 * @param toolIds - Array of tool identifiers to include
 * @param allTools - Map of all available tools
 * @returns Record of tools mapped by their IDs
 * @throws {Error} When required tools are missing
 */
export function getToolsFromIds(
  toolIds: string[],
  allTools: ReadonlyMap<
    string,
    Tool<ZodTypeAny | undefined, ZodTypeAny | undefined>
  >
): Record<string, Tool<ZodTypeAny | undefined, ZodTypeAny | undefined>> {
  const tools: Record<
    string,
    Tool<ZodTypeAny | undefined, ZodTypeAny | undefined>
  > = {};
  const missingTools: string[] = [];

  for (const id of toolIds) {
    const tool = allTools.get(id);
    if (tool) {
      tools[id] = tool;
    } else {
      missingTools.push(id);
    }
  }

  if (missingTools.length > 0) {
    throw new Error(`Missing required tools: ${missingTools.join(", ")}`);
  }

  return tools;
}

/**
 * Configuration for the Analyst Agent
 *
 * @remarks
 * The Analyst Agent focuses on analyzing information, identifying trends and patterns,
 * and extracting meaningful insights from various data sources.
 */
export const analystAgentConfig: BaseAgentConfig = {
  id: "analyst-agent",
  name: "Analyst Agent",
  description:
    "Specialized in interpreting data, identifying patterns, and extracting meaningful insights from information.",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a specialized analyst agent designed to interpret data, identify patterns, and extract meaningful insights.

    Your primary functions:
    1. Analyze information to identify trends, patterns, and correlations
    2. Evaluate the significance and implications of findings
    3. Develop data-driven recommendations
    4. Assess risks and opportunities

    Guidelines for your work:
    - Consider multiple perspectives when analyzing information
    - Clearly distinguish between observation and interpretation
    - Quantify uncertainty and confidence levels when possible
    - Identify limitations in the available data
    - Avoid confirmation bias by considering alternative explanations

    You can use file operations to read data files and write analysis results.
    You have access to reinforcement learning feedback tools to improve your analysis over time.

    You have memory capabilities and can recall previous analyses and conversations.
    When returning to a topic, reference previous insights and build upon them.

    You can perform web searches using exaSearchTool to gather market data, trends, and statistics.
    Use search filters to ensure data recency and relevance.
  `,
  toolIds: [
    "analyze-content",
    "search-documents",
    "read-file",
    "write-file",
    "analyze-feedback",
    "exa-search",
  ],
};

/**
 * Schema for structured analyst responses
 */
export const analystResponseSchema = z.object({
  analysis: z.string().describe("Primary analysis of the data or information"),
  findings: z
    .array(
      z.object({
        insight: z
          .string()
          .describe("A specific insight or pattern identified"),
        confidence: z
          .number()
          .min(0)
          .max(1)
          .describe("Confidence level in this finding (0-1)"),
        evidence: z
          .string()
          .describe("Supporting evidence or data for this insight"),
      })
    )
    .describe("List of specific insights and patterns identified"),
  limitations: z
    .string()
    .optional()
    .describe("Limitations of the analysis or data"),
  recommendations: z
    .array(z.string())
    .optional()
    .describe("Recommended actions based on the analysis"),
  visualizationSuggestions: z
    .array(z.string())
    .optional()
    .describe("Suggestions for data visualization"),
});

/**
 * Type for structured responses from the Analyst agent
 */
export type AnalystResponse = z.infer<typeof analystResponseSchema>;

export default analystAgentConfig;
export type AnalystAgentConfig = typeof analystAgentConfig;
