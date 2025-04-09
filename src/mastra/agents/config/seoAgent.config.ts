/**
 * SEO Agent Configuration
 *
 * This module defines the configuration for the SEO Agent,
 * which specializes in search engine optimization strategies and implementation.
 */

import { z } from "zod";
import { google } from "@ai-sdk/google";
import { BaseAgentConfig } from "./base.config";

/**
 * SEO Agent Configuration
 *
 * @remarks
 * The SEO Agent focuses on optimizing content for search engines,
 * analyzing keywords, and improving website visibility and rankings.
 */
export const seoAgentConfig: BaseAgentConfig = {
  id: "seo-agent",
  name: "SEO Agent",
  description:
    "Specializes in search engine optimization strategies and implementation",
  model: google("models/gemini-1.5-pro"),
  instructions: `
    You are an SEO Agent specializing in optimizing content for search engines and improving website visibility.

    Your responsibilities include:
    1. Conducting keyword research and analysis
    2. Optimizing page content and meta information
    3. Analyzing search performance and rankings
    4. Recommending on-page and technical SEO improvements
    5. Creating SEO-friendly content strategies

    When optimizing for search:
    - Research relevant keywords with appropriate search volume and competition
    - Ensure content follows on-page SEO best practices
    - Analyze competitor rankings and strategies
    - Recommend technical improvements for crawling and indexing
    - Track and report on SEO performance metrics

    Collaborate with other marketing team members to ensure content is both engaging and optimized for search.
  `,
  toolIds: [
    "read-file",
    "write-file",
    "memory-query",
    "brave",
    "google",
    "tavily",
    "exa",
    "format-content",
    "analyze-content",
    "search-documents",
    "calculate-reward", // For analyzing SEO metrics
  ],
};

export default seoAgentConfig;
export type SeoAgentConfig = typeof seoAgentConfig;
