/**
 * Coder Agent Configuration
 *
 * This module defines the configuration for the Coder Agent, which specializes in
 * generating, analyzing, and refactoring code in various programming languages.
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
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
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

/**
 * Schema for structured coder agent responses
 */
export const coderResponseSchema = z.object({
  code: z.string().describe("The generated or refactored code"),
  explanation: z
    .string()
    .describe("Explanation of the code's functionality and design decisions"),
  files: z
    .array(
      z.object({
        name: z.string().describe("Filename"),
        path: z.string().optional().describe("File path"),
        content: z.string().describe("File content"),
        language: z.string().optional().describe("Programming language"),
      })
    )
    .optional()
    .describe("Files to be created or modified"),
  dependencies: z
    .array(
      z.object({
        name: z.string().describe("Dependency name"),
        version: z.string().optional().describe("Version requirement"),
        purpose: z
          .string()
          .optional()
          .describe("Why this dependency is needed"),
      })
    )
    .optional()
    .describe("Required dependencies"),
  testCases: z
    .array(
      z.object({
        description: z.string().describe("Test case description"),
        input: z.unknown().optional().describe("Test input"),
        expectedOutput: z.unknown().optional().describe("Expected output"),
      })
    )
    .optional()
    .describe("Suggested test cases"),
});

/**
 * Type for structured responses from the Coder agent
 */
export type CoderResponse = z.infer<typeof coderResponseSchema>;

export default coderAgentConfig;
export type CoderAgentConfig = typeof coderAgentConfig;
