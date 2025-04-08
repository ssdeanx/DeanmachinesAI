/**
 * Graph-based Retrieval Augmented Generation (GraphRAG) tools for Mastra AI.
 *
 * This module provides advanced document retrieval that leverages graph relationships
 * between documents to improve context and relevance of retrieved information.
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "langchain/document";
import { createEmbeddings } from "../database/vector-store";
import { createLangSmithRun, trackFeedback } from "../services/langsmith";
import { createLangChainModel } from "../services/langchain";
import { env } from "process";

/**
 * Graph node representing a document or chunk with its connections
 */
interface GraphNode {
  /** Unique identifier for the node */
  id: string;
  /** Document content */
  content: string;
  /** Metadata about the document */
  metadata: Record<string, any>;
  /** IDs of connected nodes */
  connections: string[];
  /** Connection weights/strengths (0-1) */
  connectionWeights: Record<string, number>;
}

/**
 * Creates graph relationships between documents based on semantic similarity
 *
 * @param documents - List of documents to create relationships between
 * @param embeddings - Embeddings model for calculating similarity
 * @param threshold - Similarity threshold for creating connections (0-1)
 * @returns Documents enriched with graph relationship metadata
 */
async function createGraphRelationships(
  documents: Document[],
  embeddings: GoogleGenerativeAIEmbeddings,
  threshold: number = 0.7
): Promise<Document[]> {
  // Create a unique ID for each document if not present
  const docsWithIds = documents.map((doc, index) => {
    const id = doc.metadata.id || `node-${Date.now()}-${index}`;
    return {
      ...doc,
      metadata: {
        ...doc.metadata,
        id,
        connections: [] as string[], // Explicitly type as string array
        connectionWeights: {} as Record<string, number>,
      },
    };
  });

  // Create embeddings for all documents
  const contents = docsWithIds.map((doc) => doc.pageContent);
  const embeddingVectors = await embeddings.embedDocuments(contents);

  // Calculate similarity between all pairs of documents
  for (let i = 0; i < docsWithIds.length; i++) {
    for (let j = i + 1; j < docsWithIds.length; j++) {
      const similarity = calculateCosineSimilarity(
        embeddingVectors[i],
        embeddingVectors[j]
      );

      // Create a connection if similarity exceeds threshold
      if (similarity >= threshold) {
        const nodeI = docsWithIds[i];
        const nodeJ = docsWithIds[j];

        // Add bidirectional connections
        const idI = nodeI.metadata.id;
        const idJ = nodeJ.metadata.id;

        nodeI.metadata.connections.push(idJ);
        nodeI.metadata.connectionWeights[idJ] = similarity;

        nodeJ.metadata.connections.push(idI);
        nodeJ.metadata.connectionWeights[idI] = similarity;
      }
    }
  }

  return docsWithIds;
}

/**
 * Calculates cosine similarity between two vectors
 *
 * @param vec1 - First vector
 * @param vec2 - Second vector
 * @returns Similarity score between 0 and 1
 */
function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same dimensions");
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    magnitude1 += vec1[i] * vec1[i];
    magnitude2 += vec2[i] * vec2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Tool for creating a graph-based document store with relationships
 */
