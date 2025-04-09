/**
 * Social Media Agent Configuration
 *
 * This module defines the configuration for the Social Media Agent,
 * which specializes in creating and managing social media content and campaigns.
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
 * Social Media Agent Configuration
 *
 * @remarks
 * The Social Media Agent focuses on creating engaging social media content,
 * planning campaigns, and analyzing social engagement metrics to optimize reach.
 */
export const socialMediaAgentConfig: BaseAgentConfig = {
  id: "social-media-agent",
  name: "Social Media Agent",
  description:
    "Specializes in creating and managing social media content and campaigns",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a Social Media Agent specializing in creating engaging content for social media platforms and managing campaigns.

    Your responsibilities include:
    1. Creating platform-specific social media content
    2. Planning social media campaigns aligned with marketing goals
    3. Analyzing engagement metrics and optimizing content strategy
    4. Identifying trending topics and relevant conversations
    5. Creating visual content and captions optimized for each platform

    When creating social media content:
    - Tailor content to the specific platform (Twitter/X, LinkedIn, Instagram, etc.)
    - Craft concise, engaging copy with appropriate hashtags
    - Create content that encourages engagement (comments, shares)
    - Plan content calendars and posting schedules
    - Analyze performance metrics to refine strategy

    Collaborate with other marketing team members to ensure social media aligns with broader marketing strategies.
  `,
  toolIds: [
    "read-file",
    "write-file",
    "memory-query",
    "brave",
    "google",
    "format-content",
    "analyze-content",
    "calculate-reward", // For analyzing engagement metrics
  ],
};

/**
 * Schema for structured social media agent responses
 */
export const socialMediaResponseSchema = z.object({
  content: z.string().describe("The generated social media content"),
  platform: z.string().describe("Target social media platform"),
  contentType: z
    .enum(["post", "story", "reel", "tweet", "thread", "article"])
    .describe("Type of social media content"),
  hashtags: z.array(z.string()).describe("Recommended hashtags"),
  mediaRecommendations: z
    .array(
      z.object({
        type: z.enum(["image", "video", "carousel", "poll", "link"]),
        description: z
          .string()
          .describe("Description of the recommended media"),
        rationale: z
          .string()
          .optional()
          .describe("Why this media type is recommended"),
      })
    )
    .optional()
    .describe("Media recommendations for the post"),
  engagementTactics: z
    .array(
      z.object({
        tactic: z.string().describe("Engagement tactic"),
        implementation: z.string().describe("How to implement this tactic"),
      })
    )
    .optional()
    .describe("Tactics to increase engagement"),
  audienceTargeting: z
    .object({
      primaryAudience: z.string().describe("Primary target audience"),
      secondaryAudiences: z
        .array(z.string())
        .optional()
        .describe("Secondary audiences"),
      engagementTriggers: z
        .array(z.string())
        .optional()
        .describe("Content elements likely to trigger engagement"),
    })
    .optional()
    .describe("Audience targeting information"),
  timing: z
    .object({
      recommendedTime: z
        .string()
        .optional()
        .describe("Recommended posting time"),
      recommendedDay: z.string().optional().describe("Recommended posting day"),
      rationale: z
        .string()
        .optional()
        .describe("Rationale for timing recommendation"),
    })
    .optional()
    .describe("Posting timing recommendations"),
  campaignFit: z
    .string()
    .optional()
    .describe("How this content fits into the broader campaign"),
});

/**
 * Type for structured responses from the Social Media agent
 */
export type SocialMediaResponse = z.infer<typeof socialMediaResponseSchema>;

export default socialMediaAgentConfig;
export type SocialMediaAgentConfig = typeof socialMediaAgentConfig;
