/**
 * Analyst Agent Implementation
 *
 * This agent is specialized in interpreting data, identifying patterns,
 * and extracting meaningful insights from information.
 */

import { createAgentFromConfig } from "./base.agent";
import { analystAgentConfig } from "./config/analyst.config";

/**
 * Analyst Agent with data analysis capabilities
 *
 * @remarks
 * This agent can analyze information, identify trends and patterns,
 * and extract meaningful insights from data sources.
 */
export const analystAgent = createAgentFromConfig(analystAgentConfig);
