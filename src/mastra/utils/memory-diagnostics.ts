/**
 * Extremely simplified memory diagnostics utility
 */

import { randomUUID } from "crypto";
import { memory } from "../database";

/**
 * Run a simple memory diagnostic test
 *
 * @returns Diagnostic result
 */
export async function runMemoryDiagnostics() {
  try {
    // Generate test IDs
    const testId = randomUUID();
    const threadId = `test-thread-${testId}`;
    const testContent = `Test message created at ${new Date().toISOString()}`;

    console.log("Creating test thread...");
    await memory.createThread({
      resourceId: testId,
      threadId,
      title: `Test Thread`,
      metadata: { test: true },
    });

    console.log("Adding test message...");
    await memory.addMessage({
      threadId,
      role: "user",
      content: testContent,
      type: "text",
    });

    console.log("Retrieving thread...");
    const thread = await memory.getThreadById({ threadId });

    return {
      success: true,
      threadInfo: thread,
      testId,
    };
  } catch (error) {
    console.error("Memory diagnostic failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
