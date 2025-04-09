/**
 * Agent Configuration Type Definitions
 *
 * This module defines shared types and interfaces for agent configurations,
 * ensuring consistent typing across the agent configuration system.
 *
 * @module config.types
 */

import { z } from "zod";
import { google } from "@ai-sdk/google";
import { vertex, createVertex } from "@ai-sdk/google-vertex";
import { Tool } from "@mastra/core/tools";

// ========== MODEL PROVIDER CONFIGURATION ==========

/**
 * Supported AI model providers
 */
export type ModelProvider = "google" | "vertex" | "openai";

/**
 * Options specific to Google Vertex AI
 */
export interface GoogleVertexOptions {
  /** Project ID for Vertex AI */
  projectId?: string;

  /** Location for Vertex AI */
  location?: string;

  /** Path to credentials file */
  credentialsPath?: string;

  /** Model-specific options */
  [key: string]: unknown;
}

/**
 * Options specific to Google AI
 */
export interface GoogleOptions {
  /** API Key for Google AI */
  apiKey?: string;

  /** Model-specific options */
  [key: string]: unknown;
}

/**
 * Options specific to OpenAI
 */
export interface OpenAIOptions {
  /** API Key for OpenAI */
  apiKey?: string;

  /** Organization ID for OpenAI */
  organizationId?: string;

  /** Model-specific options */
  [key: string]: unknown;
}

/**
 * Provider-specific options
 */
export interface ProviderOptions {
  /** Google AI specific options */
  google?: GoogleOptions;

  /** Google Vertex AI specific options */
  googleVertex?: GoogleVertexOptions;

  /** OpenAI specific options */
  openai?: OpenAIOptions;
}

/**
 * Model configuration options
 */
export interface ModelConfig {
  /** The provider to use for this agent */
  provider: ModelProvider;

  /** Model ID to use (e.g., "gemini-2.0-flash") */
  modelId: string;

  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Temperature for generation (0-1) */
  temperature?: number;

  /** Top-p for sampling */
  topP?: number;

  /** Provider-specific options */
  providerOptions?: ProviderOptions;
}

// ========== RESPONSE VALIDATION CONFIGURATION ==========

/**
 * Response hook options interface for agent response validation
 */
export interface ResponseHookOptions {
  /** Minimum length of valid responses (in characters) */
  minResponseLength?: number;

  /** Maximum number of attempts to generate a valid response */
  maxAttempts?: number;

  /** Custom validation function for response content */
  validateResponse?: (response: unknown) => boolean;
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

  /**
   * Model instance from @ai-sdk
   * Can be from google() or googleVertex()
   */
  model: ReturnType<typeof google> | ReturnType<typeof googleVertex>;

  /** Main instructions that define the agent's behavior */
  instructions: string;

  /** Tool IDs that this agent has access to */
  toolIds: string[];

  /** Optional response validation settings */
  responseValidation?: ResponseHookOptions;

  /** Optional model configuration for creating the model dynamically */
  modelConfig?: ModelConfig;
}

/**
 * Agent configuration type that can be used with z.infer<>
 * This is a Zod schema version of BaseAgentConfig for validation
 */
export const AgentConfigSchema = z.object({
  id: z.string().min(1, "Agent ID is required"),
  name: z.string().min(1, "Agent name is required"),
  description: z.string(),
  model: z.any(), // Can't strictly type the Google model return type with Zod
  instructions: z.string().min(10, "Instructions must be meaningful"),
  toolIds: z.array(z.string()).min(1, "At least one tool ID is required"),
  responseValidation: z
    .object({
      minResponseLength: z.number().int().positive().optional(),
      maxAttempts: z.number().int().positive().optional(),
      validateResponse: z.function().optional(),
    })
    .optional(),
});

/**
 * Type for agent configuration objects using Zod schema
 */
export type ValidatedAgentConfig = z.infer<typeof AgentConfigSchema>;

/**
 * Interface representing an initialized agent tool record
 */
export interface AgentToolRecord {
  [toolId: string]: Tool<any, any>;
}

/**
 * Represents a record of agent capabilities by capability name
 */
export interface AgentCapabilities {
  [capability: string]: boolean;
}

/**
 * Agent initialization options for creating agent instances
 */
export interface AgentInitOptions {
  /** The agent configuration object */
  config: BaseAgentConfig;

  /** Optional set of override tools */
  tools?: AgentToolRecord;

  /** Whether to validate the configuration */
  validate?: boolean;
}

/**
 * Agent error handler function signature
 */
export type AgentErrorHandler = (error: Error) => Promise<{ text: string }>;

/**
 * Export type definitions to be used elsewhere in the system
 */
export type { BaseAgentConfig };
