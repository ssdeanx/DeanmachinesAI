/**
 * ProductLaunchNetwork Implementation
 *
 * This module implements a collaborative network that coordinates between
 * coding and marketing teams to support product launch activities.
 * It connects the Coder agent with the Copywriter agent to streamline
 * the creation of both code and marketing materials.
 */

import { google } from "@ai-sdk/google";
import { AgentNetwork, type AgentNetworkConfig } from "@mastra/core/network";
import { createLogger } from "@mastra/core/logger";
import { coderAgent, copywriterAgent } from "../../agents";
import { createResponseHook } from "../../hooks";

// Configure logger for the network
const logger = createLogger({ name: "product-launch-network", level: "info" });

/**
 * Hooks for the ProductLaunchNetwork
 */
const productLaunchHooks = {
  onError: async (error: Error) => {
    logger.error("ProductLaunchNetwork error:", error);
    return {
      text: "The product launch network encountered an error. Please try again or contact support.",
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
        network: "productLaunch",
        timestamp: new Date().toISOString(),
        agentCount: 2,
      },
    };
  },
};

/**
 * ProductLaunchNetwork
 *
 * This network connects the Coder agent with the Copywriter agent to streamline
 * the creation of both code and marketing materials for product launches.
 *
 * @remarks
 * The network uses an LLM-based router to determine which agent to call based on
 * the task requirements. This enables dynamic collaboration between development
 * and marketing teams.
 */
export const productLaunchNetwork = new AgentNetwork({
  name: "Product Launch Network",
  model: google("models/gemini-2.0-flash"),
  agents: [coderAgent, copywriterAgent],
  instructions: `
    You are a product launch coordinator that manages collaboration between development and marketing teams.

    Your job is to:
    1. Analyze incoming requests related to product launches
    2. Route tasks to the appropriate specialized agent:
       - Coder Agent: For code generation, documentation, and technical implementation
       - Copywriter Agent: For marketing materials, product descriptions, and promotional content
    3. Synthesize the outputs from both teams into cohesive deliverables
    4. Maintain alignment between technical capabilities and marketing messaging

    When coordinating:
    - Ensure technical documentation matches actual functionality
    - Confirm marketing claims are supported by the implemented features
    - Facilitate communication between technical and marketing teams when needed
    - Balance technical accuracy with compelling messaging

    Based on the user's request, determine which agent would be best equipped to handle it.
    If the task requires both coding and marketing expertise, coordinate between the agents.
    Always provide clear reasoning for your agent selection decisions.
  `,
});

/**
 * Initialize the ProductLaunchNetwork
 *
 * @returns The initialized network instance
 */
export function initializeProductLaunchNetwork(): AgentNetwork {
  logger.info("Initializing ProductLaunchNetwork");
  return productLaunchNetwork;
}

// Export the initialized network
export default productLaunchNetwork;
