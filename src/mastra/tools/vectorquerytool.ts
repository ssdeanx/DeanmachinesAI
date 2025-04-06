import { google } from "@ai-sdk/google";
import { createVectorQueryTool } from "@mastra/rag";


const queryTool = createVectorQueryTool({
  vectorStoreName: "milvus",
  indexName: "documentation",
  model: google.embedding("gemini-embedding-exp-03-07"),
  reranker: {
    model: google("gemini-2.0-pro"),
    options: {
      weights: {
        semantic: 0.5, // Semantic relevance weight
        vector: 0.3, // Vector similarity weight
        position: 0.2, // Original position weight
      },
      topK: 5,
    },
  },
});
