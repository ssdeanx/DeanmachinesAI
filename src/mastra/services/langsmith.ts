/**
 * LangSmith integration service for Mastra AI.
 *
 * Provides tracing and evaluation capabilities for monitoring and
 * improving LLM interactions within Mastra agents.
 */

import { Client as LangSmithClient } from "langsmith";
import { env } from "process";
import { v4 as uuidv4 } from "uuid";

/**
 * Configuration options for LangSmith tracing
 */
export interface LangSmithConfig {
  /** API key for LangSmith access */
  apiKey?: string;
  /** LangSmith API endpoint URL */
  endpoint?: string;
  /** Project name for organizing traces */
  projectName?: string;
  /** Whether to enable tracing */
  enabled?: boolean;
}

/**
 * Global LangSmith client instance
 */
let langsmithClient: LangSmithClient | null = null;

/**
 * Configures LangSmith tracing for the application
 *
 * @param config - Configuration options for LangSmith
 * @returns The configured LangSmith client
 * @throws If LangSmith configuration fails due to missing API key
 */
export function configureLangSmithTracing(
  config?: LangSmithConfig
): LangSmithClient | null {
  // Skip if explicitly disabled
  if (config?.enabled === false) {
    return null;
  }

  // Use existing client if available
  if (langsmithClient) {
    return langsmithClient;
  }

  try {
    const apiKey = config?.apiKey || env.LANGSMITH_API_KEY;
    const endpoint = config?.endpoint || env.LANGSMITH_ENDPOINT;

    if (!apiKey) {
      console.warn("LangSmith API key not provided, tracing disabled");
      return null;
    }

    // Set environment variables that LangSmith SDK relies on
    process.env.LANGCHAIN_TRACING_V2 = env.LANGSMITH_TRACING_V2 || "true";
    process.env.LANGCHAIN_ENDPOINT =
      endpoint || "https://api.smith.langchain.com";
    process.env.LANGCHAIN_API_KEY = apiKey;
    process.env.LANGCHAIN_PROJECT = config?.projectName || "DeanmachinesAI";

    // Create LangSmith client
    langsmithClient = new LangSmithClient({
      apiKey,
      apiUrl: endpoint || "https://api.smith.langchain.com",
    });

    console.log("LangSmith tracing configured successfully");
    return langsmithClient;
  } catch (error) {
    console.error("Failed to configure LangSmith tracing:", error);
    return null;
  }
}

/**
 * Creates a new LangSmith run for tracking a specific operation
 *
 * @param name - Name of the operation to trace
 * @param tags - Optional tags for categorizing the run
 * @returns A Promise resolving to the run ID for tracking the operation, or a fallback UUID
 */
export async function createLangSmithRun(
  name: string,
  tags?: string[]
): Promise<string> {
  if (!langsmithClient) {
    configureLangSmithTracing();
  }

  if (!langsmithClient) {
    // Fallback to generating a UUID if LangSmith is unavailable
    return Promise.resolve(uuidv4());
  }

  // Generate a UUID locally to use as the run ID
  const runId = uuidv4();

  try {
    // Attempt to create the run in LangSmith, potentially passing the generated ID
    // Note: createRun might return void, so we don't rely on its return value for the ID.
    await langsmithClient.createRun({
      id: runId, // Pass the generated UUID as the run ID if supported
      name,
      run_type: "tool",
      inputs: {}, // Add required inputs property
      extra: {
        tags: tags || [],
        timestamp: new Date().toISOString(),
      },
    });

    // Return the locally generated UUID
    return runId;
  } catch (error) {
    console.error("Error creating LangSmith run:", error);
    return uuidv4(); // Fallback UUID on error
  }
}

/**
 * Tracks feedback for a specific operation in LangSmith
 *
 * @param runId - The ID of the run to attach feedback to
 * @param feedback - Feedback information (rating, comment, etc.)
 * @returns Boolean indicating success or failure
 */
export async function trackFeedback(
  runId: string,
  feedback: {
    score?: number;
    comment?: string;
    key?: string;
    value?: any;
  }
): Promise<boolean> {
  if (!langsmithClient) {
    configureLangSmithTracing();
  }

  if (!langsmithClient) {
    console.warn("LangSmith client not available, feedback not tracked");
    return false;
  }

  try {
    const feedbackKey = feedback.key || "accuracy";
    await langsmithClient.createFeedback(runId, feedbackKey, {
      score: feedback.score,
      comment: feedback.comment,
      value: feedback.value,
    });
    return true;
  } catch (error) {
    console.error("Error tracking feedback in LangSmith:", error);
    return false;
  }
}

// Initialize LangSmith on module import
configureLangSmithTracing();
