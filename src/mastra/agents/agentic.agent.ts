/**
 * Agentic-style Agent Implementation
 *
 * This module implements an advanced agent using Mastra's core functionality,
 * combining multiple tools for enhanced capabilities.
 */

import { Agent } from "@mastra/core/agent";
import { createLogger } from "@mastra/core/logger";
import { sharedMemory } from "../database";
import { createAgentFromConfig } from "./base.agent";
import {
  agenticAssistantConfig,
  agenticResponseSchema,
} from "./config";

// Initialize logger for this module
const logger = createLogger({ name: "agentic-agent", level: "info" });

/**
 * Creates and initializes the agentic assistant agent with all required tools
 *
 * @returns An initialized Mastra agent instance
 * @throws {Error} If agent creation fails or required tools are missing
 */
export function createAgenticAssistant(): Agent {
  try {
    logger.info(`Creating agent: ${agenticAssistantConfig.id}`);

    // Create the agent using the standardized createAgentFromConfig function
    return createAgentFromConfig({
      config: agenticAssistantConfig,
      memory: sharedMemory, // Following RULE-MemoryInjection
      onError: async (error: Error) => {
        logger.error("Agentic assistant error:", error);
        return {
          text: "I encountered an error. Please try again or provide more information.",
        };
      },
    });
  } catch (error) {
    logger.error(`Failed to create agent ${agenticAssistantConfig.id}:`, {
      error,
    });
    throw new Error(
      `Agent creation failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Create the agent instance
export const agenticAssistant = createAgenticAssistant();

/**
 * Generates a structured response using the agentic assistant
 *
 * @param query - The user's question or request
 * @returns A promise resolving to the structured response
 * @throws {Error} If generation fails or response validation fails
 */

/**
 * Streams a response from the agentic assistant
 *
 * @param query - The user's question or request
 * @returns A promise resolving to the streaming response
 * @throws {Error} If streaming setup fails
 */
export async function streamResponse(query: string) {
  try {
    return await agenticAssistant.stream(query);
  } catch (error) {
    logger.error("Error streaming response:", { error });
    throw new Error(
      `Failed to stream response: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Example usage:
 *
 * ```typescript
 * import { agenticAssistant, getStructuredResponse } from "./agents/agentic.agent";
 *
 * // Simple text response
 * const response = await agenticAssistant.generate("What's the weather like today?");
 * console.log(response.text);
 *
 * // Structured response with schema validation
 * const structuredResponse = await getStructuredResponse(
 *   "Analyze the current trends in renewable energy"
 * );
 * console.log(structuredResponse.answer);
 * console.log(structuredResponse.sources);
 * ```
 */
