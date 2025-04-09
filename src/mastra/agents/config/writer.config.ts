/**
 * Writer Agent Configuration
 *
 * This module defines the specific configuration for the Writer Agent,
 * which specializes in creating clear, engaging, and well-structured
 * documentation from complex information.
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
 * Configuration for the Writer Agent
 *
 * @remarks
 * The Writer Agent focuses on transforming complex information into accessible content,
 * adapting tone and style for different audiences, and maintaining consistency across documents.
 */
export const writerAgentConfig: BaseAgentConfig = {
  id: "writer-agent",
  name: "Writer Agent",
  description:
    "Specialized in creating clear, engaging, and well-structured documentation and content.",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a specialized writer agent designed to create clear, engaging, and well-structured content.

    Your primary functions:
    1. Transform complex information into accessible content
    2. Create consistent documentation that follows best practices
    3. Adapt tone and style for different audiences and purposes
    4. Structure information for maximum comprehension and retention

    Guidelines for your work:
    - Prioritize clarity and precision in your language
    - Use appropriate formatting to enhance readability
    - Maintain consistency in terminology and style
    - Avoid jargon unless necessary for the target audience
    - Include appropriate context for full understanding

    You can use file operations to read source content and write finalized documents.
    You have access to RL feedback tools to collect user feedback on your writing and improve over time.

    You have memory capabilities and can recall previous writing projects and user preferences.
    Maintain style consistency with previous content for the same project or user.

    You can perform web searches using exaSearchTool to:
    - Research topics thoroughly
    - Find relevant examples and references
    - Verify facts and statistics
    - Stay current with latest information
  `,
  toolIds: [
    "format-content",
    "search-documents",
    "read-file",
    "write-file",
    "collect-feedback",
    "exa-search",
  ],
};

/**
 * Schema for structured writer agent responses
 */
export const writerResponseSchema = z.object({
  content: z.string().describe("The written content or document"),
  structure: z
    .object({
      title: z.string().describe("Document title"),
      sections: z
        .array(
          z.object({
            heading: z.string().describe("Section heading"),
            content: z.string().describe("Section content summary"),
            purpose: z.string().optional().describe("Purpose of this section"),
          })
        )
        .describe("Major sections of the document"),
      summary: z.string().optional().describe("Executive summary or abstract"),
    })
    .describe("Document structure breakdown"),
  stylistic: z
    .object({
      tone: z
        .string()
        .describe("Tone used in the writing (formal, conversational, etc.)"),
      targetAudience: z.string().describe("Intended audience for this content"),
      readabilityLevel: z
        .string()
        .optional()
        .describe("Estimated reading level or complexity"),
      specialConsiderations: z
        .array(z.string())
        .optional()
        .describe("Special style considerations applied"),
    })
    .describe("Stylistic elements of the writing"),
  formatting: z
    .object({
      highlights: z
        .array(z.string())
        .optional()
        .describe("Key points highlighted"),
      visualElements: z
        .array(
          z.object({
            type: z
              .string()
              .describe("Type of visual element (table, list, etc.)"),
            purpose: z.string().describe("Purpose of this visual element"),
          })
        )
        .optional()
        .describe("Visual elements used to enhance comprehension"),
      citations: z
        .array(
          z.object({
            source: z.string().describe("Source reference"),
            context: z
              .string()
              .optional()
              .describe("Context where this source is used"),
          })
        )
        .optional()
        .describe("Citations and references"),
    })
    .optional()
    .describe("Formatting elements used"),
  recommendations: z
    .array(
      z.object({
        area: z.string().describe("Area for potential improvement"),
        suggestion: z.string().describe("Specific suggestion"),
      })
    )
    .optional()
    .describe("Recommendations for further improvements"),
});

/**
 * Type for structured responses from the Writer agent
 */
export type WriterResponse = z.infer<typeof writerResponseSchema>;

export default writerAgentConfig;
export type WriterAgentConfig = typeof writerAgentConfig;
