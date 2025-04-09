/**
 * Copywriter Agent Configuration
 *
 * This module defines the configuration for the Copywriter Agent, which specializes in
 * creating compelling marketing copy and content for various channels.
 */

import { google } from "@ai-sdk/google";
import {
  BaseAgentConfig,
  defaultResponseValidation,
  DEFAULT_MODEL_ID,
} from "./base.config";

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
  model: google(DEFAULT_MODEL_ID),
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

export default copywriterAgentConfig;
export type CopywriterAgentConfig = typeof copywriterAgentConfig;
