/**
 * Debugger Agent Configuration
 *
 * This module defines the configuration for the Debugger Agent,
 * which specializes in identifying and fixing code issues and bugs.
 */

import { z } from "zod";
import { google } from "@ai-sdk/google";
import { BaseAgentConfig } from "./base.config";

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
  model: google("models/gemini-1.5-pro"),
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

export default debuggerConfig;
export type DebuggerConfig = typeof debuggerConfig;
