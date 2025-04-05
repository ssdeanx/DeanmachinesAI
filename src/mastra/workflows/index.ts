import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { Step, Workflow } from "@mastra/core/workflows";
import { z } from "zod";
import { researchAgent, analystAgent, writerAgent } from "../agents";
import { memory } from "../database";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

const llm = google("gemini-1.5-pro-latest");
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const agent = new Agent({
  name: "Weather Agent",
  model: llm,
  instructions: `
        You are a local activities and travel expert who excels at weather-based planning. Analyze the weather data and provide practical activity recommendations.

        For each day in the forecast, structure your response exactly as follows:

        📅 [Day, Month Date, Year]
        ═══════════════════════════

        🌡️ WEATHER SUMMARY
        • Conditions: [brief description]
        • Temperature: [X°C/Y°F to A°C/B°F]
        • Precipitation: [X% chance]

        🌅 MORNING ACTIVITIES
        Outdoor:
        • [Activity Name] - [Brief description including specific location/route]
          Best timing: [specific time range]
          Note: [relevant weather consideration]

        🌞 AFTERNOON ACTIVITIES
        Outdoor:
        • [Activity Name] - [Brief description including specific location/route]
          Best timing: [specific time range]
          Note: [relevant weather consideration]

        🏠 INDOOR ALTERNATIVES
        • [Activity Name] - [Brief description including specific venue]
          Ideal for: [weather condition that would trigger this alternative]

        ⚠️ SPECIAL CONSIDERATIONS
        • [Any relevant weather warnings, UV index, wind conditions, etc.]

        Guidelines:
        - Suggest 2-3 time-specific outdoor activities per day
        - Include 1-2 indoor backup options
        - For precipitation >50%, lead with indoor activities
        - All activities must be specific to the location
        - Include specific venues, trails, or locations
        - Consider activity intensity based on temperature
        - Keep descriptions concise but informative

        Maintain this exact formatting for consistency, using the emoji and section headers as shown.
      `,
});

const fetchWeather = new Step({
  id: "fetch-weather",
  description: "Fetches weather forecast for a given city",
  inputSchema: z.object({
    city: z.string().describe("The city to get the weather for"),
  }),
  execute: async ({ context }) => {
    const triggerData = context?.getStepResult<{ city: string }>("trigger");

    if (!triggerData) {
      throw new Error("Trigger data not found");
    }

    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(triggerData.city)}&count=1`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = (await geocodingResponse.json()) as {
      results: { latitude: number; longitude: number; name: string }[];
    };

    if (!geocodingData.results?.[0]) {
      throw new Error(`Location '${triggerData.city}' not found`);
    }

    const { latitude, longitude, name } = geocodingData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_mean,weathercode&timezone=auto`;
    const response = await fetch(weatherUrl);
    const data = (await response.json()) as {
      daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_mean: number[];
        weathercode: number[];
      };
    };

    const forecast = data.daily.time.map((date: string, index: number) => ({
      date,
      maxTemp: data.daily.temperature_2m_max[index],
      minTemp: data.daily.temperature_2m_min[index],
      precipitationChance: data.daily.precipitation_probability_mean[index],
      condition: getWeatherCondition(data.daily.weathercode[index]!),
      location: name,
    }));

    return forecast;
  },
});

const forecastSchema = z.array(
  z.object({
    date: z.string(),
    maxTemp: z.number(),
    minTemp: z.number(),
    precipitationChance: z.number(),
    condition: z.string(),
    location: z.string(),
  })
);

const planActivities = new Step({
  id: "plan-activities",
  description: "Suggests activities based on weather conditions",
  inputSchema: forecastSchema,
  execute: async ({ context, mastra }) => {
    const forecast =
      context?.getStepResult<z.infer<typeof forecastSchema>>("fetch-weather");

    if (!forecast || forecast.length === 0) {
      throw new Error("Forecast data not found");
    }

    const prompt = `Based on the following weather forecast for ${forecast[0]?.location}, suggest appropriate activities:
      ${JSON.stringify(forecast, null, 2)}
      `;

    const response = await agent.stream([
      {
        role: "user",
        content: prompt,
      },
    ]);

    let activitiesText = "";

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      activitiesText += chunk;
    }

    return {
      activities: activitiesText,
    };
  },
});

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    95: "Thunderstorm",
  };
  return conditions[code] || "Unknown";
}

