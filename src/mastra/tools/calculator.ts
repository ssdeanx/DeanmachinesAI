import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { calculator } from "@agentic/calculator";

/**
 * Configuration for the calculator tool.
 *
 * @interface CalculatorConfig
 */
export interface CalculatorConfig {
  maxRetries?: number;
  timeout?: number;
}

/**
 * Creates a configured calculator client.
 *
 * @param _config Calculator configuration options.
 * @returns A tool instance that performs mathematical calculations.
 * @throws {Error} If the calculation fails.
 */
export function createCalculatorTool(_config: CalculatorConfig = {}) {
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
    execute: async ({ context }): Promise<{ result: number; steps?: string[] }> => {
      try {
        // Use the validated input from context
        const { expression } = context;
        const result = await calculator(expression);
        return {
          result: result,
          steps: [], // Calculator doesn't return steps
        };
      } catch (error: unknown) {
        throw new Error(
          `Calculation failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    },
  });
}
