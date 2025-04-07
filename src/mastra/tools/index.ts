// Core imports
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "process";
import { createAISDKTools } from "@agentic/ai-sdk";

// Re-export tools
export * from "./document";
export * from "./graphRag";
export * from "./readwrite";
export * from "./rlFeedback";
export * from "./rlReward";
export * from "./exasearch";
export * from "./calculator";
export * from "./tavily";
export * from "./google-search";

// Import modular tools
import { createCalculatorTool } from "./calculator";
import { createTavilySearchTool } from "./tavily";
import { createGoogleSearchTool } from "./google-search";
import { BraveSearchClient } from "@agentic/brave-search"; // Fixed: correct client name

/**
 * Environment variable validation schema
 */
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

/**
 * Validates environment variables and returns typed config
 */
const getValidatedConfig = () => {
  try {
    return envSchema.parse(env);
  } catch (error) {
    throw new Error(
      `Environment validation failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

const config = getValidatedConfig();

/**
 * Rate limiter for API calls
 */
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
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.timestamps.push(now);
  }
}

const apiRateLimiter = new RateLimiter();

// Initialize clients with error handling
let embeddings: GoogleGenerativeAIEmbeddings;
let pineconeClient: Pinecone;
let pineconeIndex: any; // TODO: Add proper type when available

try {
  embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: config.GOOGLE_GENERATIVE_AI_API_KEY,
    modelName: config.EMBEDDING_MODEL,
  });

  pineconeClient = new Pinecone({
    apiKey: config.PINECONE_API_KEY,
  });

  pineconeIndex = pineconeClient.Index(config.PINECONE_INDEX);
} catch (error) {
  console.error("Failed to initialize API clients:", error);
  throw error;
}

/**
 * Enhanced tool configuration type
 */
interface ToolConfig {
  validateResponses: boolean;
  maxRetries: number;
  timeout: number;
  rateLimiter?: RateLimiter;
}

// Base tool configuration with rate limiting
const baseToolConfig: ToolConfig = {
  validateResponses: true,
  maxRetries: 2,
  timeout: 30000,
  rateLimiter: apiRateLimiter,
};

/**
 * Tool for searching documents based on semantic similarity
 */
export const searchDocumentsTool = createTool({
  id: "search-documents",
  description: "Search for relevant documents based on a query",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    topK: z.number().default(3).describe("Number of top results to return"),
  }),
  outputSchema: z.object({
    documents: z.array(
      z.object({
        content: z.string(),
        metadata: z.record(z.string(), z.any()),
      })
    ),
  }),
  execute: async ({ context }) => {
    await baseToolConfig.rateLimiter?.waitForAvailability();
    try {
      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
      });

      const results = await vectorStore.similaritySearch(
        context.query,
        context.topK
      );

      return {
        documents: results.map((doc) => ({
          content: doc.pageContent,
          metadata: doc.metadata,
        })),
      };
    } catch (error) {
      console.error("Error searching documents:", error);
      throw new Error(
        `Document search failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
});

/**
 * Tool for content analysis using Google Generative AI
 */
export const analyzeContentTool = createTool({
  id: "analyze-content",
  description: "Analyze content for key insights, topics, and sentiment",
  inputSchema: z.object({
    content: z.string().describe("Content to analyze"),
  }),
  outputSchema: z.object({
    topics: z.array(z.string()),
    entities: z.array(
      z.object({
        name: z.string(),
        type: z.string().optional(),
      })
    ),
    sentiment: z.object({
      score: z.number(),
      label: z.enum(["positive", "negative", "neutral"]),
    }),
    summary: z.string(),
  }),
  execute: async ({ context }) => {
    await baseToolConfig.rateLimiter?.waitForAvailability();
    const genAI = new GoogleGenerativeAI(config.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-pro" });

    try {
      const result = await model.generateContent(`
        Analyze the following content and return a JSON object with:
        1. A list of main topics (maximum 5)
        2. A list of key entities mentioned (with their types if applicable)
        3. The overall sentiment (score between -1 and 1, and a label of positive, negative, or neutral)
        4. A brief summary (maximum 100 words)

        Content: ${context.content}

        Return ONLY a valid JSON object with this structure:
        {
          "topics": ["topic1", "topic2", ...],
          "entities": [{"name": "entity1", "type": "type1"}, ...],
          "sentiment": {"score": 0.0, "label": "neutral"},
          "summary": "Brief summary here"
        }
      `);

      const analysisText = result.response.text();
      try {
        // Extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            topics: analysis.topics || [],
            entities: analysis.entities || [],
            sentiment: analysis.sentiment || { score: 0, label: "neutral" },
            summary: analysis.summary || "",
          };
        }
      } catch (jsonError) {
        console.error("Error parsing analysis result:", jsonError);
      }

      // Fallback
      return {
        topics: [],
        entities: [],
        sentiment: { score: 0, label: "neutral" },
        summary: "Analysis failed to produce valid results.",
      };
    } catch (error) {
      console.error("Error analyzing content:", error);
      throw new Error(
        `Content analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
});

/**
 * Tool for formatting content into well-structured documents
 */
export const formatContentTool = createTool({
  id: "format-content",
  description: "Format and structure content for documentation or reports",
  inputSchema: z.object({
    content: z.string().describe("Content to format"),
    format: z
      .enum(["markdown", "report", "brief"])
      .default("markdown")
      .describe("Output format"),
  }),
  outputSchema: z.object({
    formattedContent: z.string(),
  }),
  execute: async ({ context }) => {
    await baseToolConfig.rateLimiter?.waitForAvailability();
    const genAI = new GoogleGenerativeAI(config.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-pro" });

    try {
      let prompt = "";
      switch (context.format) {
        case "markdown":
          prompt = `Format the following content into well-structured Markdown with headings, bullet points, and code blocks where appropriate:\n\n${context.content}`;
          break;
        case "report":
          prompt = `Format the following content into a formal report structure with Executive Summary, Introduction, Key Findings, Analysis, and Conclusion sections:\n\n${context.content}`;
          break;
        case "brief":
          prompt = `Create a concise briefing from the following content, highlighting only the most important points:\n\n${context.content}`;
          break;
        default:
          prompt = `Format the following content clearly and professionally:\n\n${context.content}`;
      }

      const result = await model.generateContent(prompt);
      return {
        formattedContent: result.response.text(),
      };
    } catch (error) {
      console.error("Error formatting content:", error);
      throw new Error(
        `Content formatting failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
});

// Export individual tools - allow agent to choose which to use
export const searchTools = {
  calculator: createCalculatorTool(baseToolConfig),
  tavily: createTavilySearchTool({
    ...baseToolConfig,
    apiKey: config.TAVILY_API_KEY,
  }),
  google: createGoogleSearchTool({
    ...baseToolConfig,
    apiKey: config.GOOGLE_CSE_KEY,
    searchEngineId: config.GOOGLE_CSE_ID,
  }),
  brave: config.BRAVE_API_KEY
    ? new BraveSearchClient({
        apiKey: config.BRAVE_API_KEY,
      })
    : undefined,
};
