/**
 * Reinforcement Learning Reward Function Tools for Mastra AI.
 *
 * This module provides tools for defining, managing, and optimizing RL reward functions
 * to guide agent learning through numerical feedback on actions taken in different states.
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { LibSQLStore } from "@mastra/core/storage/libsql";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createLangSmithRun, trackFeedback } from "../services/langsmith";
import { Memory } from "@mastra/memory";
import { env } from "process";

// Helper function to get environment variable with fallback
const getEnvVar = (name: string, fallback: string = ''): string => {
  const value = process.env[name];
  if (!value && !fallback) {
    console.warn(`Environment variable ${name} not set`);
  }
  return value || fallback;
};

// Create a storage instance
const getStorage = (): LibSQLStore => {
  try {
    // For development, use in-memory database if env variables aren't set
    const dbUrl = getEnvVar('TURSO_DATABASE_URL', 'file:rl-rewards.db');
    const authToken = getEnvVar('TURSO_DATABASE_KEY', '');

    return new LibSQLStore({
      config: {
        url: dbUrl,
        authToken
      }
    });
  } catch (error) {
    console.error("Error initializing LibSQLStore:", error);
    // Fallback to in-memory database
    return new LibSQLStore({
      config: {
        url: ':memory:'
      }
    });
  }
};

// Initialize a Memory instance for storing RL reward data
const memoryInstance = new Memory({
  storage: getStorage(),
});

/**
 * Represents a state-action pair in reinforcement learning
 */
export interface StateAction {
  /** Current state representation (can be any serializable data) */
  state: Record<string, unknown>;
  /** Action taken by the agent */
  action: string;
  /** Additional context about the action (optional) */
  context?: Record<string, unknown>;
}

/**
 * Types of reward signals that can be used
 */
export enum RewardType {
  /** Simple scalar reward (number) */
  SCALAR = "scalar",
  /** Vector reward (multiple dimensions) */
  VECTOR = "vector",
  /** Binary reward (success/failure) */
  BINARY = "binary",
  /** Human feedback reward */
  HUMAN = "human",
}

/**
 * Configuration for a reward function
 */
export interface RewardFunctionConfig {
  /** Unique identifier for this reward function */
  id: string;
  /** Human-readable name */
  name: string;
  /** Functional description */
  description: string;
  /** Type of rewards provided */
  rewardType: RewardType;
  /** Whether to normalize rewards to [-1,1] range */
  normalize?: boolean;
  /** Discount factor for future rewards (gamma) */
  discountFactor?: number;
  /** Weight for this reward if combined with others */
  weight?: number;
}

/**
 * Reward tracking data structure
 */
