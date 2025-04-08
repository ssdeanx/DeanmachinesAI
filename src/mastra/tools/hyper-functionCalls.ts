import { google } from "@ai-sdk/google";
import { Hyperbrowser } from "@hyperbrowser/sdk";
import {
  WebsiteCrawlTool,
  WebsiteScrapeTool,
  WebsiteExtractTool,
} from "@hyperbrowser/sdk/tools";
import { env } from "process";

/**
 * Initialize Hyperbrowser and Google AI clients
 */
const hb = new Hyperbrowser({ apiKey: env.HYPERBROWSER_API_KEY });
const ai = google("models/gemini-2.0-flash");

interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Handles tool calls from the AI and executes corresponding actions
 */
async function handleToolCall(tc: ToolCall) {
  console.log("Handling tool call");

  try {
    const args = JSON.parse(tc.function.arguments);
    console.log(`Tool call ID: ${tc.id}`);
    console.log(`Function name: ${tc.function.name}`);
    console.log(`Function args: ${JSON.stringify(args, null, 2)}`);
    console.log("-".repeat(50));

    if (
      tc.function.name === WebsiteCrawlTool.openaiToolDefinition.function.name
    ) {
      const response = await WebsiteCrawlTool.runnable(hb, args);
      return {
        tool_call_id: tc.id,
        content: response,
        role: "tool",
      };
    } else if (
      tc.function.name === WebsiteScrapeTool.openaiToolDefinition.function.name
    ) {
      const response = await WebsiteScrapeTool.runnable(hb, args);
      return {
        tool_call_id: tc.id,
        content: response,
        role: "tool",
      };
    } else if (
      tc.function.name === WebsiteExtractTool.openaiToolDefinition.function.name
    ) {
      const response = await WebsiteExtractTool.runnable(hb, args);
      return {
        tool_call_id: tc.id,
        content: response,
        role: "tool",
      };
    } else {
      return {
        tool_call_id: tc.id,
        content: "Unknown tool call",
        role: "tool",
      };
    }
  } catch (e) {
    console.error(e);
    return {
      role: "tool",
      tool_call_id: tc.id,
      content: `Error occurred: ${e}`,
    };
  }
}

const messages = [
  {
    role: "user",
    content: "What does Hyperbrowser.ai do? Provide citations.",
  },
];

/**
 * Runs an interactive chat session with AI using website tools
 */
async function chat() {
  while (true) {
    const resp = await (
      ai as unknown as {
        createCompletion: (options: {
          messages: unknown;
          tools: unknown[];
        }) => Promise<any>;
      }
    ).createCompletion({
      messages,
      tools: [
        WebsiteCrawlTool.openaiToolDefinition,
        WebsiteScrapeTool.openaiToolDefinition,
        WebsiteExtractTool.openaiToolDefinition,
      ],
    });

    const choice = resp.choices[0];
    messages.push(choice.message);

    if (choice.finish_reason === "tool_calls") {
      for (const tc of choice.message.tool_calls) {
        const result = await handleToolCall(tc);
        messages.push(result);
      }
    } else if (choice.finish_reason === "stop") {
      console.log(choice.message.content);
      break;
    } else {
      throw new Error("Unknown Error Occurred");
    }
  }
}

// Start the chat session
chat();
