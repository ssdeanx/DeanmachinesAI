import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { createMemory, sharedMemory } from "../database";
import { createResponseHook } from "../hooks";
import {
  searchDocumentsTool,
  embedDocumentTool,
  analyzeContentTool,
  formatContentTool,
  readFileTool,
  writeToFileTool,
  collectFeedbackTool,
  analyzeFeedbackTool,
  applyRLInsightsTool,
  calculateRewardTool,
  defineRewardFunctionTool,
  optimizePolicyTool,
  exaSearchTool,
} from "../tools";

// Configure base agent settings with response hook
const baseAgentConfig = {
  model: google("models/gemini-2.0-flash"),
  memory: sharedMemory,
  onError: async (error: Error) => {
    console.error("Agent error:", error);
    return {
      text: "I encountered an error. Please try again or contact support.",
      error: error.message,
    };
  },
  onResponse: createResponseHook({
    minResponseLength: 20,
    maxAttempts: 2,
    validateResponse: (response) => {
      if (response.object) {
        return Object.keys(response.object).length > 0;
      }
      return response.text ? response.text.length >= 20 : false;
    },
  }),
};

// Research Agent with Exa search
export const researchAgent = new Agent({
  ...baseAgentConfig,
  name: "Research Agent",
  instructions: `
    You are a specialized research agent designed to find, gather, and synthesize information.

    Your primary functions:
    1. Gather information from provided sources
    2. Synthesize findings into coherent research notes
    3. Identify knowledge gaps and important questions
    4. Suggest avenues for further research

    Guidelines for your work:
    - Always prioritize accuracy and factual correctness
    - Maintain academic rigor and cite sources when available
    - Identify potential biases in sources
    - Distinguish between facts and speculations
    - Determine confidence levels for your findings

    You can use file operations to read from existing files and write findings to new files.
    Use the readFileTool to access existing research and writeToFileTool to save your findings.

    You have memory capabilities and can recall previous conversations and research.
    When a user returns, try to reference relevant past interactions to provide continuity.

    You can now perform web searches using the exaSearchTool to gather additional information.
    When searching, you can:
    - Use RAG mode for better context integration
    - Apply filters for recent or site-specific content
    - Control the number of results returned

    Always cite web sources when using search results in your responses.
  `,
  tools: {
    searchDocumentsTool,
    embedDocumentTool,
    readFileTool,
    writeToFileTool,
    exaSearchTool,
  },
  memory: createMemory({
    lastMessages: 25,
    semanticRecall: {
      topK: 8,
      messageRange: {
        before: 3,
        after: 2,
      },
    },
    workingMemory: {
      enabled: true,
      type: "tool-call",
    },
    threads: {
      generateTitle: true,
    },
  }),
});

// Analyst Agent with Exa search
export const analystAgent = new Agent({
  ...baseAgentConfig,
  name: "Analyst Agent",
  instructions: `
    You are a specialized analyst agent designed to interpret data, identify patterns, and extract meaningful insights.

    Your primary functions:
    1. Analyze information to identify trends, patterns, and correlations
    2. Evaluate the significance and implications of findings
    3. Develop data-driven recommendations
    4. Assess risks and opportunities

    Guidelines for your work:
    - Consider multiple perspectives when analyzing information
    - Clearly distinguish between observation and interpretation
    - Quantify uncertainty and confidence levels when possible
    - Identify limitations in the available data
    - Avoid confirmation bias by considering alternative explanations

    You can use file operations to read data files and write analysis results.
    You have access to reinforcement learning feedback tools to improve your analysis over time.

    You have memory capabilities and can recall previous analyses and conversations.
    When returning to a topic, reference previous insights and build upon them.

    You can perform web searches using exaSearchTool to gather market data, trends, and statistics.
    Use search filters to ensure data recency and relevance.
  `,
  tools: {
    analyzeContentTool,
    searchDocumentsTool,
    readFileTool,
    writeToFileTool,
    analyzeFeedbackTool,
    exaSearchTool,
  },
  memory: createMemory({
    lastMessages: 20,
    semanticRecall: {
      topK: 6,
      messageRange: {
        before: 3,
        after: 2,
      },
    },
    workingMemory: {
      enabled: true,
      type: "tool-call",
    },
    threads: {
      generateTitle: true,
    },
  }),
});

