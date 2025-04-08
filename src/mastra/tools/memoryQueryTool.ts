import { createTool } from "@mastra/core/tools";
import { createLogger } from "@mastra/core/logger";
import { z } from "zod";
// Assuming sharedMemory is an instance of the Memory class from @mastra/memory
import { sharedMemory } from "../database";
// Import specific types if available and known, otherwise use general types
import type { CoreMessage, ToolExecutionContext } from "@mastra/core"; // Assuming CoreMessage type exists

const logger = createLogger({ name: "memory-query-tool" });

/**
 * Schema for selecting messages by specific IDs with context.
 */
const includeMessageSchema = z.object({
  id: z.string().describe("ID of the message to include."),
  withPreviousMessages: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Number of messages to include before this message."),
  withNextMessages: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Number of messages to include after this message."),
});

/**
 * Schema for selecting messages based on various criteria.
 * Aligns with the `selectBy` parameter of `memory.query()`.
 */
const memorySelectBySchema = z
  .object({
    vectorSearchString: z
      .string()
      .optional()
      .describe("Search string for finding semantically similar messages."),
    last: z
      .union([z.number().int().positive(), z.literal(false)])
      .optional()
      .describe(
        "Number of most recent messages to retrieve (or false to disable limit). Defaults influenced by memory config."
      ),
    include: z
      .array(includeMessageSchema)
      .optional()
      .describe(
        "Array of specific message IDs to include, potentially with context."
      ),
  })
  .describe(
    "Options for selecting which messages to retrieve from the thread."
  );

/**
 * Input schema for the Memory Query Tool, aligned with `memory.query()`.
 */
const memoryQueryInputSchema = z.object({
  threadId: z
    .string()
    .describe("The unique identifier of the thread to retrieve messages from."),
  selectBy: memorySelectBySchema.describe(
    "Criteria for selecting messages (e.g., last N, semantic search, specific IDs)."
  ),
  // resourceId: z.string().optional().describe("Optional ID of the resource owning the thread for validation."),
  // threadConfig: z.any().optional().describe("Optional memory configuration overrides for this query."), // Type depends on MemoryConfig definition
});

/**
 * Output schema for the Memory Query Tool.
 * Returns an array of matching messages found in memory.
 */
const memoryQueryOutputSchema = z.object({
  // Using z.unknown() for messages as CoreMessage structure might be complex or not fully defined here
  messages: z
    .array(z.unknown())
    .describe("An array of message objects matching the query criteria."),
  // uiMessages: z.array(z.unknown()).optional().describe("Optional array of messages formatted for UI display."), // Include if needed
});

/**
 * Creates a tool for querying messages stored in the Mastra Memory system for a specific thread.
 *
 * @remarks
 * This tool allows agents to retrieve messages based on criteria like recency,
 * semantic similarity, or specific IDs. It interacts directly with the
 * configured memory provider (LibSQL) via the `memory.query()` method.
 * Retrieving specific structured data (like feedback or rewards) depends on that
 * data being present within the message content/metadata or discoverable via semantic search.
 * This tool does *not* query arbitrary structured data types directly.
 *
 * @param {ToolExecuteParams<typeof memoryQueryInputSchema>} params - The parameters object, conforming to the input schema.
 * @param {string} params.threadId - The ID of the thread to query.
 * @param {object} params.selectBy - The criteria for selecting messages.
 * @returns {Promise<{messages: Array<any>}>} A promise resolving to the query results.
 * @throws {Error} If the memory system is unavailable or the query fails.
 */
export const memoryQueryTool = createTool({
  id: "memory-query", // Unique ID for the tool
  description:
    "Queries messages within a specific thread stored in the agent memory system based on criteria like recency, semantic similarity, or specific IDs.",
  inputSchema: memoryQueryInputSchema,
  outputSchema: memoryQueryOutputSchema,
  execute: async ({ context }) => {
    // Access the validated input from context
    const { threadId, selectBy } = context;
    logger.info(`Executing memory query for threadId: ${threadId}`, {
      selectBy,
    });

    if (!sharedMemory || typeof sharedMemory.query !== "function") {
      logger.error(
        "Memory system (sharedMemory) or its query method is not available."
      );
      throw new Error("Memory system or query method is not available.");
    }

    try {
      // Use the documented memory.query() method
      const { messages /*, uiMessages */ } = await sharedMemory.query({
        threadId,
        selectBy,
        // resourceId, // Pass if needed/available
        // threadConfig, // Pass if needed/available
      });

      // Ensure messages is always an array
      const finalMessages = Array.isArray(messages) ? messages : [];

      logger.info(
        `Memory query successful for thread ${threadId}, returned ${finalMessages.length} messages.`
      );
      // Return structure matching the output schema
      return { messages: finalMessages };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(
        `Memory query failed for thread ${threadId}: ${errorMessage}`,
        { error }
      );
      throw new Error(
        `Failed to query memory for thread ${threadId}: ${errorMessage}`
      );
    }
  },
});

// --- Integration into tools/index.ts (Reminder) ---
// 1. Import `memoryQueryTool` in `src/mastra/tools/index.ts`.
// 2. Add it to `allToolsArray` and `allToolsMap`.
// 3. Consider adding it to `utilityTools` or a new `memoryTools` group.
// 4. Add its ID ('memory-query') to the `toolIds` array in the configuration
//    of any agent that needs to use it (e.g., rlTrainerAgent, analystAgent).
