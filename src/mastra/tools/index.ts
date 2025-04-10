/**
 * Tool Registry and Management
 *
 * This module serves as the central registry for all available tools,
 * handling their initialization, configuration, and export. It assembles
 * core, optional, additional, and extra tools into a lookup map so that agents
 * can easily find and use them.
 *
 * @module Tools
 */

// === Standard library imports ===
import { env } from "process";

// === Third-party imports ===
import { z } from "zod";
import { Tool } from "@mastra/core/tools";
import { createLogger } from "@mastra/core/logger";

// === Internal tool imports ===
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

// --- Import additional tools from new modules ---
import { analyzeContentTool, formatContentTool } from "./contentTools";
import { searchDocumentsTool, embedDocumentTool } from "./document-tools";

// --- Import extra modules that return or represent tool instances ---
import { GitHubClient } from "./github";
import { GraphNode } from "./graphRag";
import { createCalculatorTool } from "./calculator";
import { createLlamaIndexTools } from "./llamaindex";
import { McpTools } from "./mcptools";
import { arxiv } from "./arxiv";
import { WikipediaClient } from "./wikibase";
import { createAISDKTools } from "./ai-sdk";
import { e2b } from "./e2b";
// Import GraphRag tools so that they are read and fully functional.
import { createGraphRagTool, graphRagQueryTool } from "./graphRag";
import { llmChainTool, aiSdkPromptTool } from "./llmchain";

// === Export all tool modules ===
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
export * from "./ai-sdk";
export * from "./contentTools";
export * from "./document-tools";
export * from "./llmchain";

// === Configure Logger ===
const logger = createLogger({ name: "tool-initialization", level: "info" });

// === Environment Configuration ===

/**
 * Schema for environment variables used to initialize tools.
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
  // API keys for extra tools
  E2B_API_KEY: z.string().min(1, "E2B API key is required"),
  GITHUB_API_KEY: z.string().min(1, "GitHub API key is required"),
});

/**
 * Type alias for the validated environment configuration.
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates the environment configuration.
 *
 * @returns {EnvConfig} The validated environment configuration.
 * @throws {Error} When validation fails.
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

// === Initialize Environment Configuration ===
const config: EnvConfig = validateConfig();

// === Search Tools Initialization ===

/**
 * Record type for search tools.
 */
interface SearchToolRecord {
  [key: string]: Tool<z.ZodTypeAny, z.ZodTypeAny> | undefined;
}

/**
 * Initializes search tools based on available API keys.
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

// === Core Tools Initialization ===

/**
 * Core tools that are always available.
 */
const coreTools: Tool<z.ZodTypeAny, z.ZodTypeAny>[] = [
  vectorQueryTool as Tool<z.ZodTypeAny, z.ZodTypeAny>,
  googleVectorQueryTool as Tool<z.ZodTypeAny, z.ZodTypeAny>,
  filteredQueryTool as Tool<z.ZodTypeAny, z.ZodTypeAny>,
  readFileTool as Tool<z.ZodTypeAny, z.ZodTypeAny>,
  writeToFileTool as Tool<z.ZodTypeAny, z.ZodTypeAny>,
  memoryQueryTool as Tool<z.ZodTypeAny, z.ZodTypeAny>,
  collectFeedbackTool as Tool<z.ZodTypeAny, z.ZodTypeAny>,
  analyzeFeedbackTool as Tool<z.ZodTypeAny, z.ZodTypeAny>,
  applyRLInsightsTool as Tool<z.ZodTypeAny, z.ZodTypeAny>,
  calculateRewardTool as Tool<z.ZodTypeAny, z.ZodTypeAny>,
  defineRewardFunctionTool as Tool<z.ZodTypeAny, z.ZodTypeAny>,
  optimizePolicyTool as Tool<z.ZodTypeAny, z.ZodTypeAny>,
];

// === Additional Tools from contentTools and document-tools ===
const additionalTools: Tool<z.ZodTypeAny, z.ZodTypeAny>[] = [
  analyzeContentTool,
  formatContentTool,
  searchDocumentsTool,
  embedDocumentTool,
];

// === Extra Tools Initialization ===
/**
 * Extra tools aggregated from modules that expose tool instances.
 * NOTE: Some imports (like GraphNode, CalculatorConfig, WikipediaClient) are types or configurations,
 * so only tool instances are added to the tools map.
 */
