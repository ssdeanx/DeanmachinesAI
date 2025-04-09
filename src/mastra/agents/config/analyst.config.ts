/**
 * Analyst Agent Configuration
 *
 * This module defines the specific configuration for the Analyst Agent,
 * which specializes in interpreting data, identifying patterns,
 * and extracting meaningful insights.
 */

import { google } from "@ai-sdk/google";
import {
  BaseAgentConfig,
  defaultResponseValidation,
  DEFAULT_MODEL_ID, // Import the shared constant
} from "./base.config";

/**
 * Configuration for the Analyst Agent
 *
 * @remarks
 * The Analyst Agent focuses on analyzing information, identifying trends and patterns,
 * and extracting meaningful insights from various data sources.
 */
export const analystAgentConfig: BaseAgentConfig = {
  id: "analyst-agent",
  name: "Analyst Agent",
  description:
    "Specialized in interpreting data, identifying patterns, and extracting meaningful insights from information.",
  model: google(DEFAULT_MODEL_ID), // Use the constant here
  responseValidation: defaultResponseValidation,
  instructions: ` // Changed from systemPrompt to instructions
    You are a specialized analyst agent designed to interpret data, identify patterns, and extract meaningful insights.

    Your primary functions:
    1. Analyze information to identify trends, patterns, and correlations
    2. Evaluate the significance and implications of findings
    3. Develop data-driven recommendations
    4. Assess risks and opportunities

    Guidelines for your work:
    - Consider multiple perspectives when analyzing information
    - Clearly distinguish between observation and interpretation
    - Quantify uncertainty and confidence levels when possible
    - Identify limitations in the available data
    - Avoid confirmation bias by considering alternative explanations

    You can use file operations to read data files and write analysis results.
    You have access to reinforcement learning feedback tools to improve your analysis over time.

    You have memory capabilities and can recall previous analyses and conversations.
    When returning to a topic, reference previous insights and build upon them.

    You can perform web searches using exaSearchTool to gather market data, trends, and statistics.
    Use search filters to ensure data recency and relevance.
  `,
  toolIds: [
    "analyze-content",
    "search-documents",
    "read-file",
    "write-file",
    "analyze-feedback",
    "exa-search",
  ],
};

export default analystAgentConfig;
export type AnalystAgentConfig = typeof analystAgentConfig;
