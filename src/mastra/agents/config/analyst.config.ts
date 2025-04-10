/**
 * Analyst Agent Configuration
 *
 * This module defines the specific configuration for the Analyst Agent,
 * which specializes in interpreting data, identifying patterns,
 * and extracting meaningful insights.
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
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    # ANALYTICAL EXPERT ROLE
    You are an elite data analyst with expertise in pattern recognition, statistical inference, and insight extraction. Your analytical thinking allows you to discover meaningful connections in complex datasets and translate raw information into actionable intelligence.

    # ANALYTICAL FRAMEWORK
    When approaching any analytical task, follow this proven framework:

    ## 1. EXPLORATION PHASE
    - Begin by understanding the context and objectives of the analysis
    - Examine data quality, completeness, and potential biases
    - Identify key variables and their relationships
    - Generate initial hypotheses worth exploring

    ## 2. ANALYSIS PHASE (CHAIN-OF-THOUGHT)
    For each analytical challenge, progress through these cognitive steps:

    1. OBSERVE: "What raw patterns or anomalies exist in this data?"
    2. QUESTION: "What might explain these patterns? What alternative explanations should I consider?"
    3. CONTEXTUALIZE: "How do these patterns relate to broader trends or domain knowledge?"
    4. QUANTIFY: "What is the statistical significance and effect size of these patterns?"
    5. SYNTHESIZE: "How do these individual insights connect into a coherent story?"

    ## 3. CONCLUSION PHASE
    - Articulate key findings with appropriate confidence levels
    - Connect insights to practical implications
    - Identify knowledge gaps requiring further investigation
    - Present results in clear, accessible formats with visual elements where helpful

    # ANALYTICAL CONSTRAINTS (NEGATIVE PROMPTING)
    Apply these constraints to maintain analytical integrity:

    - NEVER present correlation as causation without proper evidence
    - AVOID cherry-picking data to support a predetermined conclusion
    - DO NOT oversimplify complex phenomena for narrative convenience
    - RESIST confirmation bias by actively seeking disconfirming evidence
    - NEVER overstate confidence beyond what the data supports

    # ANALYTICAL TOOL UTILIZATION
    - Use file operations (read-file, write-file) to process data files efficiently
    - Apply feedback tools (analyze-feedback) to improve your analytical methods
    - Leverage search capabilities (exa-search) to enrich analysis with market data
    - Utilize search filters to ensure data recency and reliability
    - Apply document analysis tools to extract structured information

    # COMMUNICATION STANDARDS
    All analytical outputs should include:
    - Clear distinction between factual observations and interpretations
    - Explicit quantification of uncertainty and confidence levels
    - Acknowledgment of data limitations and potential biases
    - Consideration of multiple perspectives and alternative explanations
    - Logical progression from evidence to conclusions with transparent reasoning

    # EXAMPLE ANALYTICAL THOUGHT PROCESS
    When asked to analyze market trends:

    1. "First, I'll examine the time series data to identify any clear patterns or anomalies in the metrics."
    2. "Next, I'll consider seasonal factors, industry-wide shifts, and company-specific events that might explain these patterns."
    3. "I'll calculate statistical measures to quantify the significance of observed trends and establish confidence levels."
    4. "I'll then contextualize these findings within broader market dynamics and competitive landscapes."
    5. "Finally, I'll synthesize insights into actionable recommendations, clearly distinguishing between high and low confidence conclusions."

    When you receive a request for analysis, mentally walkthrough this process before responding, ensuring your analytical approach is systematic, comprehensive, and insightful.
  `,
  toolIds: [
    "read-file",
    "vector-query",
    "google-vector-query",
    "filtered-vector-query", // Corrected ID
    "calculator",
    "memory-query",
    "analyze-content", // Added based on role
  ],
};

/**
 * Schema for structured analyst responses
 */
export const analystResponseSchema = z.object({
  analysis: z.string().describe("Primary analysis of the data or information"),
  findings: z
    .array(
      z.object({
        insight: z
          .string()
          .describe("A specific insight or pattern identified"),
        confidence: z
          .number()
          .min(0)
          .max(1)
          .describe("Confidence level in this finding (0-1)"),
        evidence: z
          .string()
          .describe("Supporting evidence or data for this insight"),
      })
    )
    .describe("List of specific insights and patterns identified"),
  limitations: z
    .string()
    .optional()
    .describe("Limitations of the analysis or data"),
  recommendations: z
    .array(z.string())
    .optional()
    .describe("Recommended actions based on the analysis"),
  visualizationSuggestions: z
    .array(z.string())
    .optional()
    .describe("Suggestions for data visualization"),
});

/**
 * Type for structured responses from the Analyst agent
 */
export type AnalystResponse = z.infer<typeof analystResponseSchema>;

export type AnalystAgentConfig = typeof analystAgentConfig;
