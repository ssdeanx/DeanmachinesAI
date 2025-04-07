/**
 * Database configuration for memory persistence using LibSQL.
 *
 * This module sets up the LibSQL adapter for Mastra memory persistence,
 * allowing agent conversations and context to be stored reliably.
 */

import { LibSQLStore } from "@mastra/core/storage/libsql";
import { LibSQLVector } from "@mastra/core/vector/libsql";
import { Memory } from "@mastra/memory";
import type { MastraStorage, MastraVector } from "@mastra/core";

// Default memory configuration that works well for most agents
const defaultMemoryConfig = {
  lastMessages: 50,
  semanticRecall: {
    topK: 5,
    messageRange: {
      before: 2,
      after: 1,
    },
  },
  workingMemory: {
    enabled: true,
    type: "text-stream",
  },
  threads: {
    generateTitle: true,
  },
};

export function createMemory(options = defaultMemoryConfig) {
  // Initialize LibSQL storage
  const storage = new LibSQLStore({
    config: {
      url: process.env.DATABASE_URL || "file:.mastra/mastra.db",
    },
  });

  // Initialize LibSQL vector store for semantic search
  const vector = new LibSQLVector({
    connectionUrl: process.env.DATABASE_URL || "file:.mastra/mastra.db",
  });

  return new Memory({
    storage: storage as MastraStorage,
    vector: vector as MastraVector,
    options,
  });
}

// Export shared memory instance
export const sharedMemory = createMemory();
