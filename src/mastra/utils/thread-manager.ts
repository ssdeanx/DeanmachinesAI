/**
 * Thread Manager for consistent memory persistence
 *
 * This utility helps manage thread IDs consistently across conversations,
 * ensuring that memory context is properly maintained and retrieved.
 */

import { randomUUID } from "crypto";

/**
 * Thread information with creation metadata
 */
interface ThreadInfo {
  /** Unique thread identifier */
  id: string;
  /** User or entity associated with the thread */
  resourceId: string;
  /** When the thread was created */
  createdAt: Date;
  /** Optional metadata for thread categorization */
  metadata?: Record<string, unknown>;
}

/**
 * Thread creation options
 */
interface CreateThreadOptions {
  /** Optional predefined thread ID (generates UUID if not provided) */
  threadId?: string;
  /** User or entity associated with the thread */
  resourceId: string;
  /** Optional metadata for thread categorization */
  metadata?: Record<string, unknown>;
}

/**
 * Manages conversation threads to ensure consistent memory access
 */
export class ThreadManager {
  private threads: Map<string, ThreadInfo> = new Map();
  private resourceThreads: Map<string, Set<string>> = new Map();

  /**
   * Creates a new conversation thread
   *
   * @param options - Thread creation options
   * @returns Thread information including the ID
   */
  public createThread(options: CreateThreadOptions): ThreadInfo {
    const threadId = options.threadId || randomUUID();

    const threadInfo: ThreadInfo = {
      id: threadId,
      resourceId: options.resourceId,
      createdAt: new Date(),
      metadata: options.metadata,
    };

    this.threads.set(threadId, threadInfo);

    // Track threads by resource ID for easier lookup
    if (!this.resourceThreads.has(options.resourceId)) {
      this.resourceThreads.set(options.resourceId, new Set());
    }
    this.resourceThreads.get(options.resourceId)?.add(threadId);

    return threadInfo;
  }

  /**
   * Retrieves a thread by its ID
   *
   * @param threadId - The ID of the thread to retrieve
   * @returns Thread information or undefined if not found
   */
  public getThread(threadId: string): ThreadInfo | undefined {
    return this.threads.get(threadId);
  }

  /**
   * Gets all threads associated with a resource ID
   *
   * @param resourceId - The resource ID to look up threads for
   * @returns Array of thread information objects
   */
  public getThreadsByResource(resourceId: string): ThreadInfo[] {
    const threadIds = this.resourceThreads.get(resourceId) || new Set();
    return Array.from(threadIds)
      .map((id) => this.threads.get(id))
      .filter((thread): thread is ThreadInfo => thread !== undefined);
  }

  /**
   * Gets the most recent thread for a resource
   *
   * @param resourceId - The resource ID to find the most recent thread for
   * @returns Most recent thread information or undefined if none exists
   */
  public getMostRecentThread(resourceId: string): ThreadInfo | undefined {
    const threads = this.getThreadsByResource(resourceId);

    if (threads.length === 0) {
      return undefined;
    }

    return threads.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0];
  }

  /**
   * Creates or retrieves a thread for a resource ID
   *
   * @param resourceId - The resource ID to get or create a thread for
   * @param metadata - Optional metadata for the thread if created
   * @returns Thread information with a consistent ID
   */
  public getOrCreateThread(
    resourceId: string,
    metadata?: Record<string, unknown>
  ): ThreadInfo {
    const existingThread = this.getMostRecentThread(resourceId);

    if (existingThread) {
      return existingThread;
    }

    return this.createThread({ resourceId, metadata });
  }
}

// Export a singleton instance for app-wide use
export const threadManager = new ThreadManager();
