// Core imports
import { Tool, createTool, ToolExecuteParams } from "@mastra/core/tools"; // Import Tool type and ToolExecuteParams
import { createLogger } from "@mastra/core/logger";
import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "process";
import { createAISDKTools } from "@agentic/ai-sdk";
import { BraveSearchClient } from "@agentic/brave-search";

// Configure logger for tool initialization
const logger = createLogger({ name: "tool-initialization", level: "info" });

// --- Import Tool Factory Functions/Instances ---
// Note: Assuming these files export factory functions or pre-configured instances
// that conform to Mastra's Tool interface or can be adapted.
import { createCalculatorTool } from "./calculator";
import { createTavilySearchTool } from "./tavily";
import { createGoogleSearchTool } from "./google-search";
// Assuming exasearch exports a factory function
import { createExaSearchTool } from "./exasearch"; // Renamed import
// Assuming these are Tool instances exported from their modules
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
import { readFileTool, writeToFileTool } from "./readwrite";
import { vectorQueryTool } from "./vectorquerytool";
// Assuming graphRag exports a factory function
import { createGraphRagTool } from "./graphRag";
// Assuming memoryQueryTool is a Tool instance exported from its module
import { memoryQueryTool } from "./memoryQueryTool";

// --- Environment Variable Handling ---
const envSchema = z.object({
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  PINECONE_API_KEY: z.string().min(1),
  PINECONE_INDEX: z.string().default("Default"),
  EMBEDDING_MODEL: z.string().default("models/gemini-embedding-exp-03-07"),
  BRAVE_API_KEY: z.string().optional(),
  EXA_API_KEY: z.string().optional(),
  GOOGLE_CSE_KEY: z.string().optional(),
  GOOGLE_CSE_ID: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),
});

const getValidatedConfig = () => {
  // Check required (simplified check for brevity, original checks were fine)
  if (!env.GOOGLE_GENERATIVE_AI_API_KEY || !env.PINECONE_API_KEY) {
    logger.error(
      "Missing required environment variables (GOOGLE_GENERATIVE_AI_API_KEY, PINECONE_API_KEY)"
    );
    throw new Error("Missing required environment variables.");
  }
  // Log warnings for optional (simplified logging)
  if (!env.TAVILY_API_KEY) logger.warn("Optional TAVILY_API_KEY missing.");
  if (!env.GOOGLE_CSE_KEY || !env.GOOGLE_CSE_ID)
    logger.warn("Optional GOOGLE_CSE_KEY or GOOGLE_CSE_ID missing.");
  if (!env.BRAVE_API_KEY) logger.warn("Optional BRAVE_API_KEY missing.");
  if (!env.EXA_API_KEY) logger.warn("Optional EXA_API_KEY missing.");

  try {
    const validatedEnv = envSchema.parse(env);
    logger.info("Environment variables validated successfully.");
    return validatedEnv;
  } catch (error) {
    logger.error(
      "Environment variable validation failed:",
      error instanceof z.ZodError ? error.format() : error
    );
    throw new Error("Environment variable validation failed.");
  }
};

let config: z.infer<typeof envSchema>;
let embeddings: GoogleGenerativeAIEmbeddings;
let pineconeClient: Pinecone;
let pineconeIndex: any; // TODO: Add proper type

try {
  config = getValidatedConfig();

  // Initialize clients
  embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: config.GOOGLE_GENERATIVE_AI_API_KEY,
    modelName: config.EMBEDDING_MODEL,
  });

  pineconeClient = new Pinecone({
    apiKey: config.PINECONE_API_KEY,
  });

  pineconeIndex = pineconeClient.Index(config.PINECONE_INDEX);
} catch (error) {
  logger.error("Failed to initialize configuration or API clients:", error);
  // Depending on severity, might exit or continue with limited functionality
  process.exit(1); // Exit if core config/clients fail
}

// --- Rate Limiter (Optional - Keep if used by custom tools) ---
class RateLimiter {
  private timestamps: number[] = [];
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs = 1000, maxRequests = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async waitForAvailability(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      const oldestTimestamp = this.timestamps[0];
      const waitTime = this.windowMs - (now - oldestTimestamp);
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        // Update timestamps after waiting
        this.timestamps = this.timestamps.filter(
          (t) => Date.now() - t < this.windowMs
        );
      }
    }
    this.timestamps.push(Date.now());
  }
}
const apiRateLimiter = new RateLimiter();

// --- Tool Implementations (Using createTool) ---

/**
 * Tool for searching documents based on semantic similarity
 * @param {ToolExecuteParams<typeof searchDocumentsTool.inputSchema>} params - Input parameters.
 * @returns {Promise<z.infer<typeof searchDocumentsTool.outputSchema>>} Search results.
 * @throws {Error} If the search fails.
 */
