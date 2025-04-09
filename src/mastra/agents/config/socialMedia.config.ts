/**
 * Social Media Agent Configuration
 *
 * This module defines the configuration for the Social Media Agent,
 * which specializes in creating and managing social media content and campaigns.
 */

import { z } from "zod";
import { google } from "@ai-sdk/google";
import { BaseAgentConfig } from "./base.config";

/**
 * Social Media Agent Configuration
 *
 * @remarks
 * The Social Media Agent focuses on creating engaging social media content,
 * planning campaigns, and analyzing social engagement metrics to optimize reach.
 */
export const socialMediaConfig: BaseAgentConfig = {
  id: "social-media-agent",
  name: "Social Media Agent",
  description:
    "Specializes in creating and managing social media content and campaigns",
  model: google("models/gemini-1.5-pro"),
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

export default socialMediaConfig;
export type SocialMediaAgentConfig = typeof socialMediaConfig;
