/**
 * Model Provider Utilities
 *
 * This module provides utilities for setting up and configuring AI model providers.
 * It handles provider client setup and credential management, but NOT model instantiation.
 *
 * @module provider.utils
 */

import { google } from "@ai-sdk/google";
import { createVertex } from "@ai-sdk/google-vertex";
import { env } from "process";
import { util } from "zod";

/** Supported model providers */
export type ModelProvider = "google" | "vertex";

/** Options for configuring the Google AI provider setup */
export type GoogleOptions = Partial<Pick<GoogleProviderConfig, 'apiKey'>>;

/** Options for configuring the Google Vertex AI provider setup */
export type GoogleVertexOptions = Partial<Pick<VertexProviderConfig, 'projectId' | 'location'>>;

/** Union type for all provider setup options */
export type ProviderSetupOptions = GoogleOptions | GoogleVertexOptions;


/**
 * Configuration for Google AI provider
 */
export interface GoogleProviderConfig {
  /** API Key for Google AI */
  apiKey: string;
}

/**
 * Configuration for Google Vertex AI provider
 */
export interface VertexProviderConfig {
  /** Project ID for Vertex AI */
  projectId: string;
  /** Location for Vertex AI */
  location: string;
  /** Credentials for Vertex AI */
  credentials: Record<string, unknown>;
}

/**
 * Generic provider configuration type
 */
export type ProviderConfig = GoogleProviderConfig | VertexProviderConfig;

/**
 * Sets up the Google AI provider configuration
 *
 * @param options - Google AI specific options
 * @returns Google AI provider configuration
 * @throws {Error} If API key is not provided and not available in environment
 */
export function setupGoogleProvider(
  options?: GoogleOptions
): GoogleProviderConfig {
  // Use API key from options, environment variable, or throw error
  const apiKey =
    options?.apiKey ||
    env.GOOGLE_GENERATIVE_AI_API_KEY ||
    env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Google API key not provided in options or environment variables (GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_AI_API_KEY)"
    );
  }

  return { apiKey };
}

/**
 * Creates a Google AI client configuration object
 *
 * @param config - Google provider configuration
 * @param config - Google provider configuration (contains validated apiKey)
 * @returns Google AI client configuration for @ai-sdk/google
 */
export function createGoogleClientConfig(
  // config parameter is currently unused as the SDK reads the API key from the environment.
  // It's kept for potential future configuration options.
  config: GoogleProviderConfig
): Parameters<typeof google>[1] {
  // The @ai-sdk/google provider automatically uses the
  // GOOGLE_GENERATIVE_AI_API_KEY environment variable.
  // The config object passed here is for other settings (e.g., baseURL, headers).
  // setupGoogleProvider ensures the API key exists in the environment or options.
  return {};
}

/**
 * Sets up the Google Vertex AI provider configuration
 *
 * @param options - Vertex AI specific options
 * @returns Vertex AI provider configuration
 * @throws {Error} If required environment variables are not available
 */
export function setupVertexProvider(
  options?: GoogleVertexOptions
): VertexProviderConfig {
  // Get project ID from options or environment
  const projectId = options?.projectId || env.GOOGLE_VERTEX_PROJECT;

  if (!projectId) {
    throw new Error(
      "Vertex AI project ID not found in options or environment variable GOOGLE_VERTEX_PROJECT"
    );
  }

  // Get location from options or environment
  const location = options?.location || env.GOOGLE_VERTEX_LOCATION || "us-central1";

  // Use service account credentials from environment if available
  const credentials: Record<string, unknown> = {
    client_email: env.GOOGLE_CLIENT_EMAIL,
    private_key: env.GOOGLE_PRIVATE_KEY,
    // For direct usage without a JSON file, we may need just the key parts
    // or rely on application default credentials when deployed
  };

  return {
    projectId,
    location,
    credentials,
  };
}

/**
 * Creates a Vertex AI client configuration
 *
 * @param config - Vertex provider configuration
 * @returns Vertex AI client configuration for @ai-sdk/google-vertex
 */
export function createVertexClientConfig(
  config: VertexProviderConfig
): ReturnType<typeof createVertex> {
  return createVertex({
    project: config.projectId,
    location: config.location,
    // Credentials are often handled via environment variables (GOOGLE_APPLICATION_CREDENTIALS)
    // or Application Default Credentials (ADC) when running on GCP.
    // Explicitly passing credentials here might be needed in specific scenarios.
    // If config.credentials contains the necessary structure, pass it here.
    // Example (if credentials are a service account key object):
    // credentials: config.credentials,
  });
}

/**
 * Gets the appropriate provider configuration based on provider type
 *
 * @param provider - The model provider to configure
 * @param options - Provider-specific options
 * @returns Provider configuration object
 * @throws {Error} If provider is unsupported
 */
export function getProviderConfig(
  provider: ModelProvider,
  options?: Record<string, unknown>
): ProviderConfig {
  switch (provider) {
    case "google":
      return setupGoogleProvider(options as GoogleOptions);
    case "vertex":
      return setupVertexProvider(options as GoogleVertexOptions);
    default:
      throw new Error(`Unsupported model provider: ${provider}`);
  }
}
