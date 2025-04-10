/**
 * @file src/mastra/workflows/Networks/agentNetwork.ts
 * @description Defines and exports various AgentNetworks for DeanmachinesAI,
 *              including specialized collaborative networks and a Mixture of Experts (MoE) network.
 * @version 1.1.0 - Added KnowledgeWorkMoENetwork, preserving original structure
 */

import { google } from "@ai-sdk/google";
import { AgentNetwork, type AgentNetworkConfig } from "@mastra/core/network";
import { createResponseHook } from "../../hooks"; // Assuming this path is correct
import {
  researchAgent,
  analystAgent,
  writerAgent,
  rlTrainerAgent,
  dataManagerAgent,
} from "../../agents";
// Import the default export (agents object) for MoE configuration
import allAgents from "../../agents";
import { env } from "process";
import { DEFAULT_MODELS } from "../../agents/config"; // Import for MoE config
import { KnowledgeWorkMoENetwork } from "./knowledgeWorkMoE.network"; // Import the MoE network class
import { sharedMemory } from "../../database"; // Import shared memory for network config

// Base configuration for all networks to match agent configuration
// NOTE: Hooks are removed here as they are not part of AgentNetworkConfig.
// Consult @mastra/core documentation for the correct way to configure hooks.
// Memory might be configured elsewhere (e.g., during execution).
const baseNetworkConfig: Partial<AgentNetworkConfig> = {
  model: google("models/gemini-2.0-flash"),
  // memory: sharedMemory, // Removed: 'memory' is not part of AgentNetworkConfig
  // hooks: { ... } // Removed hooks configuration from base
};

// --- Original Hook Definitions (Unchanged) ---
const deanInsightsHooks = {
  onError: async (error: Error) => {
    console.error("Network error:", error);
    return {
      text: "The agent network encountered an error. Please try again or contact support.",
      error: error.message,
    };
  },
  onGenerateResponse: async (response: any) => {
    // Using 'any' temporarily, replace with actual response type
    // Apply base response validation logic if needed (extracted from createResponseHook)
    const baseHook = createResponseHook({
      minResponseLength: 50,
      maxAttempts: 3,
      validateResponse: (res) => {
        if (res.object) {
          return Object.keys(res.object).length > 0;
        }
        return res.text ? res.text.length >= 50 : false;
      },
    });
    const validatedResponse = await baseHook(response);

    // Add network-specific metadata
    return {
      ...validatedResponse,
      metadata: {
        ...(validatedResponse as any).metadata, // Assuming metadata exists
        network: "deanInsights",
        timestamp: new Date().toISOString(),
        agentCount: 5,
      },
    };
  },
};

const dataFlowHooks = {
  onError: async (error: Error) => {
    console.error("Network error:", error);
    return {
      text: "The agent network encountered an error. Please try again or contact support.",
      error: error.message,
    };
  },
  onGenerateResponse: async (response: any) => {
    const baseHook = createResponseHook({
      minResponseLength: 50,
      maxAttempts: 3,
      validateResponse: (res) => {
        if (res.object) {
          return Object.keys(res.object).length > 0;
        }
        return res.text ? res.text.length >= 50 : false;
      },
    });
    const validatedResponse = await baseHook(response);
    return {
      ...validatedResponse,
      metadata: {
        ...(validatedResponse as any).metadata,
        network: "dataFlow",
        timestamp: new Date().toISOString(),
        agentCount: 3,
      },
    };
  },
};

const contentCreationHooks = {
  // Assuming similar structure if needed
  onError: async (error: Error) => {
    console.error("Content Creation Network error:", error); /* ... */
  },
  onGenerateResponse: async (response: any) => {
    /* ... validation and metadata ... */ return response;
  },
};
// --- End Original Hook Definitions ---

// --- Original Network Instantiations (Unchanged except adding ID and ensuring memory) ---

/**
 * DeanInsights Network
 *
 * A collaborative network focused on researching topics, analyzing data, and producing
 * well-structured reports with reinforcement learning-based improvements over time.
 */
