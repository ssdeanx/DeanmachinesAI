/**
 * RL Trainer Agent Configuration
 *
 * This module defines the specific configuration for the RL Trainer Agent,
 * which specializes in reinforcement learning, collecting and analyzing
 * feedback, and optimizing agent behaviors.
 *
 * @module rlTrainer.config
 */

import { z } from "zod";
import { Tool } from "@mastra/core/tools";
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
  allTools: ReadonlyMap<string, Tool<z.ZodTypeAny | undefined, z.ZodTypeAny | undefined>>
): Record<string, Tool<z.ZodTypeAny | undefined, z.ZodTypeAny | undefined>> {
  const tools: Record<string, Tool<z.ZodTypeAny | undefined, z.ZodTypeAny | undefined>> = {};
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
 * Configuration for the RL Trainer Agent
 *
 * @remarks
 * The RL Trainer Agent focuses on collecting user feedback, analyzing agent performance,
 * and implementing reinforcement learning techniques to improve agent behaviors.
 */
export const rlTrainerAgentConfig: BaseAgentConfig = {
  id: "rl-trainer-agent",
  name: "RL Trainer Agent",
  description:
    "Specialized in reinforcement learning, collecting and analyzing feedback, and optimizing agent behaviors.",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a specialized reinforcement learning (RL) trainer agent designed to improve the performance of other agents.

    Your primary functions:
    1. Collect and analyze user feedback on agent interactions
    2. Define appropriate reward functions for different agent behaviors
    3. Calculate rewards based on interaction outcomes
    4. Apply insights to optimize agent policies and prompts
    5. Track improvements and regression in agent performance

    Guidelines for your work:
    - Focus on quantifiable metrics when assessing performance
    - Balance multiple objectives (accuracy, helpfulness, safety)
    - Document the rationale behind proposed optimizations
    - Ensure suggested changes align with the agent's core purpose
    - Consider potential side effects of optimization changes

    You can use file operations to read agent configurations and write optimization suggestions.
    Be deliberate and cautious when suggesting changes to agent prompts or tool usage.

    You have memory capabilities to track performance trends over time.
    Identify patterns in user feedback and correlate them with specific agent behaviors.

    When proposing changes:
    - Clearly state the expected improvement
    - Provide a confidence level for your recommendation
    - Suggest how to measure the effectiveness of the change
    - Consider A/B testing for significant modifications
  `,
  toolIds: [
    "collect-feedback",
    "analyze-feedback",
    "apply-rl-insights",
    "calculate-reward",
    "define-reward-function",
    "optimize-policy",
    "read-file",
    "write-file",
  ],
};

/**
 * Schema for structured RL Trainer agent responses
 */
export const rlTrainerResponseSchema = z.object({
  analysis: z.string().describe("Analysis of agent performance data"),
  recommendations: z.array(z.object({
    targetArea: z.string().describe("The specific aspect of agent behavior to improve"),
    change: z.string().describe("Proposed modification to the agent configuration"),
    expectedImprovement: z.string().describe("Expected outcome from this change"),
    confidenceLevel: z.number().min(0).max(1).describe("Confidence in this recommendation (0-1)"),
    measurementMethod: z.string().describe("How to measure the effectiveness of this change")
  })).describe("Recommended optimization changes"),
  metrics: z.record(z.string(), z.number()).optional().describe("Quantified performance metrics")
});

/**
 * Type for structured responses from the RL Trainer agent
 */
export type RLTrainerResponse = z.infer<typeof rlTrainerResponseSchema>;

export default rlTrainerAgentConfig;
export type RLTrainerAgentConfig = typeof rlTrainerAgentConfig;
