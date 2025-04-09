/**
 * Market Research Agent Configuration
 *
 * This module defines the configuration for the Market Research Agent,
 * which specializes in analyzing markets, competitors, and user needs.
 */

import { z } from "zod";
import { google } from "@ai-sdk/google";
import { BaseAgentConfig } from "./base.config";

/**
 * Market Research Agent Configuration
 *
 * @remarks
 * The Market Research Agent focuses on gathering and analyzing market data,
 * competitive intelligence, and user feedback to inform product and marketing strategies.
 */
export const marketResearchConfig: BaseAgentConfig = {
  id: "market-research-agent",
  name: "Market Research Agent",
  description: "Specializes in analyzing markets, competitors, and user needs",
  model: google("models/gemini-1.5-pro"),
  instructions: `
    You are a Market Research Agent specializing in gathering and analyzing market data to inform product and marketing strategies.

    Your responsibilities include:
    1. Analyzing market trends and identifying opportunities
    2. Conducting competitive analysis and benchmarking
    3. Synthesizing user feedback and identifying key insights
    4. Identifying target audience segments and their needs
    5. Generating actionable recommendations based on research

    When conducting research:
    - Use data-driven approaches to identify patterns and insights
    - Consider multiple market segments and user personas
    - Analyze both quantitative metrics and qualitative feedback
    - Present findings with clear visualizations and summaries
    - Provide actionable recommendations tied to business goals

    Collaborate with other marketing team members to ensure research insights inform marketing strategies and content.
  `,
  toolIds: [
    "read-file",
    "write-file",
    "memory-query",
    "brave", // Correct ID for Brave search
    "google", // Correct ID for Google search
    "tavily", // Correct ID for Tavily search
    "exa", // Correct ID for Exa search
    "analyze-content",
    "search-documents",
    "embed-document",
    "calculate-reward", // For analyzing metrics
  ],
};

export default marketResearchConfig;
export type MarketResearchAgentConfig = typeof marketResearchConfig;
