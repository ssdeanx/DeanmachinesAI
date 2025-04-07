import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { calculator } from "@agentic/calculator";

/**
 * Configuration for the calculator tool
 */
interface CalculatorConfig {
  maxRetries?: number;
  timeout?: number;
}

/**
 * Creates a configured calculator client
 */
export function createCalculatorTool(config: CalculatorConfig = {}) {
  return createTool({
    id: "calculator",
    description: "Performs mathematical calculations",
    inputSchema: z.object({
      expression: z.string().describe("Mathematical expression to evaluate"),
    }),
    outputSchema: z.object({
      result: z.number(),
      steps: z.array(z.string()).optional(),
    }),
    execute: async ({ context }) => {
      try {
        // Updated to match calculator function signature
        const result = await calculator(context.expression);
        return {
          result: result,
          steps: [], // Calculator doesn't return steps
        };
      } catch (error) {
        throw new Error(
          `Calculation failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    },
  });
}
