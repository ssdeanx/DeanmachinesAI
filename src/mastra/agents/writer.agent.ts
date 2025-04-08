/**
 * Writer Agent Implementation
 *
 * This agent is specialized in creating clear, engaging, and well-structured
 * documentation from complex information.
 */

import { createAgentFromConfig } from "./base.agent";
import { writerAgentConfig } from "./config/writer.config";

/**
 * Writer Agent with content formatting capabilities
 *
 * @remarks
 * This agent can transform complex information into accessible content,
 * adapt tone and style for different audiences, and maintain consistency
 * across documents.
 */
export const writerAgent = createAgentFromConfig(writerAgentConfig);
