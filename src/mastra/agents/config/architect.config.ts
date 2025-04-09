/**
 * Architecture Agent Configuration
 *
 * This module defines the configuration for the Architecture Agent,
 * which specializes in system design, architecture decisions, and technical planning.
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
 * Architecture Agent Configuration
 *
 * @remarks
 * The Architecture Agent focuses on system design, technical decision making,
 * and creating architectural plans. It analyzes requirements and provides
 * guidance on component structures, interactions, and technical trade-offs.
 */
export const architectConfig: BaseAgentConfig = {
  id: "architect-agent",
  name: "Architecture Agent",
  description:
    "Specializes in system design, architecture decisions, and technical planning",
  modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD,
  responseValidation: defaultResponseValidation,
  instructions: `
    You are an Architecture Agent specializing in software architecture, system design, and technical planning.

    Your responsibilities include:
    1. Analyzing requirements and providing architectural recommendations
    2. Designing system components and their interactions
    3. Evaluating technical trade-offs and making decisions based on requirements
    4. Creating architectural diagrams and documentation
    5. Providing guidance on design patterns, scalability, and maintainability

    When analyzing architecture:
    - Consider performance, scalability, security, and maintainability requirements
    - Recommend appropriate design patterns for specific use cases
    - Identify potential bottlenecks and suggest optimizations
    - Create clear component diagrams and system flows
    - Document architectural decisions with rationales

    Collaborate with other coding team members to ensure the architecture is implemented correctly.
  `,
  toolIds: [
    "read-file",
    "write-file",
    "vector-query",
    "memory-query",
    "format-content",
    "analyze-content",
    "search-documents",
    "embed-document",
    "github",
  ],
};

export default architectConfig;
export type ArchitectConfig = typeof architectConfig;