const weatherWorkflow = new Workflow({
  name: "weather-workflow",
  triggerSchema: z.object({
    city: z.string().describe("The city to get the weather for"),
  }),
})
  .step(fetchWeather)
  .then(planActivities);

weatherWorkflow.commit();

// Create a research step that gathers relevant information
const researchStep = new Step({
  id: "research-step",
  description: "Researches the query and gathers relevant information",
  inputSchema: z.object({
    query: z.string().describe("The research query to investigate"),
  }),
  execute: async ({ context, mastra }) => {
    const triggerData = context?.getStepResult<{ query: string }>("trigger");

    if (!triggerData) {
      throw new Error("Trigger data not found");
    }

    // Use the research agent to gather information
    const response = await researchAgent.generate(
      `Research the following topic in depth: ${triggerData.query}`,
      {
        memoryOptions: {
          lastMessages: 10,
        },
      }
    );

    // Return the research findings
    return {
      query: triggerData.query,
      findings: response.text,
      timestamp: new Date().toISOString(),
    };
  },
});

// Create an analysis step that processes the research findings
const analysisStep = new Step({
  id: "analysis-step",
  description: "Analyzes the research findings and extracts insights",
  inputSchema: z.object({
    query: z.string(),
    findings: z.string(),
    timestamp: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    const researchData = context?.getStepResult<{
      query: string;
      findings: string;
      timestamp: string;
    }>("research-step");

    if (!researchData) {
      throw new Error("Research data not found");
    }

    // Use the analyst agent to analyze the findings
    const response = await analystAgent.generate(
      `Analyze these research findings on "${researchData.query}" and extract key insights, patterns, and implications:\n\n${researchData.findings}`,
      {
        memoryOptions: {
          lastMessages: 10,
        },
      }
    );

    // Return the analysis
    return {
      query: researchData.query,
      findings: researchData.findings,
      analysis: response.text,
      timestamp: researchData.timestamp,
    };
  },
});

// Create a documentation step that creates a final report
const documentationStep = new Step({
  id: "documentation-step",
  description:
    "Creates a well-formatted document based on research and analysis",
  inputSchema: z.object({
    query: z.string(),
    findings: z.string(),
    analysis: z.string(),
    timestamp: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    const analysisData = context?.getStepResult<{
      query: string;
      findings: string;
      analysis: string;
      timestamp: string;
    }>("analysis-step");

    if (!analysisData) {
      throw new Error("Analysis data not found");
    }

    // Use the writer agent to create documentation
    const response = await writerAgent.generate(
      `Create a comprehensive report based on this research query, findings, and analysis:\n\nQUERY: ${analysisData.query}\n\nFINDINGS: ${analysisData.findings}\n\nANALYSIS: ${analysisData.analysis}`,
      {
        memoryOptions: {
          lastMessages: 10,
        },
      }
    );
    // Store the final document in Pinecone for future retrieval
    try {
      // Initialize the Pinecone client
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      // Get the index from the client
      const indexName = process.env.PINECONE_INDEX || "Default";
      const pineconeIndex = pinecone.Index(indexName);

      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
      });

      await vectorStore.addDocuments([
        {
          pageContent: response.text,
          metadata: {
            query: analysisData.query,
            timestamp: analysisData.timestamp,
            type: "final_report",
          },
        },
      ]);
    } catch (error) {
      console.error("Error storing document in vector database:", error);
    }

    // Return the final document
    return {
      query: analysisData.query,
      document: response.text,
      timestamp: new Date().toISOString(),
    };
  },
});

