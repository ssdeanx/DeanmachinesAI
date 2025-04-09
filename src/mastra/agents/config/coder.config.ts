/**
 * Coder Agent Configuration
 *
 * This module defines the configuration for the Coder Agent, which specializes in
 * generating, analyzing, and refactoring code in various programming languages.
 */

import { google } from "@ai-sdk/google";
import {
  BaseAgentConfig,
  defaultResponseValidation,
  DEFAULT_MODEL_ID,
} from "./base.config";

/**
 * Configuration for the Coder Agent.
 *
 * @remarks
 * The Coder Agent focuses on code generation, refactoring, and analysis
 * using code manipulation tools, file operations, and GitHub integration.
 *
 * @property {string[]} toolIds - The list of tool IDs required by the agent.
 */
export const coderAgentConfig: BaseAgentConfig = {
  id: "coder-agent",
  name: "Coder Agent",
  description:
    "Specialized in generating, analyzing, and refactoring code in various programming languages.",
  model: google(DEFAULT_MODEL_ID),
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a specialized coding agent designed to generate, analyze, and refactor code.

    Your primary functions:
    1. Generate high-quality code based on requirements
    2. Analyze existing code for improvements and bugs
    3. Refactor code following best practices
    4. Explain code functionality clearly and concisely

    Guidelines for your work:
    - Prioritize code readability and maintainability
    - Follow language-specific conventions and best practices
    - Include appropriate comments and documentation
    - Consider performance implications of your code
    - Ensure proper error handling
    - Validate inputs and sanitize outputs

    You can use file operations to read from existing files and write code to new files.
    Use the readFileTool to access existing code and writeToFileTool to save your code.

    Use the GitHub tool to interact with repositories when needed.

    You have memory capabilities and can recall previous coding sessions.
    When a user returns, try to reference relevant past interactions to provide continuity.
  `,
  toolIds: [
    "readFileTool",
    "writeToFileTool",
    "searchFilesTool",
    "githubTool",
    "memoryQueryTool",
    "memoryStoreTool",
    "documentAnalysisTool",
    "calculatorTool",
  ],
};

export default coderAgentConfig;
export type CoderAgentConfig = typeof coderAgentConfig;
