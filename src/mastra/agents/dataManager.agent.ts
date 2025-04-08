/**
 * Data Manager Agent Implementation
 *
 * This agent is specialized in managing data operations, file organization,
 * storage, and retrieval of information across the system.
 */

import { createAgentFromConfig } from "./base.agent";
import { dataManagerAgentConfig } from "./config/dataManager.config";

/**
 * Data Manager Agent with file and storage management capabilities
 *
 * @remarks
 * This agent specializes in organizing, storing, retrieving, and managing
 * data assets across the system, including file operations and vector database management.
 */
export const dataManagerAgent = createAgentFromConfig(dataManagerAgentConfig);
