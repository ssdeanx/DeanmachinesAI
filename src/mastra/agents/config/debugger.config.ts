/**
 * Debugger Agent Configuration
 *
 * This module defines the configuration for the Debugger Agent,
 * which specializes in identifying and fixing code issues and bugs.
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
 * Debugger Agent Configuration
 *
 * @remarks
 * The Debugger Agent focuses on troubleshooting, debugging, and resolving
 * technical issues in code. It analyzes error logs, traces execution paths,
 * and proposes fixes for bugs.
 */
export const debuggerConfig: BaseAgentConfig = {
  id: "debugger-agent",
  name: "Debugger Agent",
  description: "Specializes in identifying and fixing code issues and bugs",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a Debugger Agent specializing in identifying and fixing software bugs and issues.

    Your responsibilities include:
    1. Analyzing error logs and stack traces to identify the root cause of issues
    2. Debugging code execution to locate problems
    3. Proposing and implementing fixes for bugs and issues
    4. Optimizing code performance and resource utilization
    5. Writing tests to verify bug fixes and prevent regressions

    When debugging:
    - Follow a systematic approach to isolate the problem
    - Examine logs, stack traces, and relevant code paths
    - Consider edge cases and exception handling
    - Implement fixes that address the root cause, not just symptoms
    - Add tests to verify the fix and prevent regression

    Collaborate with other coding team members to ensure fixes maintain architectural integrity.
  `,
  toolIds: [
    "read-file",
    "write-file",
    "memory-query",
    "github",
    "e2b", // E2B for executing code in a sandbox
    "format-content",
    "calculate-reward", // For analyzing performance improvements
  ],
};

/**
 * Schema for structured debugger agent responses
 */
export const debuggerResponseSchema = z.object({
  issue: z.string().describe("Description of the identified issue"),
  rootCause: z.string().describe("Analysis of the root cause"),
  severity: z
    .enum(["critical", "high", "medium", "low"])
    .describe("Severity level of the issue"),
  location: z
    .object({
      file: z.string().optional().describe("File containing the issue"),
      lineNumbers: z
        .array(z.number())
        .optional()
        .describe("Line numbers where the issue occurs"),
      functionOrComponent: z
        .string()
        .optional()
        .describe("Name of the function or component with the issue"),
    })
    .describe("Location of the issue in the codebase"),
  fix: z
    .object({
      description: z.string().describe("Description of the proposed fix"),
      code: z.string().optional().describe("Code implementation of the fix"),
      alternatives: z
        .array(z.string())
        .optional()
        .describe("Alternative approaches to fixing the issue"),
    })
    .describe("Proposed solution for the issue"),
  testCases: z
    .array(
      z.object({
        description: z.string().describe("Test case description"),
        input: z.unknown().optional().describe("Test input"),
        expectedOutput: z.unknown().optional().describe("Expected output"),
        verificationSteps: z
          .array(z.string())
          .optional()
          .describe("Steps to verify the fix"),
      })
    )
    .optional()
    .describe("Test cases to verify the fix"),
  preventionTips: z
    .array(z.string())
    .optional()
    .describe("Tips to prevent similar issues in the future"),
});

/**
 * Type for structured responses from the Debugger agent
 */
export type DebuggerResponse = z.infer<typeof debuggerResponseSchema>;

export default debuggerConfig;
export type DebuggerConfig = typeof debuggerConfig;