export interface RewardRecord {
  /** Timestamp when the reward was recorded */
  timestamp: string;
  /** Agent that received the reward */
  agentId: string;
  /** Episode or interaction identifier */
  episodeId: string;
  /** State-action pair that led to this reward */
  stateAction: StateAction;
  /** Numerical reward value */
  reward: number;
  /** Cumulative reward for the episode so far */
  cumulativeReward: number;
  /** Step number within the episode */
  stepNumber: number;
  /** Whether this is a terminal reward (end of episode) */
  isTerminal: boolean;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Tool for calculating rewards based on state-action pairs
 */
export const calculateRewardTool = createTool({
  id: "calculate-reward",
  description: "Calculates a reward value based on agent state and action",
  inputSchema: z.object({
    agentId: z.string().describe("ID of the agent being evaluated"),
    episodeId: z
      .string()
      .describe("Unique identifier for the current episode/interaction"),
    state: z.record(z.unknown()).describe("Current state representation"),
    action: z.string().describe("Action taken by the agent"),
    context: z
      .record(z.unknown())
      .optional()
      .describe("Additional context about the state-action"),
    rewardFunctionId: z
      .string()
      .optional()
      .describe("Specific reward function ID to use"),
    stepNumber: z
      .number()
      .optional()
      .default(0)
      .describe("Step number in the episode"),
    isTerminal: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether this is the terminal state"),
  }),
  outputSchema: z.object({
    reward: z.number(),
    cumulativeReward: z.number().optional(),
    normalizedReward: z.number().optional(),
    breakdown: z.record(z.number()).optional(),
    success: z.boolean(),
    rewardId: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const runId = await createLangSmithRun("calculate-reward", [
      "rl",
      "reward",
    ]);

    try {
      // Create the state-action pair
      const stateAction: StateAction = {
        state: context.state,
        action: context.action,
        context: context.context,
      };

      // Calculate the reward based on the state-action pair
      const { reward, breakdown } = await calculateStateActionReward(
        stateAction,
        context.rewardFunctionId
      );

      // Generate a unique ID for this reward record
      const rewardId = `reward_${context.agentId}_${Date.now()}`;

      // Get previous cumulative reward by querying the episode thread
      let cumulativeReward = reward;
      const episodeThreadId = `rl_episode_${context.agentId}_${context.episodeId}`;

      try {
        // Try to get existing thread for this episode
        const thread = await memoryInstance.getThreadById({ threadId: episodeThreadId });

        // If thread exists, get previous messages and calculate cumulative reward
        if (thread) {
          const { messages } = await memoryInstance.query({
            threadId: episodeThreadId,
            selectBy: { last: 1 } // Get most recent message
          });

          if (messages.length > 0) {
            try {
              // Parse the content which should contain the RewardRecord
              const content = typeof messages[0].content === 'string'
                ? messages[0].content
                : JSON.stringify(messages[0].content);
              const previousRecord = JSON.parse(content) as RewardRecord;
              cumulativeReward += previousRecord.cumulativeReward;
            } catch (parseError) {
              console.warn("Error parsing previous reward record:", parseError);
            }
          }
        }
      } catch (error) {
        console.warn("Error retrieving previous rewards:", error);
        // Continue with just the current reward
      }

      // Create the reward record
      const rewardRecord: RewardRecord = {
        timestamp: new Date().toISOString(),
        agentId: context.agentId,
        episodeId: context.episodeId,
        stateAction,
        reward,
        cumulativeReward,
        stepNumber: context.stepNumber || 0,
        isTerminal: context.isTerminal || false,
        metadata: {
          rewardFunctionId: context.rewardFunctionId,
          breakdown,
        },
      };

      // Create or get thread for this episode
      let thread;
      try {
        thread = await memoryInstance.getThreadById({ threadId: episodeThreadId });
      } catch (e) {
        // Thread doesn't exist yet, create it
        thread = await memoryInstance.createThread({
          resourceId: context.agentId,
          threadId: episodeThreadId,
          title: `RL Episode ${context.episodeId} for Agent ${context.agentId}`,
          metadata: {
            type: "rl_episode_thread",
            episodeId: context.episodeId
          }
        });
      }

      // Store the reward record as a message in the thread
      // Include metadata in the content as the addMessage method doesn't support metadata directly
      const messageContent = JSON.stringify({
        ...rewardRecord,
        rewardId,
        type: "rl_reward",
        reward,
        cumulativeReward,
        stepNumber: context.stepNumber || 0,
        isTerminal: context.isTerminal || false
      });

      await memoryInstance.addMessage({
        threadId: episodeThreadId,
        role: "assistant",
        content: messageContent,
        type: "text"
      });

      // Track in LangSmith for observability
      await trackFeedback(runId, {
        score: normalizeReward(reward),
        comment: `Reward calculated for agent ${context.agentId}, episode ${context.episodeId}, step ${context.stepNumber}`,
        key: "rl_reward_calculation",
        value: rewardRecord,
      });

      return {
        reward,
        cumulativeReward,
        normalizedReward: normalizeReward(reward),
        breakdown,
        success: true,
        rewardId,
      };
    } catch (error) {
      console.error("Error calculating reward:", error);

      // Track failure in LangSmith
      await trackFeedback(runId, {
        score: 0,
        comment: error instanceof Error ? error.message : "Unknown error",
        key: "rl_reward_calculation_failure",
      });

      return {
        reward: 0,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error calculating reward",
      };
    }
  },
});

/**
 * Tool for defining custom reinforcement learning reward functions
 */
export const defineRewardFunctionTool = createTool({
  id: "define-reward-function",
  description: "Creates or updates a custom reward function definition",
  inputSchema: z.object({
    id: z.string().describe("Unique identifier for the reward function"),
    name: z.string().describe("Human-readable name for the reward function"),
    description: z
      .string()
      .describe("Description of what the reward function measures"),
    rewardType: z
      .enum([
        RewardType.SCALAR,
        RewardType.VECTOR,
        RewardType.BINARY,
        RewardType.HUMAN,
      ])
      .describe("Type of reward signal"),
    formula: z
      .string()
      .describe("Formula or rule description for calculating the reward"),
    components: z
      .array(
        z.object({
          name: z.string().describe("Name of this reward component"),
          weight: z
            .number()
            .describe("Weight of this component in the overall reward"),
          description: z
            .string()
            .describe("Description of what this component measures"),
        })
      )
      .optional()
      .describe("Individual components that make up the reward"),
    normalize: z
      .boolean()
      .optional()
      .default(true)
      .describe("Whether to normalize rewards to [-1,1]"),
    discountFactor: z
      .number()
      .optional()
      .default(0.9)
      .describe("Discount factor for future rewards (gamma)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    functionId: z.string().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const runId = await createLangSmithRun("define-reward-function", [
      "rl",
      "reward-function",
    ]);

    try {
      // Create the reward function configuration
      const rewardFunction: RewardFunctionConfig & {
        formula: string;
        components?: Array<{
          name: string;
          weight: number;
          description: string;
        }>;
      } = {
        id: context.id,
        name: context.name,
        description: context.description,
        rewardType: context.rewardType,
        normalize: context.normalize,
        discountFactor: context.discountFactor,
        formula: context.formula,
        components: context.components,
      };

      // Generate a unique thread ID for storing reward functions
      const rewardFunctionThreadId = `rl_reward_functions`;

      // Create or get thread for reward functions
      let thread;
      try {
        thread = await memoryInstance.getThreadById({ threadId: rewardFunctionThreadId });
      } catch (e) {
        // Thread doesn't exist yet, create it
        thread = await memoryInstance.createThread({
          resourceId: 'system',
          threadId: rewardFunctionThreadId,
          title: `RL Reward Function Definitions`,
          metadata: {
            type: "rl_reward_function_thread"
          }
        });
      }

      // Store the reward function definition as a message
      const messageId = `reward_function_${context.id}`;

      // Include metadata in the content as the addMessage method doesn't support metadata directly
      const messageContent = JSON.stringify({
        ...rewardFunction,
        type: "rl_reward_function",
        functionId: context.id,
        functionName: context.name
      });

      await memoryInstance.addMessage({
        threadId: rewardFunctionThreadId,
        role: "assistant",
        content: messageContent,
        type: "text"
      });

      // Track in LangSmith
      await trackFeedback(runId, {
        score: 1,
        comment: `Reward function "${context.name}" defined successfully`,
        key: "rl_reward_function_definition",
        value: {
          id: context.id,
          name: context.name,
          components: context.components?.length || 0,
        },
      });

      return {
        success: true,
        functionId: context.id,
      };
    } catch (error) {
      console.error("Error defining reward function:", error);

      // Track failure in LangSmith
      await trackFeedback(runId, {
        score: 0,
        comment: error instanceof Error ? error.message : "Unknown error",
        key: "rl_reward_function_definition_failure",
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error defining reward function",
      };
    }
  },
});

/**
 * Tool for analyzing reinforcement learning rewards and optimizing policies
 */
export const optimizePolicyTool = createTool({
  id: "optimize-policy",
  description: "Analyzes reward data to suggest policy improvements",
  inputSchema: z.object({
    agentId: z.string().describe("ID of the agent to optimize"),
    episodeIds: z
      .array(z.string())
      .optional()
      .describe("Specific episodes to analyze"),
    startDate: z
      .string()
      .optional()
      .describe("Start date for analysis period (ISO format)"),
    endDate: z
      .string()
      .optional()
      .describe("End date for analysis period (ISO format)"),
    optimizationTarget: z
      .string()
      .optional()
      .describe("Specific aspect to optimize (e.g., 'accuracy', 'efficiency')"),
    currentPolicy: z
      .string()
      .optional()
      .describe("Current policy description or instructions"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    insights: z
      .array(
        z.object({
          aspect: z.string(),
          observation: z.string(),
          suggestion: z.string(),
          confidence: z.number(),
        })
      )
      .optional(),
    improvedPolicy: z.string().optional(),
    policyChanges: z
      .array(
        z.object({
          type: z.string(),
          description: z.string(),
          rationale: z.string(),
        })
      )
      .optional(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const runId = await createLangSmithRun("optimize-policy", ["rl", "policy"]);

    try {
      // Get memory adapter for retrieving reward data
      const memoryAdapter = getStorage();

      // Query parameters
      const startDate = context.startDate
        ? new Date(context.startDate)
        : new Date(0);
      const endDate = context.endDate ? new Date(context.endDate) : new Date();

      // Retrieve reward records for the specified agent and time period
      // Note: This is a simplified implementation - in practice, you would need to
      // implement a query mechanism for LibSQLStore that supports filtering by agent, date, etc.
      const rewardRecords = await retrieveAgentRewards(
        memoryAdapter,
        context.agentId,
        context.episodeIds,
        startDate,
        endDate
      );

      if (!rewardRecords || rewardRecords.length === 0) {
        return {
          success: false,
          error: "No reward data found for the specified agent and time period",
        };
      }

      // Use LLM to analyze rewards and suggest policy improvements
      const apiKey = getEnvVar('GOOGLE_GENERATIVE_AI_API_KEY');
      if (!apiKey) {
        throw new Error("Google Generative AI API key is required");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "models/gemini-2.0-pro",
      });

      // Prepare reward data summary for analysis
      const rewardSummary = summarizeRewards(rewardRecords);

      // Generate policy improvements
      const result = await model.generateContent(`
        You are an AI reinforcement learning expert. Analyze this reward data for an agent and suggest
        policy improvements to maximize future rewards.

        Agent ID: ${context.agentId}
        Time period: ${startDate.toISOString()} to ${endDate.toISOString()}
        Number of episodes: ${rewardSummary.episodeCount}
        Total actions: ${rewardSummary.totalActions}
        Average reward per action: ${rewardSummary.averageReward}
        Average episode return: ${rewardSummary.averageEpisodeReturn}

        ${context.optimizationTarget ? `Optimization target: ${context.optimizationTarget}` : ""}

        Current policy description:
        ${context.currentPolicy || "No current policy provided"}

        Top performing state-actions:
        ${JSON.stringify(rewardSummary.topStateActions, null, 2)}

        Worst performing state-actions:
        ${JSON.stringify(rewardSummary.worstStateActions, null, 2)}

        Based on this data, provide the following in JSON format:
        1. Key insights about the agent's performance
        2. Specific suggestions to improve the policy
        3. A revised policy description

        Return ONLY valid JSON with this structure:
        {
          "insights": [
            {
              "aspect": "string",
              "observation": "string",
              "suggestion": "string",
              "confidence": number
            }
          ],
          "improvedPolicy": "string",
          "policyChanges": [
            {
              "type": "string",
              "description": "string",
              "rationale": "string"
            }
          ]
        }
      `);

      const analysisText = result.response.text();
      let analysis: {
        insights: Array<{
          aspect: string;
          observation: string;
          suggestion: string;
          confidence: number;
        }>;
        improvedPolicy: string;
        policyChanges: Array<{
          type: string;
          description: string;
          rationale: string;
        }>;
      };

      try {
        // Extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse LLM response as JSON");
        }
      } catch (jsonError) {
        console.error("Error parsing policy optimization result:", jsonError);
        throw new Error("Failed to parse policy optimization results");
      }

      // Track success in LangSmith
      await trackFeedback(runId, {
        score: 1,
        comment: `Successfully analyzed ${rewardRecords.length} reward records for policy optimization`,
        key: "rl_policy_optimization_success",
        value: {
          insightCount: analysis.insights.length,
          policyChangeCount: analysis.policyChanges.length,
        },
      });

      return {
        success: true,
        insights: analysis.insights,
        improvedPolicy: analysis.improvedPolicy,
        policyChanges: analysis.policyChanges,
      };
    } catch (error) {
      console.error("Error optimizing policy:", error);

      // Track failure in LangSmith
      await trackFeedback(runId, {
        score: 0,
        comment: error instanceof Error ? error.message : "Unknown error",
        key: "rl_policy_optimization_failure",
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error optimizing policy",
      };
    }
  },
});

/**
 * Calculates reward for a given state-action pair
 *
 * @param stateAction - The state-action pair to evaluate
 * @param rewardFunctionId - Optional specific reward function to use
 * @returns Reward value and breakdown
 */
async function calculateStateActionReward(
  stateAction: StateAction,
  rewardFunctionId?: string
): Promise<{ reward: number; breakdown?: Record<string, number> }> {
  // This is a simplified implementation - in a real system you would:
  // 1. Retrieve the specific reward function from the database
  // 2. Apply the function's formula to the state-action pair
  // 3. Return the calculated reward

  // For demonstration, we'll implement a simple reward calculation
  try {
    // Example reward calculation - adapt this to your specific use case
    const breakdown: Record<string, number> = {};
    let totalReward = 0;

    // Example component: task completion reward
    if (stateAction.context?.taskCompleted === true) {
      const completionReward = 10;
      breakdown.taskCompletion = completionReward;
      totalReward += completionReward;
    }

    // Example component: efficiency reward (negative for high latency)
    if (typeof stateAction.context?.latencyMs === "number") {
      const latency = stateAction.context.latencyMs as number;
      const efficiencyReward = Math.max(-5, -latency / 1000); // Cap at -5
      breakdown.efficiency = efficiencyReward;
      totalReward += efficiencyReward;
    }

    // Example component: accuracy reward
    if (typeof stateAction.context?.accuracy === "number") {
      const accuracy = stateAction.context.accuracy as number;
      const accuracyReward = accuracy * 5; // Scale 0-1 accuracy to 0-5 reward
      breakdown.accuracy = accuracyReward;
      totalReward += accuracyReward;
    }

    // Default small reward for taking any action (encourages exploration)
    const explorationReward = 0.1;
    breakdown.exploration = explorationReward;
    totalReward += explorationReward;

    return { reward: totalReward, breakdown };
  } catch (error) {
    console.error("Error calculating reward:", error);
    return { reward: 0 }; // Default to zero reward on error
  }
}

/**
 * Normalizes a reward value to the range [-1, 1]
 *
 * @param reward - Raw reward value
 * @returns Normalized reward in range [-1, 1]
 */
function normalizeReward(reward: number): number {
  // Simple normalization using tanh
  return Math.tanh(reward / 10);
}

/**
 * Retrieves previous rewards for a specific agent and episode
 *
 * @param storage - Storage adapter for reward data
 * @param agentId - ID of the agent
 * @param episodeId - ID of the episode
 * @returns Array of reward records, or undefined if none found
 */
async function retrievePreviousRewards(
  storage: LibSQLStore,
  agentId: string,
  episodeId: string
): Promise<RewardRecord[] | undefined> {
  // This is a simplified placeholder - in a real implementation you would:
  // 1. Query the database for rewards matching the agent and episode IDs
  // 2. Sort and return the results

  // For demonstration purposes, we return an empty array
  // Replace this with actual database query logic
  return [];
}

/**
 * Retrieves reward records for an agent within a time period
 *
 * @param storage - Storage adapter for reward data
 * @param agentId - ID of the agent
 * @param episodeIds - Optional specific episodes to include
 * @param startDate - Start of the time period
 * @param endDate - End of the time period
 * @returns Array of reward records
 */
async function retrieveAgentRewards(
  storage: LibSQLStore,
  agentId: string,
  episodeIds?: string[],
  startDate?: Date,
  endDate?: Date
): Promise<RewardRecord[]> {
  // This is a simplified placeholder - in a real implementation you would:
  // 1. Query the database for rewards matching the criteria
  // 2. Filter by dates and episodes if provided
  // 3. Sort and return the results

  // For demonstration purposes, we generate sample data
  return generateSampleRewardRecords(agentId, 5, 10);
}

/**
 * Generates sample reward records for testing and demonstration
 *
 * @param agentId - ID of the agent
 * @param episodeCount - Number of episodes to generate
 * @param actionsPerEpisode - Number of actions per episode
 * @returns Array of sample reward records
 */
function generateSampleRewardRecords(
  agentId: string,
  episodeCount: number,
  actionsPerEpisode: number
): RewardRecord[] {
  const records: RewardRecord[] = [];

  for (let e = 0; e < episodeCount; e++) {
    const episodeId = `episode_${e}_${Date.now()}`;
    let cumulativeReward = 0;

    for (let a = 0; a < actionsPerEpisode; a++) {
      const isTerminal = a === actionsPerEpisode - 1;
      const reward = Math.random() * 2 - 0.5; // Random between -0.5 and 1.5
      cumulativeReward += reward;

      const timestamp = new Date(
        Date.now() -
          (episodeCount - e) * 86400000 -
          (actionsPerEpisode - a) * 60000
      ).toISOString();

      records.push({
        timestamp,
        agentId,
        episodeId,
        stateAction: {
          state: { position: a, context: `State in episode ${e}` },
          action: `action_${a % 3}`, // One of 3 possible actions
          context: {
            taskCompleted: isTerminal,
            accuracy: 0.5 + Math.random() * 0.5,
            latencyMs: 100 + Math.random() * 500,
          },
        },
        reward,
        cumulativeReward,
        stepNumber: a,
        isTerminal,
        metadata: {
          rewardFunctionId: "default",
        },
      });
    }
  }

  // Sort by timestamp
  return records.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Summarizes reward records for analysis
 *
 * @param records - Array of reward records
 * @returns Summary statistics for the rewards
 */
function summarizeRewards(records: RewardRecord[]): {
  episodeCount: number;
  totalActions: number;
  averageReward: number;
  averageEpisodeReturn: number;
  topStateActions: Array<{
    action: string;
    state: Record<string, unknown>;
    averageReward: number;
  }>;
  worstStateActions: Array<{
    action: string;
    state: Record<string, unknown>;
    averageReward: number;
  }>;
} {
  // Extract episodes
  const episodes = new Set<string>();
  records.forEach((record) => episodes.add(record.episodeId));

  // Calculate average reward
  const totalReward = records.reduce((sum, record) => sum + record.reward, 0);
  const averageReward = totalReward / records.length;

  // Calculate average episode return (sum of rewards in each episode)
  const episodeReturns: Record<string, number> = {};
  records.forEach((record) => {
    if (!episodeReturns[record.episodeId]) {
      episodeReturns[record.episodeId] = 0;
    }
    episodeReturns[record.episodeId] += record.reward;
  });

  const totalEpisodeReturn = Object.values(episodeReturns).reduce(
    (sum, val) => sum + val,
    0
  );
  const averageEpisodeReturn = totalEpisodeReturn / episodes.size;

  // Analyze state-actions
  const stateActionRewards: Record<
    string,
    {
      totalReward: number;
      count: number;
      action: string;
      state: Record<string, unknown>;
    }
  > = {};

  records.forEach((record) => {
    // Create a simple hash of the state-action for grouping
    const stateHash = JSON.stringify(record.stateAction.state);
    const key = `${stateHash}|${record.stateAction.action}`;

    if (!stateActionRewards[key]) {
      stateActionRewards[key] = {
        totalReward: 0,
        count: 0,
        action: record.stateAction.action,
        state: record.stateAction.state,
      };
    }

    stateActionRewards[key].totalReward += record.reward;
    stateActionRewards[key].count++;
  });

  // Calculate average rewards per state-action
  const stateActionPerformance = Object.values(stateActionRewards).map(
    (item) => ({
      action: item.action,
      state: item.state,
      averageReward: item.totalReward / item.count,
    })
  );

  // Sort by average reward
  stateActionPerformance.sort((a, b) => b.averageReward - a.averageReward);

  // Get top and worst performers
  const topStateActions = stateActionPerformance.slice(0, 3);
  const worstStateActions = stateActionPerformance.slice(-3).reverse();

  return {
    episodeCount: episodes.size,
    totalActions: records.length,
    averageReward,
    averageEpisodeReturn,
    topStateActions,
    worstStateActions,
  };
}
