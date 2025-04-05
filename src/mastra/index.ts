import { Mastra } from "@mastra/core";
import { createLogger } from "@mastra/core/logger";
import { researchAgent, analystAgent, writerAgent } from "./agents";
import { ragWorkflow } from "./workflows";
import { memory } from "./database";
import {
  collectFeedbackTool,
  analyzeFeedbackTool,
  applyRLInsightsTool,
} from "./tools/rlFeedback";
import {
  calculateRewardTool,
  defineRewardFunctionTool,
  optimizePolicyTool,
} from "./tools/rlReward";

// Re-export the RL tools for easier access
export {
  collectFeedbackTool,
  analyzeFeedbackTool,
  applyRLInsightsTool,
  calculateRewardTool,
  defineRewardFunctionTool,
  optimizePolicyTool,
};

// Create and export the Mastra instance
export const mastra = new Mastra({
  agents: {
    researchAgent,
    analystAgent,
    writerAgent,
  },
  workflows: {
    ragWorkflow,
  },
  tools: {
    // RL feedback tools
    collectFeedback: collectFeedbackTool,
    analyzeFeedback: analyzeFeedbackTool,
    applyRLInsights: applyRLInsightsTool,
    // RL reward tools
    calculateReward: calculateRewardTool,
    defineRewardFunction: defineRewardFunctionTool,
    optimizePolicy: optimizePolicyTool,
  },
  logger: createLogger({ name: "DeanmachinesAI", level: "info" }),
  // Use the properly configured memory from the database module
  memory,
  serverMiddleware: [
    {
      handler: (c, next) => {
        console.log(
          `[${new Date().toISOString()}] Processing request: ${c.req.method} ${c.req.url}`
        );
        // Track request timing for RL metrics
        const startTime = Date.now();

        const result = next();

        const endTime = Date.now();
        console.log(`Request processed in ${endTime - startTime}ms`);

        return result;
      },
    },
  ],
});
