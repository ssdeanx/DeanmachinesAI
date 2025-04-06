/**
 * Database configuration for memory persistence using LibSQL.
 *
 * This module sets up the LibSQL adapter for Mastra memory persistence,
 * allowing agent conversations and context to be stored reliably.
 */

import { LibSQLStore } from "@mastra/core/storage/libsql";
import { LibSQLVector } from "@mastra/core/vector/libsql";
import { Memory } from "@mastra/memory";
import { env } from "process";
import { createEmbeddings } from "./vector-store"; // This returns GoogleGenerativeAIEmbeddings

/**
 * Options for configuring memory persistence
 */
export interface MemoryOptions {
  /** Database URL for LibSQL/Turso */
  databaseUrl?: string;
  /** Authentication token for database access */
  authToken?: string;
  /** Number of recent messages to include in context */
  lastMessages?: number;
  /** Whether to enable working memory */
  enableWorkingMemory?: boolean;
  /** Token limit to prevent context overflow */
  tokenLimit?: number;
  /** Options for semantic recall */
  semanticRecallOptions?: {
    /** Number of top results to return */
    topK?: number;
    /** Range of messages around matches to include */
    messageRange?: {
      before?: number;
      after?: number;
    };
  };
}

/**
 * Creates a configured Memory instance with LibSQL persistence
 *
 * @param options - Configuration options for memory setup
 * @returns A configured Memory instance ready for use with agents
 * @throws If memory initialization fails due to missing credentials
 */
export function createMemory(options?: MemoryOptions): Memory {
  // Set up the LibSQL adapter for persistent storage
  const dbUrl = options?.databaseUrl || env.TURSO_DATABASE_URL;
  const dbToken = options?.authToken || env.TURSO_DATABASE_KEY;

  if (!dbUrl || !dbToken) {
    throw new Error(
      "Missing required database credentials. Check TURSO_DATABASE_URL and TURSO_DATABASE_KEY."
    );
  }

  const dbConfig = {
    url: dbUrl,
    authToken: dbToken,
  };

  // Create storage and vector store using the same database
  const storageAdapter = new LibSQLStore({ config: dbConfig });
  const vectorStore = new LibSQLVector({ connectionUrl: dbUrl, authToken: dbToken });

  // Create embeddings instance that already conforms to Mastra's requirements
  const embeddings = createEmbeddings();

  // Create and return the configured memory instance
  return new Memory({
    storage: storageAdapter,
    vector: vectorStore,
    embedder: embeddings,
    options: {
      lastMessages: options?.lastMessages || 20,
      semanticRecall: {
        topK: options?.semanticRecallOptions?.topK || 5,
        messageRange: {
          before: options?.semanticRecallOptions?.messageRange?.before || 2,
          after: options?.semanticRecallOptions?.messageRange?.after || 1,
        },
      },
      workingMemory: {
        enabled: options?.enableWorkingMemory ?? true,
      },
      threads: {
        generateTitle: true,
      },
    },
  });
}

/**
 * Exports the default memory instance for use throughout the application
 */
export const memory = createMemory();