export const searchDocumentsTool = createTool({
  // Added export
  id: "search-documents",
  description: "Search for relevant documents based on a query",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    topK: z
      .number()
      .int()
      .positive()
      .default(3)
      .describe("Number of top results to return"),
  }),
  outputSchema: z.object({
    documents: z
      .array(
        z.object({
          content: z.string(),
          metadata: z.record(z.string(), z.unknown()), // Use unknown instead of any
        })
      )
      .describe("Array of relevant document chunks."),
  }),
  // Correct execute signature: receives validated input directly
  async execute(
    params // Type is inferred from inputSchema
  ): Promise<z.infer<typeof searchDocumentsTool.outputSchema>> {
    await apiRateLimiter.waitForAvailability(); // Use the rate limiter
    try {
      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
      });
      const results = await vectorStore.similaritySearch(
        params.query,
        params.topK
      );
      return {
        documents: results.map((doc) => ({
          content: doc.pageContent,
          metadata: doc.metadata,
        })),
      };
    } catch (error: unknown) {
      // Catch unknown
      logger.error("Error searching documents:", error);
      throw new Error(
        `Document search failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

/**
 * Tool for content analysis using Google Generative AI
 * @param {ToolExecuteParams<typeof analyzeContentTool.inputSchema>} params - Input parameters.
 * @returns {Promise<z.infer<typeof analyzeContentTool.outputSchema>>} Analysis results.
 * @throws {Error} If analysis fails.
 */
export const analyzeContentTool = createTool({
  // Added export
  id: "analyze-content",
  description: "Analyze content for key insights, topics, and sentiment",
  inputSchema: z.object({
    content: z.string().min(1).describe("Content to analyze"),
  }),
  outputSchema: z.object({
    topics: z.array(z.string()),
    entities: z.array(
      z.object({ name: z.string(), type: z.string().optional() })
    ),
    sentiment: z.object({
      score: z.number(),
      label: z.enum(["positive", "negative", "neutral"]),
    }),
    summary: z.string(),
  }),
  // Correct execute signature
  async execute(
    params // Type is inferred from inputSchema
  ): Promise<z.infer<typeof analyzeContentTool.outputSchema>> {
    await apiRateLimiter.waitForAvailability(); // Use the rate limiter
    const genAI = new GoogleGenerativeAI(config.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    }); // Use a specific, available model

    try {
      const prompt = `
        Analyze the following content and return ONLY a valid JSON object with this structure:
        {
          "topics": ["topic1", "topic2", ...], // maximum 5 topics
          "entities": [{"name": "entity1", "type": "type1"}, ...], // key entities
          "sentiment": {"score": 0.0, "label": "neutral"}, // score -1 to 1
          "summary": "Brief summary here" // maximum 100 words
        }

        Content:
        ---
        ${params.content}
        ---

        JSON Output:`;

      const result = await model.generateContent(prompt);
      const analysisText = result.response.text();

      // Robust JSON parsing
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch?.[0]) {
          const analysis = JSON.parse(jsonMatch[0]);
          // Validate against output schema for extra safety
          return analyzeContentTool.outputSchema.parse(analysis);
        } else {
          logger.warn("No JSON object found in analysis response.", {
            responseText: analysisText,
          });
          throw new Error("Analysis response did not contain valid JSON.");
        }
      } catch (jsonError: unknown) {
        // Catch unknown
        logger.error("Error parsing analysis JSON:", {
          error: jsonError,
          responseText: analysisText,
        });
        throw new Error(
          `Failed to parse analysis result: ${jsonError instanceof Error ? jsonError.message : "Unknown error"}`
        );
      }
    } catch (error: unknown) {
      // Catch unknown
      logger.error("Error analyzing content:", error);
      throw new Error(
        `Content analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

/**
 * Tool for formatting content into well-structured documents
 * @param {ToolExecuteParams<typeof formatContentTool.inputSchema>} params - Input parameters.
 * @returns {Promise<z.infer<typeof formatContentTool.outputSchema>>} Formatted content.
 * @throws {Error} If formatting fails.
 */
export const formatContentTool = createTool({
  // Added export
  id: "format-content",
  description: "Format and structure content for documentation or reports",
  inputSchema: z.object({
    content: z.string().min(1).describe("Content to format"),
    format: z
      .enum(["markdown", "report", "brief"])
      .default("markdown")
      .describe("Output format"),
  }),
  outputSchema: z.object({
    formattedContent: z.string(),
  }),
  // Correct execute signature
  async execute(
    params // Type is inferred from inputSchema
  ): Promise<z.infer<typeof formatContentTool.outputSchema>> {
    await apiRateLimiter.waitForAvailability(); // Use the rate limiter
    const genAI = new GoogleGenerativeAI(config.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    }); // Use a specific, available model

    try {
      let prompt = "";
      switch (params.format) {
        case "markdown":
          prompt = `Format the following content into well-structured Markdown with appropriate headings, lists, and code blocks:\n\n${params.content}`;
          break;
        case "report":
          prompt = `Format the following content into a formal report structure (e.g., Summary, Introduction, Findings, Conclusion):\n\n${params.content}`;
          break;
        case "brief":
          prompt = `Create a concise briefing summarizing the key points of the following content:\n\n${params.content}`;
          break;
      }

      const result = await model.generateContent(prompt);
      return { formattedContent: result.response.text() };
    } catch (error: unknown) {
      // Catch unknown
      logger.error("Error formatting content:", {
          details: error instanceof Error ? error.message : String(error),
          errorObject: error // Pass the original error if needed, ensure logger handles 'unknown' or stringify
      });
      throw new Error(
        `Content formatting failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

// --- Instantiate/Adapt Tools ---

// Instantiate tools that require configuration or adaptation
export const calculatorTool = createCalculatorTool(); // Added export

export const tavilySearchTool = config.TAVILY_API_KEY // Added export
  ? createTavilySearchTool({ apiKey: config.TAVILY_API_KEY })
  : undefined;

export const googleSearchTool =
  config.GOOGLE_CSE_KEY && config.GOOGLE_CSE_ID // Added export
    ? createGoogleSearchTool({
        apiKey: config.GOOGLE_CSE_KEY,
        cseId: config.GOOGLE_CSE_ID, // Use the correct property name 'cseId'
      })
    : undefined;

// Adapt BraveSearchClient using createAISDKTools
// Explicitly type as Tool[] to help TypeScript resolve the type
const braveClientTools: Tool<any, any>[] = config.BRAVE_API_KEY
  ? createAISDKTools(new BraveSearchClient({ apiKey: config.BRAVE_API_KEY }))
  : [];
// Select the specific Brave search tool if multiple are generated
export const braveSearchTool = braveClientTools.find(
  (tool) => tool.id === "braveSearch"
); // Added export (might be undefined)

// Instantiate Exa Search if API key exists and it's a factory
export const exaSearchTool = config.EXA_API_KEY // Added export
  ? createExaSearchTool({ apiKey: config.EXA_API_KEY }) // Use the renamed factory function
  : undefined;

// Instantiate Graph RAG if it's a factory (or use directly if it's an instance)
export const graphRagTool = createGraphRagTool; // Use the imported instance directly

// --- Re-export imported tools for direct access if needed ---
// These are already Tool instances, just re-export them
export {
  collectFeedbackTool,
  analyzeFeedbackTool,
  applyRLInsightsTool,
  calculateRewardTool,
  defineRewardFunctionTool,
  optimizePolicyTool,
  readFileTool,
  writeToFileTool,
  vectorQueryTool,
  memoryQueryTool,
};

// --- Tool Aggregation ---

// Define tools that are always available (don't depend on optional API keys)
// Includes imported instances and locally created/instantiated tools
const coreTools: Tool<any, any>[] = [
  calculatorTool,
  collectFeedbackTool,
  analyzeFeedbackTool,
  applyRLInsightsTool,
  calculateRewardTool,
  defineRewardFunctionTool,
  optimizePolicyTool,
  readFileTool,
  writeToFileTool,
  vectorQueryTool,
  graphRagTool,
  memoryQueryTool,
  searchDocumentsTool,
  analyzeContentTool,
  formatContentTool,
];

// Define tools that depend on optional API keys
const optionalTools: (Tool<any, any> | undefined)[] = [
  tavilySearchTool,
  googleSearchTool,
  braveSearchTool,
  exaSearchTool,
];

// Combine and filter out undefined tools
export const allToolsArray: Tool<any, any>[] = [
  // Added export
  ...coreTools,
  ...optionalTools,
].filter((tool): tool is Tool<any, any> => tool !== undefined);

// Create the map from the final, validated array
export const allToolsMap = new Map<string, Tool<any, any>>( // Added export
  allToolsArray.map((tool) => [tool.id, tool])
);

// --- Tool Grouping (Optional but Recommended) ---
// Update groups to use the instantiated variables
export const webSearchToolsGroup = [
  // Added export
  tavilySearchTool,
  googleSearchTool,
  braveSearchTool,
  exaSearchTool,
].filter((t): t is Tool<any, any> => t !== undefined);

export const documentToolsGroup = [
  // Added export
  searchDocumentsTool,
  analyzeContentTool,
  formatContentTool,
];

export const fileToolsGroup = [readFileTool, writeToFileTool]; // Added export

export const knowledgeToolsGroup = [vectorQueryTool, graphRagTool]; // Added export

export const rlToolsGroup = [
  // Added export
  collectFeedbackTool,
  analyzeFeedbackTool,
  applyRLInsightsTool,
  calculateRewardTool,
  defineRewardFunctionTool,
  optimizePolicyTool,
];

export const utilityToolsGroup = [calculatorTool, memoryQueryTool]; // Added export

logger.info(
  `Initialized ${allToolsArray.length} tools: ${allToolsArray.map((t) => t.id).join(", ")}`
);

// Export the map as default
export default allToolsMap;
