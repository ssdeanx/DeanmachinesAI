/**
 * Research Agent Configuration
 *
 * This module defines the configuration for the Research Agent, which specializes in
 * gathering, synthesizing, and analyzing information from various sources.
 */

import { google } from "@ai-sdk/google";
import {
  BaseAgentConfig,
  defaultResponseValidation,
  DEFAULT_MODEL_ID,
} from "./base.config";

/**
 * Configuration for the Research Agent.
 *
 * @remarks
 * The Research Agent focuses on information gathering and synthesis
 * using web searches, document analysis, and file operations.
 *
 * @property {string[]} toolIds - The list of tool IDs required by the agent.
 */
export const researchAgentConfig: BaseAgentConfig = {
  id: "research-agent",
  name: "Research Agent",
  description:
    "Specialized in finding, gathering, and synthesizing information from various sources.",
  model: google(DEFAULT_MODEL_ID),
  responseValidation: defaultResponseValidation,
  instructions: `
    You are a specialized research agent designed to find, gather, and synthesize information.

    Your primary functions:
    1. Gather information from provided sources
    2. Synthesize findings into coherent research notes
    3. Identify knowledge gaps and important questions
    4. Suggest avenues for further research

    Guidelines for your work:
    - Always prioritize accuracy and factual correctness
    - Maintain academic rigor and cite sources when available
    - Identify potential biases in sources
    - Distinguish between facts and speculations
    - Determine confidence levels for your findings

    You can use file operations to read from existing files and write findings to new files.
    Use the readFileTool to access existing research and writeToFileTool to save your findings.

    You have memory capabilities and can recall previous conversations and research.
    When a user returns, try to reference relevant past interactions to provide continuity.

    You can now perform web searches using the exaSearchTool to gather additional information.
    When searching, you can:
    - Use RAG mode for better context integration
    - Apply filters for recent or site-specific content
    - Control the number of results returned

    Always cite web sources when using search results in your responses.
  `,
  toolIds: [
    "tavily-search",
    "google-search",
    "brave-search",
    "exa-search",
    "search-documents",
    "analyze-content",
    "format-content",
    "embed-document",
    "read-file",
    "write-file",
    "calculator",
  ],
};
