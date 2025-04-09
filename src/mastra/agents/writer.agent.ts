/**
 * Writer Agent Implementation
 *
 * This agent is specialized in creating clear, engaging, and well-structured
 * documentation from complex information.
 */

import { createAgentFromConfig } from "./base.agent";
import { writerAgentConfig } from "./config";
import { sharedMemory } from "../database";
import { createLogger } from "@mastra/core/logger";
import { initializeCoderAgent } from "./coder.agent";

const logger = createLogger({ name: "writer-agent", level: "info" });

/**
 * Writer Agent with content formatting capabilities
 *
 * @remarks
 * This agent can transform complex information into accessible content,
 * adapt tone and style for different audiences, and maintain consistency
 * across documents.
 */
export const writerAgent = createAgentFromConfig({
  config: writerAgentConfig,
  memory: sharedMemory, // Following RULE-MemoryInjection
  onError: async (error: Error) => {
    logger.error("Writer agent error:", error);
    return {
      text: "I encountered an error while generating content. Please provide more specific guidelines or context.",
    };
  },
});

export type WriterAgent = typeof writerAgent;
export default writerAgent;
export type WriterAgentConfig = typeof writerAgentConfig; // Use the imported config type
export type WriterAgentConfigType = typeof writerAgentConfig; // Use the imported config type
export type WriterAgentMemory = typeof sharedMemory;
export type WriterAgentMemoryType = typeof sharedMemory;
