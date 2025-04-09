/**
 * Data Manager Agent Configuration
 *
 * This module defines the specific configuration for the Data Manager Agent,
 * which specializes in managing data operations, file organization,
 * storage, and retrieval of information.
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
 * Configuration for the Data Manager Agent
 *
 * @remarks
 * The Data Manager Agent focuses on organizing, storing, retrieving, and managing
 * data assets across the system, including file operations and vector database management.
 */
export const dataManagerAgentConfig: BaseAgentConfig = {
  id: "data-manager-agent",
  name: "Data Manager Agent",
  description:
    "Specialized in managing data operations, file organization, storage, and retrieval of information across the system.",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a specialized data manager agent designed to organize and maintain information assets.

    Your primary functions:
    1. Organize and categorize files and data
    2. Store and retrieve information efficiently
    3. Maintain data integrity and consistency
    4. Embed documents for semantic search
    5. Create and maintain knowledge graphs

    Guidelines for your work:
    - Adhere to established naming conventions and folder structures
    - Prioritize data integrity and proper formatting
    - Validate data before storage when appropriate
    - Maintain metadata for effective retrieval
    - Use appropriate indexing for different data types

    You can use file operations to read, write, update, and organize files.
    Use embedDocumentTool to add new content to the vector database for semantic search.

    You have memory capabilities to recall file locations and data organization schemes.
    When managing files, consider relationships between different pieces of information.

    For knowledge graph operations:
    - Create meaningful connections between entities
    - Ensure proper node and relationship types
    - Validate graph integrity after modifications
    - Use graphRagTool for retrieving connected information

    Use vectorQueryTool for semantic similarity searches when organizing related content.
  `,
  toolIds: [
    "read-file",
    "write-file",
    "search-documents",
    "embed-document",
    "vector-query",
    "graph-rag",
  ],
};

/**
 * Schema for structured data manager agent responses
 */
export const dataManagerResponseSchema = z.object({
  operation: z.string().describe("Type of data operation performed"),
  status: z
    .enum(["success", "partial", "failed"])
    .describe("Status of the operation"),
  details: z.string().describe("Details about the operation"),
  files: z
    .array(
      z.object({
        path: z.string().describe("Path to the file"),
        type: z.string().describe("File type or format"),
        status: z
          .enum(["created", "modified", "read", "deleted", "unchanged"])
          .describe("Status of the file"),
        size: z.number().optional().describe("Size in bytes if applicable"),
      })
    )
    .optional()
    .describe("Files affected by the operation"),
  vectorData: z
    .object({
      embedded: z.number().optional().describe("Number of items embedded"),
      indexed: z.number().optional().describe("Number of items indexed"),
      queried: z
        .number()
        .optional()
        .describe("Number of items retrieved from query"),
    })
    .optional()
    .describe("Vector database operations information"),
  graphData: z
    .object({
      nodes: z.number().optional().describe("Number of nodes affected"),
      relationships: z
        .number()
        .optional()
        .describe("Number of relationships affected"),
      queries: z
        .number()
        .optional()
        .describe("Number of graph queries performed"),
    })
    .optional()
    .describe("Knowledge graph operations information"),
  recommendations: z
    .array(z.string())
    .optional()
    .describe("Recommendations for data management"),
});

/**
 * Type for structured responses from the Data Manager agent
 */
export type DataManagerResponse = z.infer<typeof dataManagerResponseSchema>;

export default dataManagerAgentConfig;
export type DataManagerAgentConfig = typeof dataManagerAgentConfig;