export const createGraphRagTool = createTool({
  id: "create-graph-rag",
  description:
    "Creates graph relationships between documents for improved retrieval",
  inputSchema: z.object({
    documents: z
      .array(
        z.object({
          content: z.string(),
          metadata: z.record(z.string(), z.any()).optional(),
        })
      )
      .describe("Documents to process and connect"),
    namespace: z
      .string()
      .optional()
      .describe("Namespace to store the graph in"),
    similarityThreshold: z
      .number()
      .optional()
      .default(0.7)
      .describe("Threshold for creating connections (0-1)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    graphId: z.string().optional(),
    nodeCount: z.number(),
    edgeCount: z.number(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const runId = await createLangSmithRun("create-graph-rag", ["graph", "rag"]);

    try {
      // Create embeddings model
      const embeddings = createEmbeddings();

      // Convert to LangChain Document format
      const documents = context.documents.map((doc) => {
        return new Document({
          pageContent: doc.content,
          metadata: doc.metadata || {},
        });
      });

      // Create graph relationships between documents
      const graphDocuments = await createGraphRelationships(
        documents,
        embeddings,
        context.similarityThreshold
      );

      // Count total connections (edges)
      let edgeCount = 0;
      graphDocuments.forEach((doc) => {
        edgeCount += doc.metadata.connections?.length || 0;
      });
      edgeCount = Math.floor(edgeCount / 2);

      // Store graph in vector database
      const pineconeClient = new Pinecone({
        apiKey: env.PINECONE_API_KEY!,
      });


      const indexName = env.PINECONE_INDEX || "Default";
      const namespace = context.namespace || "graph-rag";

      const pineconeIndex = pineconeClient.Index(indexName);

      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace,
      });

      await vectorStore.addDocuments(graphDocuments);

      const graphId = `graph-${Date.now()}`;

      // Track success in LangSmith
      await trackFeedback(runId, {
        score: 1,
        comment: `Created graph with ${graphDocuments.length} nodes and ${edgeCount} edges`,
        key: "graph_creation_success",
        value: { nodeCount: graphDocuments.length, edgeCount },
      });

      return {
        success: true,
        graphId,
        nodeCount: graphDocuments.length,
        edgeCount,
      };
    } catch (error) {
      console.error("Error creating graph RAG:", error);

      // Track failure in LangSmith
      await trackFeedback(runId, {
        score: 0,
        comment: error instanceof Error ? error.message : "Unknown error",
        key: "graph_creation_failure",
      });

      return {
        success: false,
        nodeCount: 0,
        edgeCount: 0,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during graph creation",
      };
    }
  },
});

/**
 * Tool for graph-based document retrieval with relationship exploration
 */
export const graphRagQueryTool = createTool({
  id: "graph-rag-query",
  description:
    "Retrieves documents using graph-based relationships for improved context",
  inputSchema: z.object({
    query: z.string().describe("Query to search for in the document graph"),
    namespace: z.string().optional().describe("Namespace for the graph"),
    initialDocumentCount: z
      .number()
      .optional()
      .default(3)
      .describe("Initial number of documents to retrieve"),
    maxHopCount: z
      .number()
      .optional()
      .default(2)
      .describe("Maximum number of hops to traverse in the graph"),
    minSimilarity: z
      .number()
      .optional()
      .default(0.6)
      .describe("Minimum similarity for initial document retrieval"),
  }),
  outputSchema: z.object({
    documents: z.array(
      z.object({
        content: z.string(),
        metadata: z.record(z.string(), z.any()),
        score: z.number().optional(),
        hopDistance: z.number().optional(),
      })
    ),
    count: z.number(),
  }),
  execute: async ({ context }) => {
    const runId = await createLangSmithRun("graph-rag-query", [
      "graph",
      "rag",
      "query",
    ]);

    try {
      const embeddings = createEmbeddings();

      // Initialize Pinecone client
      const pineconeClient = new Pinecone({
        apiKey: env.PINECONE_API_KEY!,
      });


      const indexName = env.PINECONE_INDEX || "Default";
      const namespace = context.namespace || "graph-rag";

      const pineconeIndex = pineconeClient.Index(indexName);

      // Connect to vector store
      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace,
      });

      // Initial document retrieval
      const initialResults = await vectorStore.similaritySearchWithScore(
        context.query,
        context.initialDocumentCount,
        { minScore: context.minSimilarity }
      );

      // Process and normalize initial results
      const retrievedNodes: Record<
        string,
        {
          document: Document;
          score: number;
          hopDistance: number;
        }
      > = {};

      // Add initial documents to the result set
      initialResults.forEach(([doc, score]) => {
        const id = doc.metadata.id;
        if (id) {
          retrievedNodes[id] = {
            document: doc,
            score: score as number,
            hopDistance: 0,
          };
        }
      });

      // Explore graph up to maxHopCount
      const maxHops = context.maxHopCount || 2;

      // Queue of nodes to explore: [nodeId, hopDistance]
      const exploreQueue: [string, number][] = Object.keys(retrievedNodes).map(
        (id) => [id, 0]
      );

      // Explore graph by following connections
      while (exploreQueue.length > 0) {
        const [nodeId, hopDistance] = exploreQueue.shift()!;

        // Skip if we've reached max hop distance
        if (hopDistance >= maxHops) {
          continue;
        }

        const nodeInfo = retrievedNodes[nodeId];
        if (!nodeInfo) {
          continue; // Skip if node not found
        }

        const connections = nodeInfo.document.metadata.connections || [];
        const weights = nodeInfo.document.metadata.connectionWeights || {};

        // For each connection, retrieve the connected document
        for (const connectedId of connections) {
          // Skip if we already have this node
          if (retrievedNodes[connectedId]) {
            continue;
          }

          try {
            // Get the connected document by ID
            const filterResults = await vectorStore.similaritySearch("", 1, {
              id: connectedId,
            });

            if (filterResults.length > 0) {
              const connectedDoc = filterResults[0];
              const connectionWeight = weights[connectedId] || 0.5;

              // Add connected node to results
              retrievedNodes[connectedId] = {
                document: connectedDoc,
                score: nodeInfo.score * connectionWeight, // Decay score by connection weight
                hopDistance: hopDistance + 1,
              };

              // Add to exploration queue
              exploreQueue.push([connectedId, hopDistance + 1]);
            }
          } catch (error) {
            console.warn(
              `Error retrieving connected node ${connectedId}:`,
              error
            );
          }
        }
      }

      // Format and sort results
      const results = Object.values(retrievedNodes)
        .sort((a, b) => b.score - a.score)
        .map((node) => ({
          content: node.document.pageContent,
          metadata: {
            ...node.document.metadata,
            // Remove internal graph structure from output
            connections: undefined,
            connectionWeights: undefined,
          },
          score: node.score,
          hopDistance: node.hopDistance,
        }));

      // Track success in LangSmith
      await trackFeedback(runId, {
        score: 1,
        comment: `Retrieved ${results.length} documents via graph exploration`,
        key: "graph_query_success",
        value: { documentCount: results.length },
      });

      return {
        documents: results,
        count: results.length,
      };
    } catch (error) {
      console.error("Error querying graph RAG:", error);

      // Track failure in LangSmith
      await trackFeedback(runId, {
        score: 0,
        comment: error instanceof Error ? error.message : "Unknown error",
        key: "graph_query_failure",
      });

      return {
        documents: [],
        count: 0,
      };
    }
  },
});
