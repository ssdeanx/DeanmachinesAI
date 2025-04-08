// filepath: c:\Users\dm\Documents\DeanmachinesAI\src\mastra\tools\document-tools.ts
/**
 * Document Tools Module
 *
 * This module defines tools that work with documents such as searching within repositories and embedding documents.
 *
 * @module DocumentTools
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Search Documents Tool
 *
 * Searches document repositories for documents matching the query criteria.
 *
 * @remarks
 * Replace the stub search logic with an actual document search implementation.
 *
 * @param input.query - The search query string.
 * @returns An object containing an array of found documents.
 * @throws {Error} When the search execution fails.
 */
/**
 * Document interface representing a searchable document.
 */
export interface Document {
  id: string;
  title: string;
  content: string;
}

/**
 * Simulated document repository.
 *
 * In a real application, replace this in-memory array with calls to a database or external API.
 */
const documentRepository: ReadonlyArray<Document> = [
  {
    id: "1",
    title: "Introduction to Mastra",
    content: "Mastra is a powerful framework for building document-driven applications.",
  },
  {
    id: "2",
    title: "Advanced Topics",
    content: "This document covers advanced topics in document search and embedding.",
  },
  {
    id: "3",
    title: "Getting Started",
    content: "Learn how to quickly get started with our platform using concise examples.",
  },
];

/**
 * Search Documents Tool
 *
 * Searches document repositories for documents matching the query criteria.
 *
 * @remarks
 * This implementation performs a case-insensitive search over the document titles and content.
 *
 * @param input.query - The search query string.
 * @returns An object containing an array of found documents.
 * @throws {Error} When the search execution fails.
 */
export const searchDocumentsTool = createTool({
  id: "search-documents",
  description: "Searches for documents in repositories based on a query.",
  inputSchema: z.object({
    query: z
      .string()
      .min(1, "Query cannot be empty")
      .describe("The search query string."),
  }),
  outputSchema: z.object({
    documents: z
      .array(
        z.object({
          id: z.string().describe("Document id"),
          title: z.string().describe("Document title"),
          content: z.string().describe("Document content"),
        })
      )
      .describe("Array of found documents."),
  }),
  execute: async ({ context }): Promise<{ documents: Document[] }> => {
    try {
      // Extract the query and sanitize it for case insensitive search.
      const { query } = context;
      const lowerQuery = query.toLowerCase();

      // Filter the repository for documents where either the title or content includes the query.
      const foundDocuments = documentRepository.filter(
        (doc) =>
          doc.title.toLowerCase().includes(lowerQuery) ||
          doc.content.toLowerCase().includes(lowerQuery)
      );

      return { documents: foundDocuments };
    } catch (error: unknown) {
      throw new Error(`searchDocumentsTool execution failed: ${(error as Error).message}`);
    }
  },
});

/**
 * Embed Document Tool
 *
 * Generates an embedding vector representing the document content.
 *
 * @remarks
 * Replace the stub embedding logic with an actual embedding generator (e.g., a neural network model).
 *
 * @param input.document - The text content of the document.
 * @returns An object containing the embedding vector.
 * @throws {Error} When embedding computation fails.
 */
export const embedDocumentTool = createTool({
  id: "embed-document",
  description: "Generates an embedding vector for a document.",
  inputSchema: z.object({
    document: z.string().min(1, "Document content must not be empty").describe("The document content to embed."),
  }),
  outputSchema: z.object({
    embedding: z.array(z.number()).describe("The embedding vector."),
  }),
  execute: async ({ context }): Promise<{ embedding: number[] }> => {
    try {
      // Example stub: simple transformation using character codes.
      const embedding = Array.from(context.document).map((char) => char.charCodeAt(0));
      return { embedding };
    } catch (error: unknown) {
      throw new Error(`embedDocumentTool execution failed: ${(error as Error).message}`);
    }
  },
});
