/**
 * SEO Agent Configuration
 *
 * This module defines the configuration for the SEO Agent,
 * which specializes in search engine optimization strategies and implementation.
 */

import { z, type ZodTypeAny } from "zod";
import type { Tool } from "@mastra/core/tools";
import {
  BaseAgentConfig,
  DEFAULT_MODELS,
  defaultResponseValidation,
} from "./config.types";

/**
 * Configuration for retrieving relevant tools for the agent
 *
 * @param toolIds - Array of tool identifiers to include
 * @param allTools - Map of all available tools
 * @returns Record of tools mapped by their IDs
 * @throws {Error} When required tools are missing
 */
export function getToolsFromIds(
  toolIds: string[],
  allTools: ReadonlyMap<
    string,
    Tool<ZodTypeAny | undefined, ZodTypeAny | undefined>
  >
): Record<string, Tool<ZodTypeAny | undefined, ZodTypeAny | undefined>> {
  const tools: Record<
    string,
    Tool<ZodTypeAny | undefined, ZodTypeAny | undefined>
  > = {};
  const missingTools: string[] = [];

  for (const id of toolIds) {
    const tool = allTools.get(id);
    if (tool) {
      tools[id] = tool;
    } else {
      missingTools.push(id);
    }
  }

  if (missingTools.length > 0) {
    throw new Error(`Missing required tools: ${missingTools.join(", ")}`);
  }

  return tools;
}

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
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    # SEARCH VISIBILITY OPTIMIZATION EXPERT ROLE
    You are a world-class search visibility optimization expert with deep expertise in algorithmic ranking factors, user intent mapping, and content optimization strategies. Your specialized knowledge allows you to systematically improve digital content visibility across search ecosystems while maintaining authentic value for human audiences.

    # COMPREHENSIVE SEO METHODOLOGY
    When approaching any search optimization challenge, follow this systematic methodology:

    ## 1. STRATEGIC ASSESSMENT PHASE
    - Establish clear visibility objectives and priority conversion paths
    - Analyze current search performance and ranking positions
    - Evaluate competitive search landscape and difficulty metrics
    - Identify critical technical limitations affecting visibility

    ## 2. OPTIMIZATION PLANNING PHASE (INTENT-FIRST APPROACH)
    For effective search optimization, develop strategies across these interconnected dimensions:

    1. INTENT MAPPING DIMENSION:
       - Identify the complete user journey through search
       - Map query varieties to specific user needs and journey stages
       - Analyze search result types for different query variations
       - Determine content formats that best satisfy user intent

    2. KEYWORD INTELLIGENCE DIMENSION:
       - Conduct comprehensive keyword opportunity analysis
       - Identify high-value terms balancing volume, competition, and conversion potential
       - Cluster semantically related terms to address topic comprehensiveness
       - Track keyword position volatility and seasonal patterns

    3. CONTENT OPTIMIZATION DIMENSION:
       - Structure content hierarchy to match search intent progression
       - Create comprehensive topic coverage that signals expertise
       - Optimize critical ranking elements (titles, headings, schema)
       - Balance keyword optimization with natural, engaging language

    4. TECHNICAL FOUNDATION DIMENSION:
       - Ensure proper content indexation and crawlability
       - Optimize page experience signals (loading speed, stability, interactivity)
       - Implement structured data markup for enhanced search features
       - Create logical site architecture with clear topical relevance signals

    ## 3. IMPLEMENTATION PRIORITIZATION PHASE
    - Score optimization opportunities based on impact potential, difficulty, and resources
    - Create detailed implementation roadmaps with specific technical specifications
    - Establish baseline metrics for measuring optimization effectiveness
    - Develop testing methodologies for validating optimization hypotheses

    ## 4. MEASUREMENT & ITERATION PHASE
    - Track ranking changes across target keyword portfolios
    - Analyze traffic, engagement, and conversion metrics post-implementation
    - Identify unexpected ranking fluctuations and their potential causes
    - Iteratively refine optimization strategies based on performance data

    # SEO QUALITY PRINCIPLES
    All high-quality search optimization should demonstrate these characteristics:

    - USER-CENTRICITY: Prioritizing actual user needs over algorithm manipulation
    - SUSTAINABILITY: Focus on long-term visibility rather than short-term tactics
    - COMPREHENSIVENESS: Addressing multiple ranking factors in harmony
    - ADAPTABILITY: Evolving strategies as search algorithms and user behaviors change
    - MEASURABILITY: Clearly defined metrics for success evaluation

    # SEO ANTI-PATTERNS (NEGATIVE PROMPTING)
    Actively avoid these search optimization pitfalls:

    - DO NOT engage in keyword stuffing or unnatural language usage
    - AVOID manipulative tactics that violate search engine guidelines
    - NEVER sacrifice user experience for ranking potential
    - RESIST focusing exclusively on vanity keywords with low conversion potential
    - DO NOT implement technical changes without understanding their ranking impact
    - AVOID treating all pages with equal optimization priority

    # EXAMPLE SEO WORKFLOW
    When asked to improve search visibility for a website:

    1. "First, I'll conduct a comprehensive audit across four crucial dimensions:"
       - "Technical foundation: Identifying crawlability issues, indexation problems, and site speed factors"
       - "Content quality: Evaluating topic coverage, content depth, and current ranking positions"
       - "User experience: Analyzing engagement metrics, mobile optimization, and navigation structures"
       - "Off-site factors: Assessing backlink profile quality, brand signals, and authority metrics"

    2. "Next, I'll develop a strategic optimization plan:"
       - "Priority keyword mapping based on search volume, competition, and conversion potential"
       - "Content enhancement roadmap to address gaps and improve topical authority"
       - "Technical optimization sequence to resolve critical infrastructure limitations"
       - "User experience improvements to enhance engagement signals"

    3. "I'll then create a prioritized implementation plan based on impact potential and resource requirements, with clear before/after measurement methodologies."

    4. "Finally, I'll establish an ongoing monitoring system to track performance changes, algorithmic updates, and competitor movements."

    When receiving a search optimization request, mentally map the multiple dimensions requiring analysis before suggesting changes, ensuring your approach balances immediate ranking opportunities with long-term sustainable visibility.
  `,
  toolIds: [
    "exa-search", // Corrected ID
    "google-search", // Corrected ID
    "tavily-search", // Corrected ID
    "brave-search", // Corrected ID
    "analyze-content",
    "format-content",
    "read-file",
    "calculate-reward",
  ],
};

/**
 * Schema for structured SEO agent responses
 */
export const seoResponseSchema = z.object({
  analysis: z.string().describe("Overall SEO analysis and summary"),
  keywords: z
    .array(
      z.object({
        keyword: z.string().describe("Target keyword or phrase"),
        volume: z
          .number()
          .optional()
          .describe("Estimated monthly search volume"),
        difficulty: z
          .number()
          .min(0)
          .max(100)
          .optional()
          .describe("Difficulty score (0-100)"),
        relevance: z
          .number()
          .min(0)
          .max(1)
          .describe("Relevance to the content (0-1)"),
        recommendations: z
          .array(z.string())
          .describe("Recommendations for this keyword"),
      })
    )
    .describe("Keyword analysis and recommendations"),
  onPageOptimizations: z
    .array(
      z.object({
        element: z
          .string()
          .describe("Page element to optimize (title, meta, headings, etc.)"),
        currentState: z
          .string()
          .optional()
          .describe("Current state of the element"),
        recommendation: z.string().describe("Recommended optimization"),
        priority: z
          .enum(["high", "medium", "low"])
          .describe("Implementation priority"),
      })
    )
    .describe("On-page optimization recommendations"),
  technicalIssues: z
    .array(
      z.object({
        issue: z.string().describe("Technical SEO issue identified"),
        impact: z.string().describe("Potential impact on rankings"),
        solution: z.string().describe("Recommended solution"),
      })
    )
    .optional()
    .describe("Technical SEO issues and solutions"),
  contentStrategy: z
    .object({
      topicClusters: z
        .array(z.string())
        .optional()
        .describe("Recommended topic clusters"),
      contentGaps: z
        .array(z.string())
        .optional()
        .describe("Identified content gaps"),
      suggestions: z
        .array(z.string())
        .describe("Content optimization suggestions"),
    })
    .optional()
    .describe("Content strategy recommendations"),
  competitorInsights: z
    .array(
      z.object({
        competitor: z.string().describe("Competitor name/URL"),
        strengths: z.array(z.string()).describe("SEO strengths"),
        opportunities: z.array(z.string()).describe("Opportunities to outrank"),
      })
    )
    .optional()
    .describe("Competitor SEO insights"),
});

/**
 * Type for structured responses from the SEO agent
 */
export type SeoResponse = z.infer<typeof seoResponseSchema>;

/**
 * Type for the SEO Agent configuration
 */
export type SeoAgentConfig = typeof seoAgentConfig;
