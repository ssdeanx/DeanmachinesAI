import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone"; // Correct client import
import { PineconeStore } from "@langchain/pinecone"; // Correct store import for LangChain
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "process";

// Re-export document tools
export * from "./document";
// Re-export GraphRAG tools
export * from "./graphRag";
// Re-export file reading and writing tools
export * from "./readwrite";
// Re-export RL feedback tools
export * from "./rlFeedback";
// Re-export RL reward tools
export * from "./rlReward";
// Re-export exaSearch tool
export * from "./exasearch";

// Initialize embeddings model
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY!,
  modelName: env.EMBEDDING_MODEL || "models/gemini-embedding-exp-03-07",
});

// Initialize Pinecone client
const pineconeClient = new Pinecone({
  apiKey: env.PINECONE_API_KEY!,
});

const pineconeIndex = pineconeClient.Index(env.PINECONE_INDEX || "Default");

/**
 * Tool for searching documents based on semantic similarity
 */
export const searchDocumentsTool = createTool({
  id: "search-documents",
  description: "Search for relevant documents based on a query",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    topK: z.number().default(3).describe("Number of top results to return"),
  }),
  outputSchema: z.object({
    documents: z.array(
      z.object({
        content: z.string(),
        metadata: z.record(z.string(), z.any()),
      })
    ),
  }),
  execute: async ({ context }) => {
    try {
      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
      });

      const results = await vectorStore.similaritySearch(
        context.query,
        context.topK
      );

      return {
        documents: results.map((doc) => ({
          content: doc.pageContent,
          metadata: doc.metadata,
        })),
      };
    } catch (error) {
      console.error("Error searching documents:", error);
      return { documents: [] };
    }
  },
});

/**
 * Tool for content analysis using Google Generative AI
 */
export const analyzeContentTool = createTool({
  id: "analyze-content",
  description: "Analyze content for key insights, topics, and sentiment",
  inputSchema: z.object({
    content: z.string().describe("Content to analyze"),
  }),
  outputSchema: z.object({
    topics: z.array(z.string()),
    entities: z.array(
      z.object({
        name: z.string(),
        type: z.string().optional(),
      })
    ),
    sentiment: z.object({
      score: z.number(),
      label: z.enum(["positive", "negative", "neutral"]),
    }),
    summary: z.string(),
  }),
  execute: async ({ context }) => {
    const genAI = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-pro" });

    try {
      const result = await model.generateContent(`
        Analyze the following content and return a JSON object with:
        1. A list of main topics (maximum 5)
        2. A list of key entities mentioned (with their types if applicable)
        3. The overall sentiment (score between -1 and 1, and a label of positive, negative, or neutral)
        4. A brief summary (maximum 100 words)

        Content: ${context.content}

        Return ONLY a valid JSON object with this structure:
        {
          "topics": ["topic1", "topic2", ...],
          "entities": [{"name": "entity1", "type": "type1"}, ...],
          "sentiment": {"score": 0.0, "label": "neutral"},
          "summary": "Brief summary here"
        }
      `);

      const analysisText = result.response.text();
      try {
        // Extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            topics: analysis.topics || [],
            entities: analysis.entities || [],
            sentiment: analysis.sentiment || { score: 0, label: "neutral" },
            summary: analysis.summary || "",
          };
        }
      } catch (jsonError) {
        console.error("Error parsing analysis result:", jsonError);
      }

      // Fallback
      return {
        topics: [],
        entities: [],
        sentiment: { score: 0, label: "neutral" },
        summary: "Analysis failed to produce valid results.",
      };
    } catch (error) {
      console.error("Error analyzing content:", error);
      return {
        topics: [],
        entities: [],
        sentiment: { score: 0, label: "neutral" },
        summary: "Error occurred during content analysis.",
      };
    }
  },
});

/**
 * Tool for formatting content into well-structured documents
 */
export const formatContentTool = createTool({
  id: "format-content",
  description: "Format and structure content for documentation or reports",
  inputSchema: z.object({
    content: z.string().describe("Content to format"),
    format: z
      .enum(["markdown", "report", "brief"])
      .default("markdown")
      .describe("Output format"),
  }),
  outputSchema: z.object({
    formattedContent: z.string(),
  }),
  execute: async ({ context }) => {
    const genAI = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-pro" });

    try {
      let prompt = "";
      switch (context.format) {
        case "markdown":
          prompt = `Format the following content into well-structured Markdown with headings, bullet points, and code blocks where appropriate:\n\n${context.content}`;
          break;
        case "report":
          prompt = `Format the following content into a formal report structure with Executive Summary, Introduction, Key Findings, Analysis, and Conclusion sections:\n\n${context.content}`;
          break;
        case "brief":
          prompt = `Create a concise briefing from the following content, highlighting only the most important points:\n\n${context.content}`;
          break;
        default:
          prompt = `Format the following content clearly and professionally:\n\n${context.content}`;
      }

      const result = await model.generateContent(prompt);
      return {
        formattedContent: result.response.text(),
      };
    } catch (error) {
      console.error("Error formatting content:", error);
      return {
        formattedContent: context.content,
      };
    }
  },
});