// RL Feedback Collection Step (for reinforcement learning)
const feedbackStep = new Step({
  id: "feedback-step",
  description: "Collects feedback for reinforcement learning",
  inputSchema: z.object({
    query: z.string(),
    document: z.string(),
    timestamp: z.string(),
    feedback: z
      .object({
        accuracy: z.number().min(1).max(10).describe("Accuracy rating (1-10)"),
        completeness: z
          .number()
          .min(1)
          .max(10)
          .describe("Completeness rating (1-10)"),
        clarity: z.number().min(1).max(10).describe("Clarity rating (1-10)"),
        comments: z
          .string()
          .optional()
          .describe("Additional feedback comments"),
      })
      .optional(),
  }),
  execute: async ({ context, mastra }) => {
    const documentData = context?.getStepResult<{
      query: string;
      document: string;
      timestamp: string;
      feedback?: {
        accuracy: number;
        completeness: number;
        clarity: number;
        comments?: string;
      };
    }>("documentation-step");

    if (!documentData) {
      throw new Error("Document data not found");
    }

    // For simulation purposes, we'll use a simple model to evaluate the document
    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY!
    );
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

    try {
      const result = await model.generateContent(`
        You are an evaluator for research documents. Rate the following document on a scale of 1-10 for:
        1. Accuracy (factual correctness)
        2. Completeness (covers all aspects of the topic)
        3. Clarity (easy to understand)

        Also provide brief comments on what could be improved.

        QUERY: ${documentData.query}
        DOCUMENT: ${documentData.document}

        Return ONLY valid JSON with this structure:
        {
          "accuracy": 7,
          "completeness": 8,
          "clarity": 9,
          "comments": "Brief feedback comments here"
        }
      `);

      const feedbackText = result.response.text();
      let feedback;

      try {
        // Extract JSON from the response
        const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          feedback = JSON.parse(jsonMatch[0]);
        } else {
          // Default feedback if parsing fails
          feedback = {
            accuracy: 7,
            completeness: 7,
            clarity: 7,
            comments: "Unable to parse specific feedback",
          };
        }
      } catch (jsonError) {
        console.error("Error parsing feedback:", jsonError);
        feedback = {
          accuracy: 7,
          completeness: 7,
          clarity: 7,
          comments: "Error occurred during feedback generation",
        };
      }

      // Store feedback in memory for reinforcement learning
      try {
        // Create a unique thread for storing this feedback entry
        const feedbackThreadId = `feedback_${documentData.timestamp.replace(/[^a-zA-Z0-9]/g, "")}`;
        const feedbackResourceId = `feedback_resource_${documentData.query.replace(/\s+/g, "_").toLowerCase()}`;

        // Store feedback as metadata on a new thread
        await memory.createThread({
          resourceId: feedbackResourceId,
          threadId: feedbackThreadId,
          title: `Feedback for: ${documentData.query}`,
          metadata: {
            query: documentData.query,
            feedback,
            timestamp: new Date().toISOString(),
            origin: "system",
          },
        });
      } catch (storageError) {
        console.error("Error storing feedback in memory:", storageError);
      }

      return {
        query: documentData.query,
        document: documentData.document,
        feedback,
        timestamp: documentData.timestamp,
      };
    } catch (error) {
      console.error("Error in feedback step:", error);
      return {
        query: documentData.query,
        document: documentData.document,
        feedback: {
          accuracy: 5,
          completeness: 5,
          clarity: 5,
          comments: "Error occurred during feedback collection",
        },
        timestamp: documentData.timestamp,
      };
    }
  },
});

// Create the complete RAG workflow
const ragWorkflow = new Workflow({
  name: "rag-research-workflow",
  triggerSchema: z.object({
    query: z.string().describe("The research query to investigate"),
  }),
})
  .step(researchStep)
  .then(analysisStep)
  .then(documentationStep)
  .then(feedbackStep);

// Commit the workflow
ragWorkflow.commit();

export { weatherWorkflow, ragWorkflow };

/**
 * Workflows Index
 *
 * This file exports all workflows and agent networks available in the DeanmachinesAI system.
 * Workflows provide predefined execution paths, while AgentNetworks use LLM-based routing
 * for dynamic agent collaboration.
 */

// Export agent networks
export * from "./agentNetwork";

// TODO: Add and export workflow definitions here as they are developed
// export * from "./weatherWorkflow";
// export * from "./researchWorkflow";
