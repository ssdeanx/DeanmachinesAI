/**
 * Code Documenter Agent Configuration
 *
 * This module defines the configuration for the Code Documenter Agent,
 * which specializes in creating comprehensive code documentation.
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
 * Code Documenter Agent Configuration
 *
 * @remarks
 * The Code Documenter Agent focuses on creating clear, comprehensive documentation
 * for code, APIs, and technical systems. It analyzes code structures and generates
 * appropriate documentation formats.
 */
export const codeDocumenterConfig: BaseAgentConfig = {
  id: "code-documenter-agent",
  name: "Code Documenter Agent",
  description: "Specializes in creating comprehensive code documentation",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a Code Documenter Agent specializing in creating clear, comprehensive documentation for code and technical systems.

    Your responsibilities include:
    1. Creating API documentation with examples and explanations
    2. Writing clear code comments and docstrings
    3. Generating user guides and technical documentation
    4. Creating diagrams to explain code structure and flow
    5. Ensuring documentation stays synchronized with code changes

    When documenting:
    - Focus on explaining the "why" rather than just the "what"
    - Include examples for complex functionality
    - Structure documentation for different audience levels (beginners to experts)
    - Document error conditions and edge cases
    - Use diagrams where appropriate to illustrate concepts

    Collaborate with other coding team members to ensure documentation accurately reflects implementation details.  `,
  toolIds: [
    "read-file",
    "write-file",
    "memory-query",
    "github",
    "format-content",
    "analyze-content",
    "search-documents",
    "embed-document",
  ],
};

/**
 * Schema for structured code documenter responses
 */
export const codeDocumenterResponseSchema = z.object({
  documentation: z.string().describe("The generated documentation content"),
  apiEndpoints: z
    .array(
      z.object({
        path: z.string().describe("API endpoint path"),
        method: z.string().describe("HTTP method (GET, POST, etc.)"),
        description: z
          .string()
          .describe("Description of the endpoint's purpose"),
        parameters: z
          .array(
            z.object({
              name: z.string(),
              type: z.string(),
              description: z.string(),
              required: z.boolean(),
            })
          )
          .optional()
          .describe("List of parameters for the endpoint"),
        responses: z
          .record(z.string(), z.string())
          .optional()
          .describe("Possible responses"),
      })
    )
    .optional()
    .describe("API endpoints documentation if applicable"),
  codeStructure: z
    .object({
      modules: z.array(z.string()).optional(),
      classes: z.array(z.string()).optional(),
      functions: z.array(z.string()).optional(),
      interfaces: z.array(z.string()).optional(),
    })
    .optional()
    .describe("Overview of documented code structure"),
  suggestedDiagrams: z
    .array(z.string())
    .optional()
    .describe("Suggestions for visual documentation"),
});

/**
 * Type for structured responses from the Code Documenter agent
 */
export type CodeDocumenterResponse = z.infer<
  typeof codeDocumenterResponseSchema
>;

export default codeDocumenterConfig;
export type CodeDocumenterConfig = typeof codeDocumenterConfig;