export const deanInsightsNetwork = new AgentNetwork({
  // id: "dean-insights", // ID is not part of AgentNetworkConfig, set via other means if necessary
  ...baseNetworkConfig, // Includes model and memory
  model: baseNetworkConfig.model!, // Ensure model is explicitly provided and non-null
  name: "DeanInsights Network",
  agents: [
    researchAgent,
    analystAgent,
    writerAgent,
    rlTrainerAgent,
    dataManagerAgent,
  ],
  instructions: `
    You are a coordination system that routes queries to the appropriate specialized agents
    to deliver comprehensive and accurate insights.

    Your available agents are:

    1. Research Agent: Specializes in gathering and synthesizing information from various sources
    2. Analyst Agent: Specializes in analyzing data, identifying patterns, and extracting insights
    3. Writer Agent: Specializes in creating clear, engaging, and well-structured documentation
    4. RL Trainer Agent: Specializes in optimizing agent performance through reinforcement learning
    5. Data Manager Agent: Specializes in file operations and data organization

    For each user query:
    1. Start with the Research Agent to gather relevant information
    2. Route specific analytical tasks to the Analyst Agent
    3. Use the Data Manager Agent for any file operations needed
    4. Have the Writer Agent synthesize findings into a coherent response
    5. Periodically use the RL Trainer Agent to improve overall system performance

    Best practices:
    - Provide clear context when routing between agents
    - Avoid unnecessary agent switches that could lose context
    - Use the most specialized agent for each specific task
    - Ensure attribution of which agent contributed which information
    - When uncertain about a claim, use the Research Agent to verify it

    Note: Each agent has access to specific capabilities:
    - Research Agent: Web search (Exa), document search, knowledge base access
    - Analyst Agent: Data analysis with web search capabilities
    - Writer Agent: Content formatting with web search integration
    - RL Trainer Agent: Performance optimization with feedback tools
    - Data Manager Agent: File operations with knowledge base integration

    Coordinate these capabilities effectively to deliver comprehensive results.

    You should maintain a neutral, objective tone and prioritize accuracy and clarity.
  `,
  // hooks: { ... } // Removed hooks from constructor - apply post-instantiation if needed
});

/**
 * DataFlow Network
 *
 * A specialized network focused on data processing, file operations, and analysis
 */
export const dataFlowNetwork = new AgentNetwork({
  // id: "data-flow", // ID is not part of AgentNetworkConfig, set via other means if necessary
  ...baseNetworkConfig, // Includes model and memory
  model: baseNetworkConfig.model!, // Ensure model is explicitly provided and non-null
  name: "DataFlow Network",
  agents: [dataManagerAgent, analystAgent, rlTrainerAgent],
  instructions: `
    You are a data processing coordination system that orchestrates specialized agents
    to handle data operations, analysis, and optimization tasks.

    Your available agents are:

    1. Data Manager Agent: Specializes in file operations and data organization
    2. Analyst Agent: Specializes in analyzing data, identifying patterns, and extracting insights
    3. RL Trainer Agent: Specializes in optimizing agent performance through reinforcement learning

    For each user task:
    1. Start with the Data Manager Agent to handle file operations and data retrieval
    2. Route analytical tasks to the Analyst Agent to extract meaningful insights
    3. Use the RL Trainer Agent to continuously improve performance based on feedback

    Best practices:
    - Ensure data integrity across all operations
    - Validate inputs and outputs between agent handoffs
    - Log key metrics throughout the process
    - Apply proper error handling at each stage
    - Use the RL Trainer to identify optimization opportunities

    Note: Your agents have the following enhanced capabilities:
    - Data Manager: File operations with knowledge base integration
    - Analyst: Data analysis with web search capabilities
    - RL Trainer: Performance optimization with feedback tools

    Use these capabilities in combination for optimal results.

    Focus on producing accurate, engaging, and valuable content that effectively communicates complex information.
  `,
  // hooks: { ... } // Removed hooks from constructor - apply post-instantiation if needed
});

/**
 * ContentCreation Network
 *
 */
