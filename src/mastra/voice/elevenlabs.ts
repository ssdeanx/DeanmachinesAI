/**
 * ElevenLabs Voice implementation for Mastra
 *
 * This module provides high-quality text-to-speech capabilities
 * using the ElevenLabs API with the Mastra voice interface.
 */

import { MastraVoice } from "@mastra/core/voice";
import { ElevenLabsVoice } from "@mastra/voice-elevenlabs";

/**
 * Interface for ElevenLabs voice configuration options
 */
interface ElevenLabsConfig {
  /** API key for ElevenLabs services */
  apiKey?: string;
  /** Default speaker/voice ID */
  speaker?: string;
  /** Model name to use for speech synthesis */
  modelName?: string;
}

/**
 * Create an ElevenLabs voice provider with the specified configuration
 *
 * @param config - Configuration options for the ElevenLabs voice provider
 * @returns Configured ElevenLabs voice provider instance
 * @throws Error if required environment variables are missing
 */
export function createElevenLabsVoice(
  config: ElevenLabsConfig = {}
): MastraVoice {
  const apiKey = config.apiKey || process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ElevenLabs API key is required. Set ELEVENLABS_API_KEY environment variable or pass apiKey in config."
    );
  }



  const voiceName = config.speaker || "9BWtsMINqrJLrRacOk9x";
  return new ElevenLabsVoice({
    speechModel: {
      apiKey,
    },
    speaker: voiceName, // Use the defined voiceName variable

  });
}
