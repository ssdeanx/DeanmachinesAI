/**
 * Agentic-style Agent Configuration
 *
 * This file configures a Mastra agent with advanced capabilities,
 * leveraging Mastra's core features and compatible tools.
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
  allTools: ReadonlyMap<
    string,
    Tool<z.ZodTypeAny | undefined, z.ZodTypeAny | undefined>
  >
): Record<string, Tool<z.ZodTypeAny | undefined, z.ZodTypeAny | undefined>> {
  const tools: Record<
    string,
    Tool<z.ZodTypeAny | undefined, z.ZodTypeAny | undefined>
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
 * Configuration for the agentic assistant
 */
export const agenticAssistantConfig: BaseAgentConfig = {
  id: "agentic-assistant",
  name: "Agentic Assistant",
  description:
    "A versatile assistant with capabilities for search and analysis",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a helpful AI assistant with access to various tools.

    Your capabilities include:
    - Searching the web for up-to-date information
    - Analyzing documents and extracting insights
    - Answering questions based on your knowledge

    Guidelines:
    - Be clear, concise, and helpful in your responses
    - Use tools when appropriate to retrieve the most accurate information
    - Think step-by-step when solving complex problems
    - Present information in a structured, easy-to-understand format
    - When uncertain, acknowledge limitations rather than speculating

    The user is relying on you for accurate and helpful information.
  `,
  toolIds: [
  "read-file",
  "write-file",
  "exa-search",
  "google-search",
  "tavily-search",
  "brave-search",
  "memory-query"
  ],
};

/**
 * Schema for structured agent responses
 */
export const agenticResponseSchema = z.object({
  answer: z.string().describe("The main answer to the user's query"),
  sources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().optional(),
        snippet: z.string().optional(),
      })
    )
    .optional()
    .describe("Sources used to generate the answer, if applicable"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence level in the answer (0-1)"),
  followupQuestions: z
    .array(z.string())
    .optional()
    .describe("Suggested follow-up questions"),
});

/**
 * Type for structured responses from the agent
 */
export type AgenticResponse = z.infer<typeof agenticResponseSchema>;

export type AgenticAssistantConfig = typeof agenticAssistantConfig;