const extraTools: Tool<z.ZodTypeAny, z.ZodTypeAny>[] = [];

// Instantiate GitHub client using the provided API key.
const gitHubTool = new GitHubClient({ apiKey: config.GITHUB_API_KEY });
extraTools.push(gitHubTool as unknown as Tool<z.ZodTypeAny, z.ZodTypeAny>);

// Instantiate (or use) the E2B tool if it is already an instance.
if (e2b && typeof e2b === "object" && "id" in e2b) {
  extraTools.push(e2b as Tool<z.ZodTypeAny, z.ZodTypeAny>);
}

// Create and add LlamaIndex tools.
const llamaIndexArray = createLlamaIndexTools();
if (Array.isArray(llamaIndexArray)) {
  extraTools.push(
    ...(llamaIndexArray as unknown as Tool<z.ZodTypeAny, z.ZodTypeAny>[])
  );
}

// Add McpTools if provided as an array.
if (Array.isArray(McpTools)) {
  extraTools.push(...(McpTools as Tool<z.ZodTypeAny, z.ZodTypeAny>[]));
}

// Include 'arxiv' tool if it is a valid tool instance.
if (arxiv && typeof arxiv === "object" && "id" in arxiv) {
  extraTools.push({ ...arxiv, description: "Arxiv Tool" } as unknown as Tool<
    z.ZodTypeAny,
    z.ZodTypeAny
  >);
}

// Create and add AISDK tools.
const aisdkArray = createAISDKTools();
if (Array.isArray(aisdkArray)) {
  extraTools.push(...aisdkArray);
}

// Instantiate Wikipedia client.
const wikiClient = new WikipediaClient();
extraTools.push(wikiClient as unknown as Tool<z.ZodTypeAny, z.ZodTypeAny>);

// Instantiate Calculator tool.
const calculatorToolInstance = createCalculatorTool();
extraTools.push(
  calculatorToolInstance as unknown as Tool<z.ZodTypeAny, z.ZodTypeAny>
);

// Add GraphRag tools to the extra tools array.
extraTools.push(createGraphRagTool);
extraTools.push(graphRagQueryTool);

// Create an alias tool for "graph-rag" required by data-manager-agent.
// This alias uses the properties of createGraphRagTool but overrides the id.
const graphRagAliasTool: Tool<z.ZodTypeAny, z.ZodTypeAny> = {
  ...createGraphRagTool,
  id: "graph-rag",
};
extraTools.push(graphRagAliasTool);

// Add LLM chain tools for AI model interactions
extraTools.push(llmChainTool as Tool<z.ZodTypeAny, z.ZodTypeAny>);
extraTools.push(aiSdkPromptTool as Tool<z.ZodTypeAny, z.ZodTypeAny>);

// === Filter Optional Search Tools ===
const optionalTools: Tool<z.ZodTypeAny, z.ZodTypeAny>[] = Object.values(
  searchTools
).filter(
  (tool): tool is Tool<z.ZodTypeAny, z.ZodTypeAny> => tool !== undefined
);

// === Aggregate All Tools ===

/**
 * Complete collection of all available tools (core + optional + additional + extra).
 */
export const allTools: readonly Tool<z.ZodTypeAny, z.ZodTypeAny>[] =
  Object.freeze([
    ...coreTools,
    ...optionalTools,
    ...additionalTools,
    ...extraTools,
  ]);

/**
 * Map for efficient lookup of tools by their ID.
 */
export const allToolsMap: ReadonlyMap<
  string,
  Tool<z.ZodTypeAny, z.ZodTypeAny>
> = new Map(allTools.map((tool) => [tool.id, tool]));

/**
 * Grouped tools by category for easier access.
 */
export const toolGroups = {
  search: Object.values(searchTools).filter(
    (tool): tool is Tool<z.ZodTypeAny, z.ZodTypeAny> => tool !== undefined
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
  content: [analyzeContentTool, formatContentTool],
  document: [searchDocumentsTool, embedDocumentTool],
  extra: extraTools,
};

// === Log Initialization Results ===
logger.info(`Initialized ${allTools.length} tools successfully`);
logger.info(
  `Search tools available: ${
    toolGroups.search.map((t) => t.id).join(", ") || "none"
  }`
);

// For backward compatibility.
export { allToolsMap as toolMap };
export { toolGroups as groups };

export default allToolsMap;
