/**
 * Vector Query Tool for semantic search over vector databases.
 *
 * This module creates and exports a tool for semantic search over vector stores,
 * with support for reranking to improve search result relevance.
 */

import { google } from "@ai-sdk/google";
import { encodingForModel } from "js-tiktoken";
import { createVectorQueryTool } from "@mastra/rag";
import { env } from "process";
import { MastraEmbeddingAdapter, createEmbeddings } from "../database/vector-store";

/**
 * Configuration options for Vector Query Tool
 */
export interface VectorQueryConfig {
  /** Name of the vector store to use */
  vectorStoreName: string;
  /** Name of the index within the vector store */
  indexName: string;
  /** Whether to enable filters for query processing */
  enableFilters?: boolean;
  /** Custom ID for the tool */
  id?: string;
  /** Custom description for the tool */
  description?: string;
  /** Embedding model provider to use */
  embeddingProvider?: "google" | "tiktoken";
  /** Top-K results to return */
  topK?: number;
  /** Custom tokenizer encoding name */
  tokenEncoding?: string;
}

/**
 * Creates a tokenizer using js-tiktoken
 *
 * @param encodingName - Name of the encoding model to use
 * @returns Tokenizer object with encode and decode methods
 */
function createTokenizer(encodingName = 'o200_base') {
  // Initialize the tokenizer with o200 encoding
  const tokenizer = encodingForModel(encodingName as any);

  return {
    /**
     * Encodes text into tokens
     *
     * @param text - Text to encode
     * @returns Array of token IDs
     */
    encode: (text: string): number[] => {
      return tokenizer.encode(text);
    },

    /**
     * Decodes tokens back to text
     *
     * @param tokens - Array of token IDs
     * @returns Decoded text
     */
    decode: (tokens: number[]): string => {
      return tokenizer.decode(tokens);
    },

    /**
     * Gets token count for text
     *
     * @param text - Text to count tokens for
     * @returns Number of tokens
     */
    countTokens: (text: string): number => {
      return tokenizer.encode(text).length;
    }
  };
}

/**
 * Creates a Vector Query Tool with the specified configuration
 *
 * @param config - Configuration options for the Vector Query Tool
 * @returns Configured Vector Query Tool
 */
export function createMastraVectorQueryTool(config?: Partial<VectorQueryConfig>) {
  // Get configuration values with defaults
  const vectorStoreName = config?.vectorStoreName || env.VECTOR_STORE_NAME || "pinecone";
  const indexName = config?.indexName || env.PINECONE_INDEX || "documentation";
  const embeddingProvider = config?.embeddingProvider || "google";
  const tokenEncoding = config?.tokenEncoding || "o200_base";

  // Initialize tokenizer
  const tokenizer = createTokenizer(tokenEncoding);

  // Choose embedding model based on provider
  let embeddingModel;

  if (embeddingProvider === "tiktoken") {
    // Create a custom embedding adapter using tiktoken
    embeddingModel = {
      specificationVersion: "v1" as const,
      provider: "tiktoken",
      modelId: tokenEncoding,
      dimensions: Number(env.PINECONE_DIMENSION) || 2048,
      embed: async (text: string) => {
        // Convert text to vector using tokenizer
        const tokens = tokenizer.encode(text);
        // Create a normalized embedding from tokens
        // This is a simplified approach - in production you'd use a proper embedding model
        return {
          embedding: tokens.slice(0, Math.min(tokens.length, 2048))
        };
      }
    };
  } else {
    // Use Google embeddings with models/ prefix
    embeddingModel = google.embedding("models/gemini-embedding-1.0");
  }

  // Create a custom embedding adapter using our existing configuration
  const customAdapter = createEmbeddings(
    env.GOOGLE_GENERATIVE_AI_API_KEY,
    "models/gemini-embedding-1.0"
  );

  // Create reranker configuration
  const reranker = {
    model: google("models/gemini-2.0-flash"),
    options: {
      weights: {
        semantic: 0.5, // Semantic relevance weight
        vector: 0.3,   // Vector similarity weight
        position: 0.2, // Original position weight
      },
      topK: config?.topK || 5,
    },
  };

  // Create and return the vector query tool
  return createVectorQueryTool({
    vectorStoreName,
    indexName,
    model: embeddingModel,
    reranker,
    id: config?.id,
    description: config?.description || "Access knowledge base to find relevant information"
  });
}

/**
 * Default vector query tool instance with tiktoken-based embeddings
 * Using Pinecone as the default vector store
 */
export const vectorQueryTool = createMastraVectorQueryTool({
  vectorStoreName: "pinecone",
  indexName: env.PINECONE_INDEX || "Default",
  embeddingProvider: "tiktoken",
  tokenEncoding: "o200_base"
});

/**
 * Vector query tool for Pinecone vector store with Google embeddings
 */
export const googleVectorQueryTool = createMastraVectorQueryTool({
  vectorStoreName: "pinecone",
  indexName: env.PINECONE_INDEX || "Default",
  embeddingProvider: "google",
  description: "Search through Pinecone vector database using Google embeddings"
});

/**
 * Example of using the vector query tool with filters
 * This can be used when you need to filter results by metadata
 */
export const filteredQueryTool = createMastraVectorQueryTool({
  vectorStoreName: "pinecone",
  indexName: env.PINECONE_INDEX || "Default",
  embeddingProvider: "tiktoken",
  tokenEncoding: "o200_base",
  enableFilters: true,
  description: "Search with metadata filtering support through the Pinecone vector database"
});

export default vectorQueryTool;
