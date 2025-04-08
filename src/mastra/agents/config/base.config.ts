/**
 * Base Agent Configuration
 *
 * This module defines the core configuration types and shared settings
 * for all agents in the system. It serves as a foundation for more
 * specialized agent configurations.
 */

// Import the actual model type if available, otherwise use a placeholder
import { LanguageModelV1 } from "@ai-sdk/provider"; // Use the actual type from the SDK

/** Default Google AI Model ID */
export const DEFAULT_MODEL_ID = "models/gemini-2.0-flash";

/** Default Maximum Tokens for Model Output */
export const DEFAULT_MAX_TOKENS = 8192;

/** Default Maximum Context Tokens for Model Input */
export const DEFAULT_MAX_CONTEXT_TOKENS = 1000000;

/**
 * Response hook options interface
 */
export interface ResponseHookOptions {
  minResponseLength?: number;
  maxAttempts?: number;
  validateResponse?: (response: any) => boolean;
}

/**
 * Base configuration interface for all agent configs
 *
 * @interface BaseAgentConfig
 */
export interface BaseAgentConfig {
  /** Unique identifier for the agent */
  id: string;

  /** Display name of the agent */
  name: string;

  /** Brief description of the agent's purpose and capabilities */
  description: string;

  /** The AI model instance (e.g., from google(), openai()) */
  model: LanguageModelV1; // Use the imported type from the SDK

  /** Main instructions that define the agent's behavior */
  instructions: string;

  /** Tool IDs that this agent has access to */
  toolIds: string[];

  /** Optional response validation settings */
  responseValidation?: ResponseHookOptions;
}

/**
 * Standard response validation options
 * These settings help ensure high-quality agent responses
 */
export const defaultResponseValidation: ResponseHookOptions = {
  minResponseLength: 20,
  maxAttempts: 2,
  validateResponse: (response: any) => {
    if (response.object) {
      return Object.keys(response.object).length > 0;
    }
    return response.text ? response.text.length >= 20 : false;
  },
};

/**
 * Standard error handler function for agents
 */
export const defaultErrorHandler = async (error: Error) => {
  console.error("Agent error:", error);
  return {
    text: "I encountered an error. Please try again or contact support.",
    error: error.message,
  };
};
