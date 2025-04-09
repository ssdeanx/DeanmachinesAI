/**
 * AgentNetwork Implementation for DeanmachinesAI
 *
 * This module implements a collaborative network of specialized agents that can
 * dynamically work together to solve complex tasks. Unlike traditional workflows
 * with predefined execution paths, the AgentNetwork uses an LLM-based router to
 * determine which agent to call next based on the requirements of the task.
 */

import { google } from "@ai-sdk/google";
import { AgentNetwork, type AgentNetworkConfig } from "@mastra/core/network";
import { createResponseHook } from "../../hooks";
import {
  researchAgent,
  analystAgent,
  writerAgent,
  rlTrainerAgent,
  dataManagerAgent,
} from "../../agents";
import { env } from "process";

// Base configuration for all networks to match agent configuration
// NOTE: Hooks are removed here as they are not part of AgentNetworkConfig.
// Consult @mastra/core documentation for the correct way to configure hooks.
const baseNetworkConfig: Partial<AgentNetworkConfig> = {
  model: google("models/gemini-2.0-flash"),
  // hooks: { ... } // Removed hooks configuration
};

// Define hooks separately for potential later use if the library provides a method
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

/**
 * DeanInsights Network
 *
 * A collaborative network focused on researching topics, analyzing data, and producing
 * well-structured reports with reinforcement learning-based improvements over time.
 */
export const deanInsightsNetwork = new AgentNetwork({
  ...baseNetworkConfig,
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
  // hooks: { ... } // Removed hooks from constructor
});

// TODO: Apply hooks using the correct method provided by @mastra/core
// Example (replace with actual API):
// deanInsightsNetwork.setHooks(deanInsightsHooks);
// dataFlowNetwork.setHooks(dataFlowHooks);
// contentCreationNetwork.setHooks(contentCreationHooks);

/**
 * DataFlow Network
 *
 * A specialized network focused on data processing, file operations, and analysis
 */
export const dataFlowNetwork = new AgentNetwork({
  ...baseNetworkConfig,
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
  // hooks: { ... } // Removed hooks from constructor
});

// TODO: Apply hooks using the correct method provided by @mastra/core
// Example (replace with actual API):
// contentCreationNetwork.setHooks(contentCreationHooks);

/**
 * ContentCreation Network
 *
 */
export const contentCreationNetwork = new AgentNetwork({
  ...baseNetworkConfig,
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
  // hooks: { ... } // Removed hooks from constructor
});

// TODO: Apply hooks using the correct method provided by @mastra/core
// Example (replace with actual API):
// contentCreationNetwork.setHooks(contentCreationHooks);

/**
 * Helper function to get a specific agent network by name
 *
 * @param networkName - Name of the network to retrieve
 * @returns The requested AgentNetwork or undefined if not found
 */
export function getAgentNetwork(networkName: string): AgentNetwork | undefined {
  const networks = {
    deaninsights: deanInsightsNetwork,
    dataflow: dataFlowNetwork,
    contentcreation: contentCreationNetwork,
  };

  const normalizedName = networkName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return networks[normalizedName as keyof typeof networks];
}

/**
 * Export all networks in a format compatible with the Mastra instance configuration
 */
export const networks = {
  deanInsightsNetwork,
  dataFlowNetwork,
  contentCreationNetwork,
};
