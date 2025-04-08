/**
 * Base Agent Implementation
 *
 * This module provides utility functions to create agents from configurations,
 * ensuring consistent agent creation patterns across the application.
 */

import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { Tool } from "@mastra/core/tools";
import { createLogger } from "@mastra/core/logger";
import { sharedMemory } from "../database";
import {
  BaseAgentConfig,
  defaultErrorHandler,
  DEFAULT_MODEL_ID,
} from "./config/base.config";
import { createResponseHook } from "../hooks";
import { allToolsMap } from "../tools";

// Configure logger for agent initialization
const logger = createLogger({ name: "agent-initialization", level: "info" });

/**
 * Creates an agent instance from a configuration object
 *
 * @param config The agent configuration object
 * @returns A configured Agent instance
 * @throws Error if required tools are not available
 */
export function createAgentFromConfig(config: BaseAgentConfig): Agent {
  // Validate configuration
  if (!config.id || !config.name || !config.instructions) {
    throw new Error(
      `Invalid agent configuration for ${config.id || "unknown agent"}`
    );
  }

  // Resolve tools from toolIds
  const tools: Record<string, Tool<any, any>> = {};
  const missingTools: string[] = [];

  for (const toolId of config.toolIds) {
    const tool = allToolsMap.get(toolId);
    if (tool) {
      const key = tool.id || toolId;
      tools[key] = tool;
    } else {
      missingTools.push(toolId);
    }
  }

  // Log and throw error for missing tools
  if (missingTools.length > 0) {
    const errorMsg = `Missing required tools for agent ${
      config.id
    }: ${missingTools.join(", ")}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Create response hook if validation options are provided
  const responseHook = config.responseValidation
    ? createResponseHook(config.responseValidation)
    : undefined;

  // Create and return the agent instance
  logger.info(
    `Creating agent: ${config.id} with ${Object.keys(tools).length} tools`
  );

  try {
    return new Agent({
      model: config.model,
      memory: sharedMemory,
      name: config.name,
      instructions: config.instructions,
      tools,
      ...(responseHook ? { onResponse: responseHook } : {}),
    });
  } catch (error) {
    logger.error(
      `Failed to create agent ${config.id}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}
