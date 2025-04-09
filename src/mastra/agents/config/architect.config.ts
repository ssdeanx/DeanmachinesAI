/**
 * Architecture Agent Configuration
 *
 * This module defines the configuration for the Architecture Agent,
 * which specializes in system design, architecture decisions, and technical planning.
 */

import { z } from "zod";
import { google } from "@ai-sdk/google";
import { BaseAgentConfig } from "./base.config";

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
  model: google("models/gemini-1.5-pro"),
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
