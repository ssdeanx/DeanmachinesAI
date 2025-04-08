/**
 * Tool Registry and Management
 *
 * This module serves as the central registry for all available tools,
 * handling their initialization, configuration, and export.
 * It manages tool initialization, validation, and provides organized access.
 */

// Standard library imports
import { env } from "process";

// Third-party imports
import { z } from "zod";
import { Tool } from "@mastra/core/tools";
import { createLogger } from "@mastra/core/logger";

// Internal tool imports
import {
  vectorQueryTool,
  googleVectorQueryTool,
  filteredQueryTool,
} from "./vectorquerytool";
import { createBraveSearchTool } from "./brave-search";
import { createGoogleSearchTool } from "./google-search";
import { createTavilySearchTool } from "./tavily";
import { exaSearchTool } from "./exasearch";
import { readFileTool, writeToFileTool } from "./readwrite";
import {
  collectFeedbackTool,
  analyzeFeedbackTool,
  applyRLInsightsTool,
} from "./rlFeedback";
import {
  calculateRewardTool,
  defineRewardFunctionTool,
  optimizePolicyTool,
} from "./rlReward";
import { memoryQueryTool } from "./memoryQueryTool";

// Importing all tools for export modules, DO NOT REMOVE
export * from "./e2b";
export * from "./exasearch";
export * from "./google-search";
export * from "./brave-search";
export * from "./tavily";
export * from "./readwrite";
export * from "./vectorquerytool";
export * from "./rlFeedback";
export * from "./rlReward";
export * from "./memoryQueryTool";
export * from "./github";
export * from "./graphRag";
export * from "./calculator";
export * from "./llamaindex";
export * from "./mcptools";
export * from "./arxiv";
export * from "./wikibase";

// Configure logger
const logger = createLogger({ name: "tool-initialization", level: "info" });

/**
 * Environment configuration schema with validation rules
 * Defines required and optional environment variables for tool initialization
 */
const envSchema = z.object({
  GOOGLE_AI_API_KEY: z.string().min(1, "Google AI API key is required"),
  PINECONE_API_KEY: z.string().min(1, "Pinecone API key is required"),
  PINECONE_INDEX: z.string().default("Default"),
  BRAVE_API_KEY: z.string().optional(),
  EXA_API_KEY: z.string().optional(),
  GOOGLE_CSE_KEY: z.string().optional(),
  GOOGLE_CSE_ID: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),
});

/**
 * Type definition for validated environment configuration
 */
type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment configuration against schema requirements
 *
 * @returns The validated environment configuration
 * @throws {Error} Detailed error message if validation fails
 */
function validateConfig(): EnvConfig {
  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingKeys = error.errors
        .filter((e) => e.code === "invalid_type" && e.received === "undefined")
        .map((e) => e.path.join("."));

      if (missingKeys.length > 0) {
        logger.error(
          `Missing required environment variables: ${missingKeys.join(", ")}`
        );
      }
    }
    logger.error("Environment validation failed:", { error });
    throw new Error(
      `Failed to validate environment configuration: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Search tool initialization record type
 */
type SearchToolRecord = Record<string, Tool<any, any> | undefined>;

/**
 * Initializes and validates the environment configuration
 * @throws {Error} If validation fails
 */
const config = validateConfig();

/**
 * Initialize search tools based on available API keys
 * Each tool is conditionally created only if required API keys are present
 */
const searchTools: SearchToolRecord = {
  brave: config.BRAVE_API_KEY
    ? createBraveSearchTool({ apiKey: config.BRAVE_API_KEY })
    : undefined,

  google:
    config.GOOGLE_CSE_KEY && config.GOOGLE_CSE_ID
      ? createGoogleSearchTool({
          apiKey: config.GOOGLE_CSE_KEY,
          searchEngineId: config.GOOGLE_CSE_ID,
        })
      : undefined,

  tavily: config.TAVILY_API_KEY
    ? createTavilySearchTool({ apiKey: config.TAVILY_API_KEY })
    : undefined,

  exa: config.EXA_API_KEY ? exaSearchTool : undefined,
};

/**
 * Core tools that are always available regardless of environment configuration
 */
const coreTools: Tool<any, any>[] = [
  vectorQueryTool as Tool<undefined, undefined>,
  googleVectorQueryTool as Tool<undefined, undefined>,
  filteredQueryTool as Tool<undefined, undefined>,
  readFileTool as Tool<any, any>,
  writeToFileTool as Tool<any, any>,
  memoryQueryTool as Tool<any, any>,
  collectFeedbackTool as Tool<any, any>,
  analyzeFeedbackTool as Tool<any, any>,
  applyRLInsightsTool as Tool<any, any>,
  calculateRewardTool as Tool<any, any>,
  defineRewardFunctionTool as Tool<any, any>,
  optimizePolicyTool as Tool<any, any>,
];

/**
 * Optional tools that depend on API keys being available
 * Filtered to remove undefined entries with type guard
 */
const optionalTools: Tool[] = Object.values(searchTools).filter(
  (tool): tool is Tool => tool !== undefined
);

/**
 * Complete collection of all available tools (core + optional)
 */
export const allTools: readonly Tool[] = Object.freeze([
  ...coreTools,
  ...optionalTools,
]);

/**
 * Tool map for efficient lookup by ID
 */
export const allToolsMap = new Map<string, Tool>(
  allTools.map((tool) => [tool.id, tool])
);

/**
 * Grouped tools by category for easier access
 */
export const toolGroups = {
  search: Object.values(searchTools).filter(
    (tool): tool is Tool => tool !== undefined
  ),
  vector: [vectorQueryTool, googleVectorQueryTool, filteredQueryTool],
  file: [readFileTool, writeToFileTool],
  memory: [memoryQueryTool],
  rl: [
    collectFeedbackTool,
    analyzeFeedbackTool,
    applyRLInsightsTool,
    calculateRewardTool,
    defineRewardFunctionTool,
    optimizePolicyTool,
  ],
};

// Log initialization results
logger.info(`Initialized ${allTools.length} tools successfully`);
logger.info(
  `Search tools available: ${
    toolGroups.search.map((t) => t.id).join(", ") || "none"
  }`
);

// For backward compatibility
export { allToolsMap as toolMap };
export { toolGroups as groups };

export default allToolsMap;
