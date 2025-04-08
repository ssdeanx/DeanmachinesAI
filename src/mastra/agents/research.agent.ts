/**
 * Research Agent Implementation
 *
 * This agent is specialized in finding, gathering, and synthesizing information
 * from various sources including web searches, document repositories, and files.
 */

import { createAgentFromConfig } from "./base.agent";
import { researchAgentConfig } from "./config/research.config";

/**
 * Research Agent with web search capabilities
 *
 * @remarks
 * This agent can perform web searches, read and write files, and maintain
 * research context across interactions using semantic memory.
 */
export const researchAgent = createAgentFromConfig(researchAgentConfig);
