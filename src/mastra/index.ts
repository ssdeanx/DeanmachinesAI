import { Mastra } from "@mastra/core";
import { createLogger } from "@mastra/core/logger";
import {
  researchAgent,
  analystAgent,
  writerAgent,
  rlTrainerAgent,
  dataManagerAgent,
} from "./agents";
import { ragWorkflow } from "./workflows";
import {
  deanInsightsNetwork,
  dataFlowNetwork,
  contentCreationNetwork,
  networks,
} from "./workflows/Networks/agentNetwork";
import { sharedMemory as memory } from "./database";
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

// Re-export agent networks for easier access
export { deanInsightsNetwork, dataFlowNetwork, contentCreationNetwork };

// Create and export the Mastra instance
export const mastra = new Mastra({
  agents: {
    researchAgent,
    analystAgent,
    writerAgent,
    rlTrainerAgent,
    dataManagerAgent,
  },
  workflows: {
    ragWorkflow,
  },
  networks,
  logger: createLogger({ name: "DeanmachinesAI", level: "info" }),
  // Memory is now injected per agent via createAgentFromConfig instead of globally
  // This follows RULE-MemoryInjection from best practices
  serverMiddleware: [
    {
      handler: (c, next) => {
        console.log(
          `[${new Date().toISOString()}] Processing request: ${c.req.method} ${
            c.req.url
          }`
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
