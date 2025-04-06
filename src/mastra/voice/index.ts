/**
 * Voice module for Mastra
 *
 * This module provides voice capabilities for Mastra agents,
 * including text-to-speech, speech-to-text, and speech-to-speech
 * functionalities using different provider implementations.
 */

import { MastraVoice } from "@mastra/core/voice";
import { createGoogleVoice } from "./googlevoice";
import { createElevenLabsVoice } from "./elevenlabs";

/**
 * Available voice provider types
 */
export enum VoiceProvider {
  GOOGLE = "google",
  ELEVENLABS = "elevenlabs",
}

/**
 * Configuration for voice providers
 */
export interface VoiceConfig {
  /** Provider type to use */
  provider: VoiceProvider;
  /** API key for the voice service */
  apiKey?: string;
  /** Default speaker ID */
  speaker?: string;
  /** Provider-specific options */
  options?: Record<string, unknown>;
}

/**
 * Create a voice provider based on the specified configuration
 *
 * @param config - Voice provider configuration
 * @returns Configured voice provider instance
 * @throws Error if the specified provider is not supported
 */
export function createVoice(config: VoiceConfig): MastraVoice {
  switch (config.provider) {
    case VoiceProvider.GOOGLE:
      return createGoogleVoice({
        apiKey: config.apiKey,
        speaker: config.speaker,
        ...(config.options as any),
      });

    case VoiceProvider.ELEVENLABS:
      return createElevenLabsVoice({
        apiKey: config.apiKey,
        speaker: config.speaker,
        modelName: (config.options as any)?.modelName,
      });

    default:
      throw new Error(`Unsupported voice provider: ${config.provider}`);
  }
}

/**
 * Helper to get a Google voice provider with default settings
 *
 * @returns Google voice provider instance
 */
export function getGoogleVoice(): MastraVoice {
  return createGoogleVoice();
}

/**
 * Helper to get an ElevenLabs voice provider with default settings
 *
 * @returns ElevenLabs voice provider instance
 */
export function getElevenLabsVoice(): MastraVoice {
  return createElevenLabsVoice();
}

// Export all voice-related functions and types
export { createGoogleVoice } from "./googlevoice";
export { createElevenLabsVoice } from "./elevenlabs";

// Re-export the MastraVoice type for external use
export type { MastraVoice };
