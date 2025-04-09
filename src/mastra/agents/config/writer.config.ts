/**
 * Writer Agent Configuration
 *
 * This module defines the specific configuration for the Writer Agent,
 * which specializes in creating clear, engaging, and well-structured
 * documentation from complex information.
 */

import { google } from "@ai-sdk/google";
import {
  BaseAgentConfig,
  defaultResponseValidation,
  DEFAULT_MODEL_ID, // Import the shared constant
} from "./base.config";

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
  model: google(DEFAULT_MODEL_ID), // Use the constant here
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

export default writerAgentConfig;
export type WriterAgentConfig = typeof writerAgentConfig;
