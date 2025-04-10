import { Mastra } from "@mastra/core";
import { createLogger } from "@mastra/core/logger";
import {
  researchAgent,
  analystAgent,
  writerAgent,
  rlTrainerAgent,
  dataManagerAgent,
} from "./src/mastra/agents";
import { ragWorkflow, networks } from "./src/mastra/workflows";

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
  telemetry: {
    serviceName: "DeanmachinesAI",
    enabled: true,
    sampling: {
      type: "always_on",
    },
  },
  logger: createLogger({
    name: "DeanmachinesAI",
    level: "info",
  }),
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
