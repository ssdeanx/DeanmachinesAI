/**
 * Copywriter Agent Configuration
 *
 * This module defines the configuration for the Copywriter Agent, which specializes in
 * creating compelling marketing copy and content for various channels.
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
 * Configuration for the Copywriter Agent.
 *
 * @remarks
 * The Copywriter Agent focuses on creating marketing copy and content,
 * adapting to different brand voices, and optimizing messaging for various channels.
 *
 * @property {string[]} toolIds - The list of tool IDs required by the agent.
 */
export const copywriterAgentConfig: BaseAgentConfig = {
  id: "copywriter-agent",
  name: "Copywriter Agent",
  description:
    "Specialized in creating compelling marketing copy and content for various channels.",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a specialized copywriting agent designed to create compelling marketing content.

    Your primary functions:
    1. Generate persuasive and engaging marketing copy
    2. Adapt content to specific brand voices and guidelines
    3. Craft messaging for different channels (web, social, email, etc.)
    4. Optimize copy for conversion and engagement

    Guidelines for your work:
    - Maintain consistent brand voice across deliverables
    - Focus on benefits rather than features when appropriate
    - Create clear, concise, and compelling calls-to-action
    - Consider SEO best practices for web content
    - Adapt tone and style for different target audiences
    - Balance creativity with strategic messaging

    You can use file operations to read from existing files and write content to new files.
    Use the readFileTool to access existing content and writeToFileTool to save your copy.

    You have memory capabilities and can recall previous copywriting sessions.
    When a user returns, try to reference relevant past interactions to provide continuity.
  `,
  toolIds: [
    "readFileTool",
    "writeToFileTool",
    "memoryQueryTool",
    "memoryStoreTool",
    "documentAnalysisTool",
    "contentStructureTool",
    "sentimentAnalysisTool",
  ],
};

/**
 * Schema for structured copywriter agent responses
 */
export const copywriterResponseSchema = z.object({
  content: z.string().describe("The generated marketing copy or content"),
  targetAudience: z.string().describe("The intended audience for this content"),
  channelType: z
    .string()
    .describe("The marketing channel this content is optimized for"),
  toneAndVoice: z.string().describe("Description of the tone and voice used"),
  keyMessages: z
    .array(z.string())
    .describe("Primary messages conveyed in the content"),
  callToAction: z
    .string()
    .optional()
    .describe("The specific call to action, if applicable"),
  brandGuidelines: z
    .object({
      followed: z
        .array(z.string())
        .describe("Brand guidelines that were followed"),
      exceptions: z
        .array(z.string())
        .optional()
        .describe("Any exceptions made to brand guidelines"),
    })
    .optional()
    .describe("How the content aligns with brand guidelines"),
  sentimentAnalysis: z
    .object({
      overall: z.string().describe("Overall sentiment of the content"),
      score: z
        .number()
        .min(-1)
        .max(1)
        .optional()
        .describe("Sentiment score (-1 to 1)"),
    })
    .optional()
    .describe("Analysis of content sentiment"),
});

/**
 * Type for structured responses from the Copywriter agent
 */
export type CopywriterResponse = z.infer<typeof copywriterResponseSchema>;

export default copywriterAgentConfig;
export type CopywriterAgentConfig = typeof copywriterAgentConfig;
