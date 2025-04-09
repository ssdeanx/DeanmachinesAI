/**
 * Market Research Agent Configuration
 *
 * This module defines the configuration for the Market Research Agent,
 * which specializes in analyzing markets, competitors, and user needs.
 */

import { z, type ZodTypeAny } from "zod";
import type { Tool } from "@mastra/core/tools";
import {
  BaseAgentConfig,
  DEFAULT_MODELS,
  defaultResponseValidation
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
  allTools: ReadonlyMap<string, Tool<ZodTypeAny | undefined, ZodTypeAny | undefined>>
): Record<string, Tool<ZodTypeAny | undefined, ZodTypeAny | undefined>> {
  const tools: Record<string, Tool<ZodTypeAny | undefined, ZodTypeAny | undefined>> = {};
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
 * Market Research Agent Configuration
 *
 * @remarks
 * The Market Research Agent focuses on gathering and analyzing market data,
 * competitive intelligence, and user feedback to inform product and marketing strategies.
 */
export const marketResearchAgentConfig: BaseAgentConfig = {
  id: "market-research-agent",
  name: "Market Research Agent",  description: "Specializes in analyzing markets, competitors, and user needs",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a Market Research Agent specializing in gathering and analyzing market data to inform product and marketing strategies.

    Your responsibilities include:
    1. Analyzing market trends and identifying opportunities
    2. Conducting competitive analysis and benchmarking
    3. Synthesizing user feedback and identifying key insights
    4. Identifying target audience segments and their needs
    5. Generating actionable recommendations based on research

    When conducting research:
    - Use data-driven approaches to identify patterns and insights
    - Consider multiple market segments and user personas
    - Analyze both quantitative metrics and qualitative feedback
    - Present findings with clear visualizations and summaries
    - Provide actionable recommendations tied to business goals

    Collaborate with other marketing team members to ensure research insights inform marketing strategies and content.
  `,  toolIds: [
    "read-file",
    "write-file",
    "memory-query",
    "brave", // Correct ID for Brave search
    "google", // Correct ID for Google search
    "tavily", // Correct ID for Tavily search
    "exa", // Correct ID for Exa search
    "analyze-content",
    "search-documents",
    "embed-document",
    "calculate-reward", // For analyzing metrics
  ],
};

/**
 * Schema for structured market research agent responses
 */
export const marketResearchResponseSchema = z.object({
  analysis: z.string().describe("Analysis of market data and insights"),
  marketTrends: z.array(
    z.object({
      trend: z.string().describe("Identified market trend"),
      impact: z.string().describe("Potential impact on business"),
      confidence: z.number().min(0).max(1).describe("Confidence level in this trend (0-1)")
    })
  ).describe("Key market trends identified"),
  competitorAnalysis: z.array(
    z.object({
      competitor: z.string().describe("Competitor name"),
      strengths: z.array(z.string()).describe("Competitor's strengths"),
      weaknesses: z.array(z.string()).describe("Competitor's weaknesses"),
      marketShare: z.number().optional().describe("Estimated market share percentage")
    })
  ).optional().describe("Analysis of key competitors"),
  targetAudience: z.array(
    z.object({
      segment: z.string().describe("Audience segment name"),
      demographics: z.string().describe("Key demographic characteristics"),
      needs: z.array(z.string()).describe("Primary needs and pain points"),
      opportunities: z.array(z.string()).describe("Business opportunities with this segment")
    })
  ).optional().describe("Target audience segments identified"),
  recommendations: z.array(
    z.object({
      recommendation: z.string().describe("Strategic recommendation"),
      rationale: z.string().describe("Data-backed rationale"),
      priority: z.enum(["high", "medium", "low"]).describe("Priority level")
    })
  ).describe("Strategic recommendations based on research"),
  sources: z.array(
    z.object({
      title: z.string().describe("Source title"),
      url: z.string().optional().describe("Source URL"),
      relevance: z.string().optional().describe("Relevance to findings")
    })
  ).optional().describe("Research sources")
});

/**
 * Type for structured responses from the Market Research agent
 */
export type MarketResearchResponse = z.infer<typeof marketResearchResponseSchema>;

export default marketResearchAgentConfig;
export type MarketResearchAgentConfig = typeof marketResearchAgentConfig;
