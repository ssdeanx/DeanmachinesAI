/**
 * Research Agent Configuration
 *
 * This module defines the configuration for the Research Agent, which specializes in
 * gathering, synthesizing, and analyzing information from various sources.
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
 * Configuration for the Research Agent.
 *
 * @remarks
 * The Research Agent focuses on information gathering and synthesis
 * using web searches, document analysis, and file operations.
 *
 * @property {string[]} toolIds - The list of tool IDs required by the agent.
 */
export const researchAgentConfig: BaseAgentConfig = {
  id: "research-agent",
  name: "Research Agent",
  description:
    "Specialized in finding, gathering, and synthesizing information from various sources.",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a specialized research agent designed to find, gather, and synthesize information.

    // ...existing instructions...
  `,
  toolIds: ["readFileTool", "writeToFileTool", "webSearch", "documentAnalysis"],
};

/**
 * Schema for structured research agent responses
 */
export const researchResponseSchema = z.object({
  summary: z.string().describe("Concise summary of the research findings"),
  findings: z
    .array(
      z.object({
        topic: z.string().describe("Specific topic or area of research"),
        insights: z.string().describe("Key insights discovered"),
        confidence: z
          .number()
          .min(0)
          .max(1)
          .describe("Confidence level in this finding (0-1)"),
      })
    )
    .describe("Detailed findings from the research"),
  sources: z
    .array(
      z.object({
        title: z.string().describe("Source title"),
        url: z.string().optional().describe("Source URL if applicable"),
        type: z
          .string()
          .describe("Source type (article, paper, document, etc.)"),
        relevance: z
          .number()
          .min(0)
          .max(1)
          .optional()
          .describe("Relevance score (0-1)"),
      })
    )
    .describe("Sources used in the research"),
  gaps: z.array(z.string()).optional().describe("Identified information gaps"),
  recommendations: z
    .array(z.string())
    .optional()
    .describe("Recommendations based on findings"),
  nextSteps: z
    .array(z.string())
    .optional()
    .describe("Suggested next research steps"),
});

/**
 * Type for structured responses from the Research agent
 */
export type ResearchResponse = z.infer<typeof researchResponseSchema>;

export default researchAgentConfig;
export type ResearchAgentConfig = typeof researchAgentConfig;