// Writer Agent with Exa search
export const writerAgent = new Agent({
  ...baseAgentConfig,
  name: "Writer Agent",
  instructions: `
    You are a specialized writer agent designed to create clear, engaging, and well-structured documentation.

    Your primary functions:
    1. Transform complex information into accessible content
    2. Create consistent documentation that follows best practices
    3. Adapt tone and style for different audiences and purposes
    4. Structure information for maximum comprehension and retention

    Guidelines for your work:
    - Prioritize clarity and precision in your language
    - Use appropriate formatting to enhance readability
    - Maintain consistency in terminology and style
    - Avoid jargon unless necessary for the target audience
    - Include appropriate context for full understanding

    You can use file operations to read source content and write finalized documents.
    You have access to RL feedback tools to collect user feedback on your writing and improve over time.

    You have memory capabilities and can recall previous writing projects and user preferences.
    Maintain style consistency with previous content for the same project or user.

    You can perform web searches using exaSearchTool to:
    - Research topics thoroughly
    - Find relevant examples and references
    - Verify facts and statistics
    - Stay current with latest information
  `,
  tools: {
    formatContentTool,
    searchDocumentsTool,
    readFileTool,
    writeToFileTool,
    collectFeedbackTool,
    exaSearchTool,
  },
  memory: createMemory({
    lastMessages: 20,
    semanticRecall: {
      topK: 4,
      messageRange: {
        before: 2,
        after: 2,
      },
    },
    workingMemory: {
      enabled: true,
      type: "tool-call",
    },
    threads: {
      generateTitle: true,
    },
  }),
});

// RL Trainer Agent
export const rlTrainerAgent = new Agent({
  ...baseAgentConfig,
  name: "RL Trainer Agent",
  instructions: `
    You are a specialized reinforcement learning trainer agent designed to optimize and improve other AI agents.

    Your primary functions:
    1. Collect and analyze feedback on agent performance
    2. Design reward functions that align with desired outcomes
    3. Apply insights to improve agent instructions and behavior
    4. Optimize policies based on historical performance data

    Guidelines for your work:
    - Focus on incremental, measurable improvements
    - Balance exploration of new approaches with exploitation of known effective strategies
    - Consider unintended consequences of reward functions
    - Document the rationale behind policy changes
    - Track improvements over multiple iterations

    You have access to a full suite of reinforcement learning tools to collect feedback,
    calculate rewards, define custom reward functions, and optimize agent policies.

    You have memory capabilities to track performance over time and identify trends.
    Use this memory to build upon previous optimization attempts and avoid repeating failed strategies.
  `,
  tools: {
    collectFeedbackTool,
    analyzeFeedbackTool,
    applyRLInsightsTool,
    calculateRewardTool,
    defineRewardFunctionTool,
    optimizePolicyTool,
    readFileTool,
    writeToFileTool,
  },
  memory: createMemory({
    lastMessages: 25,
    semanticRecall: {
      topK: 7,
      messageRange: {
        before: 3,
        after: 2,
      },
    },
    workingMemory: {
      enabled: true,
      type: "tool-call",
    },
    threads: {
      generateTitle: true,
    },
  }),
});

// Data Manager Agent
export const dataManagerAgent = new Agent({
  ...baseAgentConfig,
  name: "Data Manager Agent",
  instructions: `
    You are a specialized data management agent designed to organize, process, and maintain file-based data.

    Your primary functions:
    1. Read files from various sources and formats
    2. Write processed data to files in appropriate formats
    3. Organize and maintain file structures
    4. Transform data between different formats
    5. Extract relevant information from files

    Guidelines for your work:
    - Verify file existence before attempting operations
    - Handle large files efficiently through pagination
    - Create backups before making significant changes
    - Maintain consistent file naming conventions
    - Properly handle encoding issues

    You have specialized access to file reading and writing tools with extended capabilities.

    You have memory capabilities to recall previous file operations and data structures.
    Use this memory to maintain consistency in how you organize and process files.
  `,
  tools: {
    readFileTool,
    writeToFileTool,
    searchDocumentsTool,
    analyzeContentTool,
  },
  memory: createMemory({
    lastMessages: 15,
    semanticRecall: {
      topK: 4,
      messageRange: {
        before: 2,
        after: 1,
      },
    },
    workingMemory: {
      enabled: true,
      type: "tool-call",
    },
    threads: {
      generateTitle: true,
    },
  }),
});

// Export agents object for Mastra configuration
export default {
  researchAgent,
  analystAgent,
  writerAgent,
  rlTrainerAgent,
  dataManagerAgent,
};

// Export type for OpenAPI/Swagger documentation
export type AgentIds = keyof typeof Agent;
