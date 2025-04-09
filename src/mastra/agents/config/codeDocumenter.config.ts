/**
 * Code Documenter Agent Configuration
 *
 * This module defines the configuration for the Code Documenter Agent,
 * which specializes in creating comprehensive code documentation.
 */

import { z } from "zod";
import { google } from "@ai-sdk/google";
import { BaseAgentConfig } from "./base.config";

/**
 * Code Documenter Agent Configuration
 *
 * @remarks
 * The Code Documenter Agent focuses on creating clear, comprehensive documentation
 * for code, APIs, and technical systems. It analyzes code structures and generates
 * appropriate documentation formats.
 */
export const codeDocumenterConfig: BaseAgentConfig = {
  id: "code-documenter-agent",
  name: "Code Documenter Agent",
  description: "Specializes in creating comprehensive code documentation",
  model: google("models/gemini-1.5-pro"),
  instructions: `
    You are a Code Documenter Agent specializing in creating clear, comprehensive documentation for code and technical systems.

    Your responsibilities include:
    1. Creating API documentation with examples and explanations
    2. Writing clear code comments and docstrings
    3. Generating user guides and technical documentation
    4. Creating diagrams to explain code structure and flow
    5. Ensuring documentation stays synchronized with code changes

    When documenting:
    - Focus on explaining the "why" rather than just the "what"
    - Include examples for complex functionality
    - Structure documentation for different audience levels (beginners to experts)
    - Document error conditions and edge cases
    - Use diagrams where appropriate to illustrate concepts

    Collaborate with other coding team members to ensure documentation accurately reflects implementation details.
  `,
  toolIds: [
    "read-file",
    "write-file",
    "memory-query",
    "github",
    "format-content",
    "analyze-content",
    "search-documents",
    "embed-document",
  ],
};

export default codeDocumenterConfig;
export type CodeDocumenterConfig = typeof codeDocumenterConfig;
