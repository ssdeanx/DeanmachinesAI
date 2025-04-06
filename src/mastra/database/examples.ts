/**
 * Example usage of memory persistence in agents
 *
 * This file demonstrates how to use memory persistence to maintain context
 * across multiple interactions with the same user or topic.
 */

import { randomUUID } from "crypto";
import { researchAgent, writerAgent } from "../agents";
import { threadManager } from "../utils";

/**
 * Demonstrates how to use memory persistence in a conversation with proper thread management
 */
export async function memoryConversationExample() {
  // Generate a consistent user ID (in a real app, this would be your actual user ID)
  const userId = "user_123";

  // Get or create a thread for this user - ensures consistent thread ID
  const threadInfo = threadManager.getOrCreateThread(userId, {
    conversationType: "research",
    startDate: new Date().toISOString(),
  });

  console.log(`Starting a conversation with user ${userId} using thread ${threadInfo.id}`);

  // Use the consistent thread ID for all interactions
  const response1 = await researchAgent.stream(
    "I need to research the impact of AI on healthcare diagnostics. Can you help me organize this research?",
    {
      threadId: threadInfo.id,
      resourceId: userId,
    }
  );

  console.log("First response received");

  // Follow-up message using the same thread ID
  const response2 = await researchAgent.stream(
    "What specific areas should I focus on first?",
    {
      threadId: threadInfo.id,
      resourceId: userId,
    }
  );

  console.log("Second response received");

  // Simulate returning later - retrieve the same thread
  console.log("Simulating user returning after some time...");

  // Get the same thread for the returning user
  const existingThread = threadManager.getMostRecentThread(userId);

  if (!existingThread) {
    console.error("Thread not found for returning user - this shouldn't happen!");
    return;
  }

  console.log(`Retrieved existing thread ${existingThread.id} for returning user ${userId}`);

  // The agent will have access to the previous conversation history
  const response3 = await researchAgent.stream(
    "Can you remind me what we were researching last time and what areas you suggested I focus on?",
    {
      threadId: existingThread.id,
      resourceId: userId,
    }
  );

  console.log("Memory recall complete");

  return {
    threadId: existingThread.id,
    userId,
  };
}

/**
 * Demonstrates how memory can be shared between different agent types with consistent thread IDs
 */
export async function multiAgentMemoryExample() {
  const userId = "user_456";

  // Create a consistent thread for multi-agent workflow
  const threadInfo = threadManager.createThread({
    resourceId: userId,
    metadata: {
      workflowType: "research-to-writing",
      project: "quantum-computing-blog",
    },
  });

  console.log(`Starting multi-agent workflow with shared thread ${threadInfo.id}`);

  // First agent (Research) gathers information
  const researchResponse = await researchAgent.stream(
    "I need information about quantum computing for a technical blog post.",
    {
      threadId: threadInfo.id, // Use the same thread ID for all agents
      resourceId: userId,
    }
  );

  console.log("Research complete, transferring to writer agent");

  // Second agent (Writer) uses the same memory context to continue the work
  const writerResponse = await writerAgent.stream(
    "Based on the research we just did, can you draft an introduction for a technical blog post on quantum computing?",
    {
      threadId: threadInfo.id, // Same thread ID ensures memory continuity
      resourceId: userId,
    }
  );

  console.log("Writer agent has accessed research context and completed the draft");

  return {
    threadId: threadInfo.id,
    userId,
  };
}

/**
 * Helper function to test if memory is correctly reading from the database
 *
 * @param threadId - Thread ID to debug
 * @param userId - User ID associated with the thread
 */
export async function debugMemoryReading(threadId: string, userId: string) {
  console.log(`Testing memory reading for thread ${threadId} and user ${userId}`);

  try {
    // Direct memory verification via agent
    const response = await researchAgent.stream(
      "This is a memory test. If you can see previous messages in this thread, please summarize them briefly.",
      {
        threadId,
        resourceId: userId,
        // Use explicit memory options to ensure reading happens
        memoryOptions: {
          lastMessages: 50, // Request a larger message history
          semanticRecall: {
            topK: 10, // Request more semantic matches
            messageRange: {
              before: 5,
              after: 5,
            },
          },
        },
      }
    );

    console.log("Memory reading test complete");
    console.log("If the agent couldn't recall previous messages, check database connection");

    return { success: true, threadId, userId };
  } catch (error) {
    console.error("Error testing memory reading:", error);
    return { success: false, error, threadId, userId };
  }
}
