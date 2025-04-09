/**
 * UI/UX Coder Agent Configuration
 *
 * This module defines the configuration for the UI/UX Coder Agent,
 * which specializes in frontend development and user experience implementation.
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
 * UI/UX Coder Agent Configuration
 *
 * @remarks
 * The UI/UX Coder Agent focuses on implementing user interfaces and user experience designs.
 * It specializes in frontend technologies, responsive design, and creating intuitive user interactions.
 */
export const uiUxCoderConfig: BaseAgentConfig = {
  id: "ui-ux-coder-agent",
  name: "UI/UX Coder Agent",
  description:
    "Specializes in frontend development and user experience implementation",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a UI/UX Coder Agent specializing in frontend development and user experience implementation.

    Your responsibilities include:
    1. Implementing user interfaces based on designs and wireframes
    2. Writing responsive and accessible frontend code
    3. Creating intuitive user interactions and animations
    4. Ensuring cross-browser and cross-device compatibility
    5. Optimizing UI performance and load times

    When implementing UIs:
    - Follow accessibility standards (WCAG) for inclusive design
    - Ensure responsive layouts that work across different screen sizes
    - Implement smooth transitions and appropriate feedback mechanisms
    - Optimize for performance (minimize reflows, optimize assets)
    - Follow component-based architecture for reusability

    Collaborate with other coding team members to ensure UI/UX implementations align with backend capabilities.
  `,
  toolIds: [
    "read-file",
    "write-file",
    "memory-query",
    "github",
    "e2b", // For previewing UI components
    "format-content",
    "analyze-content",
  ],
};

/**
 * Schema for structured UI/UX coder agent responses
 */
export const uiUxCoderResponseSchema = z.object({
  implementation: z.string().describe("The implemented UI/UX code"),
  components: z
    .array(
      z.object({
        name: z.string().describe("Component name"),
        description: z.string().describe("Component description"),
        code: z.string().describe("Component implementation code"),
        dependencies: z
          .array(z.string())
          .optional()
          .describe("Required dependencies"),
      })
    )
    .describe("UI components implemented"),
  designConsiderations: z
    .object({
      accessibility: z
        .array(z.string())
        .describe("Accessibility considerations addressed"),
      responsiveness: z
        .array(z.string())
        .describe("Responsiveness implementations"),
      browserCompatibility: z
        .array(z.string())
        .optional()
        .describe("Browser compatibility notes"),
    })
    .describe("Design considerations addressed in the implementation"),
  interactionPatterns: z
    .array(
      z.object({
        pattern: z.string().describe("Interaction pattern name"),
        implementation: z.string().describe("How the pattern was implemented"),
        userBenefit: z
          .string()
          .optional()
          .describe("How this benefits the user experience"),
      })
    )
    .optional()
    .describe("User interaction patterns implemented"),
  performanceOptimizations: z
    .array(
      z.object({
        area: z.string().describe("Optimization area"),
        technique: z.string().describe("Technique applied"),
        impact: z.string().optional().describe("Expected performance impact"),
      })
    )
    .optional()
    .describe("Performance optimizations applied"),
  assets: z
    .array(
      z.object({
        type: z.string().describe("Asset type (image, icon, font, etc.)"),
        path: z.string().describe("Path or reference to the asset"),
        purpose: z.string().optional().describe("Purpose of this asset"),
      })
    )
    .optional()
    .describe("Assets used in the implementation"),
});

/**
 * Type for structured responses from the UI/UX Coder agent
 */
export type UiUxCoderResponse = z.infer<typeof uiUxCoderResponseSchema>;

export default uiUxCoderConfig;
export type UIUXCoderConfig = typeof uiUxCoderConfig;
