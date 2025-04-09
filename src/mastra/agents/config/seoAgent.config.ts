/**
 * SEO Agent Configuration
 *
 * This module defines the configuration for the SEO Agent,
 * which specializes in search engine optimization strategies and implementation.
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
 * SEO Agent Configuration
 *
 * @remarks
 * The SEO Agent focuses on optimizing content for search engines,
 * analyzing keywords, and improving website visibility and rankings.
 */
export const seoAgentConfig: BaseAgentConfig = {
  id: "seo-agent",
  name: "SEO Agent",
  description:
    "Specializes in search engine optimization strategies and implementation",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are an SEO Agent specializing in optimizing content for search engines and improving website visibility.

    Your responsibilities include:
    1. Conducting keyword research and analysis
    2. Optimizing page content and meta information
    3. Analyzing search performance and rankings
    4. Recommending on-page and technical SEO improvements
    5. Creating SEO-friendly content strategies

    When optimizing for search:
    - Research relevant keywords with appropriate search volume and competition
    - Ensure content follows on-page SEO best practices
    - Analyze competitor rankings and strategies
    - Recommend technical improvements for crawling and indexing
    - Track and report on SEO performance metrics

    Collaborate with other marketing team members to ensure content is both engaging and optimized for search.
  `,
  toolIds: [
    "read-file",
    "write-file",
    "memory-query",
    "brave",
    "google",
    "tavily",
    "exa",
    "format-content",
    "analyze-content",
    "search-documents",
    "calculate-reward", // For analyzing SEO metrics
  ],
};

/**
 * Schema for structured SEO agent responses
 */
export const seoResponseSchema = z.object({
  analysis: z.string().describe("Overall SEO analysis and summary"),
  keywords: z
    .array(
      z.object({
        keyword: z.string().describe("Target keyword or phrase"),
        volume: z
          .number()
          .optional()
          .describe("Estimated monthly search volume"),
        difficulty: z
          .number()
          .min(0)
          .max(100)
          .optional()
          .describe("Difficulty score (0-100)"),
        relevance: z
          .number()
          .min(0)
          .max(1)
          .describe("Relevance to the content (0-1)"),
        recommendations: z
          .array(z.string())
          .describe("Recommendations for this keyword"),
      })
    )
    .describe("Keyword analysis and recommendations"),
  onPageOptimizations: z
    .array(
      z.object({
        element: z
          .string()
          .describe("Page element to optimize (title, meta, headings, etc.)"),
        currentState: z
          .string()
          .optional()
          .describe("Current state of the element"),
        recommendation: z.string().describe("Recommended optimization"),
        priority: z
          .enum(["high", "medium", "low"])
          .describe("Implementation priority"),
      })
    )
    .describe("On-page optimization recommendations"),
  technicalIssues: z
    .array(
      z.object({
        issue: z.string().describe("Technical SEO issue identified"),
        impact: z.string().describe("Potential impact on rankings"),
        solution: z.string().describe("Recommended solution"),
      })
    )
    .optional()
    .describe("Technical SEO issues and solutions"),
  contentStrategy: z
    .object({
      topicClusters: z
        .array(z.string())
        .optional()
        .describe("Recommended topic clusters"),
      contentGaps: z
        .array(z.string())
        .optional()
        .describe("Identified content gaps"),
      suggestions: z
        .array(z.string())
        .describe("Content optimization suggestions"),
    })
    .optional()
    .describe("Content strategy recommendations"),
  competitorInsights: z
    .array(
      z.object({
        competitor: z.string().describe("Competitor name/URL"),
        strengths: z.array(z.string()).describe("SEO strengths"),
        opportunities: z.array(z.string()).describe("Opportunities to outrank"),
      })
    )
    .optional()
    .describe("Competitor SEO insights"),
});

/**
 * Type for structured responses from the SEO agent
 */
export type SeoResponse = z.infer<typeof seoResponseSchema>;

export default seoAgentConfig;
export type SeoAgentConfig = typeof seoAgentConfig;