export const contentCreationNetwork = new AgentNetwork({
  // id: "content-creation", // ID is not part of AgentNetworkConfig, set via other means if necessary
  ...baseNetworkConfig, // Includes model and memory
  model: baseNetworkConfig.model!, // Ensure model is explicitly provided and non-null
  name: "ContentCreation Network",
  agents: [researchAgent, writerAgent, rlTrainerAgent],
  instructions: `
    You are a content creation coordination system that orchestrates the process
    of researching topics and producing high-quality, well-structured content.

    Your available agents are:

    1. Research Agent: Specializes in gathering and synthesizing information from various sources
    2. Writer Agent: Specializes in creating clear, engaging, and well-structured documentation
    3. RL Trainer Agent: Specializes in optimizing content quality through reinforcement learning

    For each content request:
    1. Start with the Research Agent to gather comprehensive information on the topic
    2. Route to the Writer Agent to transform research into engaging, well-structured content
    3. Use the RL Trainer Agent to analyze feedback and improve content quality over time

    Best practices:
    - Ensure factual accuracy by thorough research
    - Maintain consistent tone and style throughout the content
    - Structure content for maximum readability and engagement
    - Incorporate user feedback to continuously improve content quality
    - Use appropriate formatting and organization for different content types

    Note: Your agents have these enhanced capabilities:
    - Research Agent: Web search (Exa), document search, knowledge base access
    - Writer Agent: Content formatting with web search integration
    - RL Trainer: Content quality optimization through feedback

    Leverage these tools for comprehensive content creation.

    Focus on producing accurate, engaging, and valuable content that effectively communicates complex information.
  `,
  // hooks: { ... } // Removed hooks from constructor - apply post-instantiation if needed
});

// --- MoE Network Instantiation (Added) ---

// 1. Define the expert agent IDs for the MoE network instance
// Explicitly type the array elements as keys of the allAgents object.
const moeExpertIds: (keyof typeof allAgents)[] = [
  "researchAgent",
  "analystAgent",
  "writerAgent",
  "coderAgent",
  "debuggerAgent",
  "architectAgent",
  "codeDocumenterAgent",
  "dataManagerAgent",
  "marketResearchAgent",
  "copywriterAgent",
  "socialMediaAgent",
  "seoAgent",
  "uiUxCoderAgent",
  // 'agenticAssistant' // Fallback agent is added automatically by the MoE class if valid & not listed.
];

// 2. Configure the router model for the MoE network
const moeRouterConfig = DEFAULT_MODELS.GOOGLE_STANDARD; // Use a capable model for routing

// 3. Instantiate the MoE network with a unique ID
export const knowledgeWorkMoENetwork = new KnowledgeWorkMoENetwork(
  moeExpertIds,
  allAgents, // Pass the full agent registry
  moeRouterConfig,
  "knowledge-work-moe-v1" // Unique ID for this network instance
  // fallbackAgentId: 'agenticAssistant' // Default is usually fine
);

// --- Apply Hooks to Networks ---
// NOTE: Direct assignment of hooks (e.g., network.onError) is not supported by the AgentNetwork type.
// Consult the @mastra/core documentation for the correct method to apply hooks
// (e.g., potentially via constructor configuration or execution options).
// The following lines are commented out to resolve the type errors:

// deanInsightsNetwork.onError = deanInsightsHooks.onError;
// deanInsightsNetwork.onGenerateResponse = deanInsightsHooks.onGenerateResponse;

// dataFlowNetwork.onError = dataFlowHooks.onError;
// dataFlowNetwork.onGenerateResponse = dataFlowHooks.onGenerateResponse; // Duplicate line removed

// contentCreationNetwork.onError = contentCreationHooks.onError;
// contentCreationNetwork.onGenerateResponse = contentCreationHooks.onGenerateResponse;

// knowledgeWorkMoENetwork.onError = async (error: Error) => {
//   console.error("MoE Network error:", error);
//   return {
//     text: "The MoE agent network encountered an error. Please try again with a more specific request.",
//     error: error.message,
//   };
// };

// --- Original Helper Function (Revised to use final export map) ---

/**
 * Helper function to get a specific agent network by its registered ID.
 *
 * @param networkId - The unique ID of the network to retrieve (e.g., "knowledge-work-moe-v1").
 * @returns The requested AgentNetwork instance or undefined if not found.
 */
export function getAgentNetwork(networkId: string): AgentNetwork | undefined {
  // Directly access the exported 'networks' map using the provided ID
  // This map is defined below and uses the correct string IDs as keys.
  return networks[networkId as keyof typeof networks];
}

// --- Final Export Map for Mastra Configuration (Updated) ---

/**
 * Export all instantiated networks in a map format compatible with the Mastra instance configuration.
 * The keys MUST be the unique string IDs assigned during instantiation, used for invoking networks.
 */
export const networks = {
  // Use the unique IDs assigned during instantiation as keys
  "dean-insights": deanInsightsNetwork,
  "data-flow": dataFlowNetwork,
  "content-creation": contentCreationNetwork,
  "knowledge-work-moe-v1": knowledgeWorkMoENetwork, // Add the MoE network using its ID
};
