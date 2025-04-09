/**
 * Model Provider Utilities
 *
 * This module provides utilities for managing different AI model providers,
 * allowing for a centralized location to handle provider configurations and instances.
 *
 * @module provider.utils
 */

import { google } from "@ai-sdk/google";
import { vertex, createVertex } from "@ai-sdk/google-vertex";
import * as fs from "fs";
import * as path from "path";
import { ModelConfig, ModelProvider, ProviderOptions } from "./config.types";

/**
 * Default credentials path for different providers
 */
export const DEFAULT_CREDENTIALS_PATHS = {
  googleVertex: path.resolve(process.cwd(), "gcp-vertexai-credentials.json"),
  // Add other providers' default credential paths here as needed
};

/**
 * Creates an AI model instance based on the specified provider
 *
 * @param provider - The model provider to use
 * @param modelId - The specific model ID to instantiate
 * @param options - Additional provider-specific options
 * @returns A model instance compatible with @mastra/core/agent
 * @throws {Error} If the provider is unsupported or configuration is invalid
 */
export function createModelInstance(
  provider: ModelProvider,
  modelId: string,
  options?: ProviderOptions
): ReturnType<typeof google> | ReturnType<typeof googleVertex> {
  switch (provider) {
    case "google":
      return createGoogleModel(modelId, options?.google);

    case "googleVertex":
      return createVertexModel(
        modelId,
        options?.googleVertex?.credentialsPath,
        options?.googleVertex?.projectId,
        options?.googleVertex?.location,
        options?.googleVertex
      );

    // Add support for additional providers here
    // case "openai":
    //   return createOpenAIModel(modelId, options?.openai);

    default:
      throw new Error(`Unsupported model provider: ${provider}`);
  }
}

/**
 * Creates a Google AI model instance
 *
 * @param modelId - The model ID to use
 * @param options - Additional model options
 * @returns A Google AI model instance
 */
export function createGoogleModel(
  modelId: string,
  options?: Record<string, unknown>
): ReturnType<typeof google> {
  return google(modelId, {
    temperature: options?.temperature as number | undefined,
    topP: options?.topP as number | undefined,
    maxOutputTokens: options?.maxTokens as number | undefined,
    ...options,
  });
}

/**
 * Creates a Google Vertex AI model instance
 *
 * @param modelId - The model ID to use
 * @param credentialsPath - Path to credentials file
 * @param projectId - Google Cloud project ID
 * @param location - Google Cloud region
 * @param options - Additional model options
 * @returns A Google Vertex AI model instance
 * @throws {Error} If credentials file is not found or invalid
 */
export function createVertexModel(
  modelId: string,
  credentialsPath?: string,
  projectId?: string,
  location?: string,
  options?: Record<string, unknown>
): ReturnType<typeof googleVertex> {
  // Get credentials path from options or use default
  const credsPath = credentialsPath || DEFAULT_CREDENTIALS_PATHS.googleVertex;

  // Check if credentials file exists
  if (!fs.existsSync(credsPath)) {
    throw new Error(`Vertex AI credentials file not found at: ${credsPath}`);
  }

  // Read credentials file
  const credentials = JSON.parse(fs.readFileSync(credsPath, "utf-8"));

  // Create Vertex model
  return googleVertex(modelId, {
    temperature: options?.temperature as number | undefined,
    topP: options?.topP as number | undefined,
    maxOutputTokens: options?.maxTokens as number | undefined,
    project: projectId || credentials.project_id,
    location: location || "us-central1",
    googleApplicationCredentials: credentials,
    ...options,
  });
}

/**
 * Loads and validates credentials from a JSON file
 *
 * @param filePath - Path to the credentials file
 * @returns Parsed credentials object
 * @throws {Error} If file doesn't exist or contains invalid JSON
 */
export function loadCredentials(filePath: string): Record<string, unknown> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Credentials file not found at: ${filePath}`);
    }

    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in credentials file: ${error.message}`);
    }
    throw error;
  }
}
