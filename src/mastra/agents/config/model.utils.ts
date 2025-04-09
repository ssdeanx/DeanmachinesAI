/**
 * Model Utility Functions
 *
 * This module provides utility functions for creating AI model instances
 * based on configuration settings, supporting multiple providers.
 *
 * @module model.utils
 */

import { google } from "@ai-sdk/google";
import { vertex, createVertex } from "@ai-sdk/google-vertex";
import * as fs from "fs";
import * as path from "path";
import { ModelConfig, ModelProvider } from "./config.types";

/**
 * Default vertex credentials file path
 */
const DEFAULT_VERTEX_CREDENTIALS_PATH = path.resolve(
  process.cwd(),
  "gcp-vertexai-credentials.json"
);

/**
 * Model creation options
 */
export interface ModelCreationOptions {
  /** Path to Google Vertex AI credentials JSON file */
  vertexCredentialsPath?: string;

  /** Project ID for Vertex AI */
  vertexProjectId?: string;

  /** Location for Vertex AI */
  vertexLocation?: string;
}

/**
 * Creates a model instance based on the provided configuration
 *
 * @param modelConfig - Configuration for the model
 * @param options - Additional options for model creation
 * @returns A model instance compatible with @mastra/core/agent
 * @throws {Error} If the model provider is unsupported or configuration is invalid
 */
export function createModelFromConfig(
  modelConfig: ModelConfig,
  options: ModelCreationOptions = {}
): ReturnType<typeof google> | ReturnType<typeof vertex> {
  try {
    const { provider, modelId, temperature, topP, maxTokens, providerOptions } =
      modelConfig;

    switch (provider) {
      case "google":
        return google(modelId, {
          generationConfig: {
            temperature,
            topP,
            maxOutputTokens: maxTokens,
          },
          ...providerOptions?.google,
        });

      case "vertex": {
        // Get credentials path from options or use default
        const credentialsPath =
          options.vertexCredentialsPath || DEFAULT_VERTEX_CREDENTIALS_PATH;

        // Check if credentials file exists
        if (!fs.existsSync(credentialsPath)) {
          throw new Error(
            `Vertex AI credentials file not found at: ${credentialsPath}`
          );
        }

        // Read credentials file
        const credentials = JSON.parse(
          fs.readFileSync(credentialsPath, "utf-8")
        );

        // Create Vertex configuration
        const vertexConfig = createVertex({
          project: options.vertexProjectId || credentials.project_id,
          location: options.vertexLocation || "us-central1",
          googleApplicationCredentials: credentials,
        });

        // Create and return Vertex model instance
        return vertex(modelId, {
          temperature,
          topP,
          maxOutputTokens: maxTokens,
          ...providerOptions?.vertex,
        });
      }

      default:
        throw new Error(`Unsupported model provider: ${provider}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to create model: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Creates a Google AI model instance with default settings
 *
 * @param modelId - Model ID to use
 * @param options - Additional model options
 * @returns A Google AI model instance
 */
export function createGoogleModel(
  modelId: string,
  options?: Record<string, unknown>
): ReturnType<typeof google> {
  return createModelFromConfig(
    {
      provider: "google",
      modelId,
      ...options,
    },
    {}
  ) as ReturnType<typeof google>;
}

/**
 * Creates a Google Vertex AI model instance with default settings
 *
 * @param modelId - Model ID to use
 * @param credentialsPath - Optional path to credentials file
 * @param options - Additional model options
 * @returns A Google Vertex AI model instance
 */
export function createVertexModel(
  modelId: string,
  credentialsPath?: string,
  options?: Record<string, unknown>
): ReturnType<typeof vertex> {
  return createModelFromConfig(
    {
      provider: "vertex",
      modelId,
      ...options,
    },
    { vertexCredentialsPath: credentialsPath }
  ) as ReturnType<typeof vertex>;
}
