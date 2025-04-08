# Copilot Context: DeanmachinesAI Project Structure

## 1. Project Overview

* **Project Name:** `DeanmachinesAI`
* **Framework:** Mastra AI (`@mastra/core`, `@mastra/memory`, `@mastra/core/network`, etc.)
* **Language:** TypeScript
* **Core Goal:** Build an agentic AI system for research, analysis, document processing, and content generation, featuring dynamic agent collaboration and reinforcement learning (RL) for self-improvement.
* **Architecture:** Modular, agent-based, primarily located under `src/mastra/`.

## 2. Key Directories & Purpose

* `src/mastra/`: Root directory for the core Mastra application logic.
  * `agents/`: Defines individual AI agents (`researchAgent`, `analystAgent`, `writerAgent`, `rlTrainerAgent`, `dataManagerAgent`). Exports via `index.ts`.
  * `database/`: Configures data persistence.
    * `index.ts`: Configures and exports shared `memory` instance using `@mastra/memory` with `LibSQLStore` (likely Turso).
    * `vector-store.ts`: Configures Pinecone vector store (`@langchain/pinecone`) and Google embeddings (`@langchain/google-genai`) via `MastraEmbeddingAdapter`.
    * `examples.ts`: Demonstrates memory usage patterns (persistence, multi-agent sharing).
  * `hooks/`: Contains agent lifecycle hooks, e.g., `createResponseHook` for response validation/processing (`index.ts`).
  * `services/`: Wrappers/clients for external APIs (e.g., `langchain.ts`, `langsmith.ts`, `exasearch.ts`).
  * `tools/`: Defines capabilities usable by agents. Includes Search (Brave, Tavily, Google, Exa), Document Processing (Chunk, Embed, Store, Retrieve, RAG, GraphRAG), File I/O (`readwrite.ts`), RL (Feedback, Reward), Calculator, MCP. Exports via `index.ts`.
  * `utils/`: General utility functions. `thread-manager.ts` is crucial for managing memory context IDs. `memory-diagnostics.ts` for basic checks. Exports via `index.ts`.
  * `voice/`: Integrations for voice input/output (Google, ElevenLabs). Exports via `index.ts`.
  * `workflows/`: Defines execution logic.
    * `index.ts`: Defines static `Workflow`s (e.g., `ragWorkflow`) using `@mastra/core/workflows`. Exports workflows and networks.
    * `agentNetwork.ts`: Defines dynamic `AgentNetwork`s (`deanInsightsNetwork`, `dataFlowNetwork`, `contentCreationNetwork`) using `@mastra/core/network`.
* `knowledge/`: (Contents not detailed in map) Likely contains domain-specific data, schemas, templates. Accessed by `readwrite.ts` tool.
* Root Directory:
  * `mastra.config.ts`: Central configuration file wiring up agents, workflows, networks, memory for the Mastra framework.
  * `package.json`: Project dependencies and scripts (`npm run dev`).
  * `.env.example`: Defines required environment variables for external services (API keys, endpoints).
  * `README.md`: Detailed project documentation with diagrams.

## 3. Core Concepts & Components

* **Agents:** Defined in `src/mastra/agents/index.ts`. Use `Tools`. Configured with shared `memory`. Key agents: `researchAgent`, `analystAgent`, `writerAgent`, `rlTrainerAgent`, `dataManagerAgent`.
* **Tools:** Agent capabilities defined in `src/mastra/tools/`. Use `zod` for schemas. Often integrate with `Services`. Re-exported via `src/mastra/tools/index.ts`.
* **Memory:** Persistent agent state via `@mastra/memory` configured in `src/mastra/database/index.ts`. Uses `LibSQLStore` (likely Turso). Context across interactions/agents managed by `ThreadManager` (`src/mastra/utils/thread-manager.ts`). RL feedback/reward data also stored in memory threads.
* **Vector Store:** Pinecone (`@langchain/pinecone`) configured in `src/mastra/database/vector-store.ts`. Uses Google Embeddings. Primary storage for RAG, GraphRAG, semantic search. Queried by tools like `document.ts`, `graphRag.ts`, `vectorquerytool.ts`.
* **Workflows:** Static, predefined sequences of agent steps (`src/mastra/workflows/index.ts`).
* **Agent Networks:** Dynamic, LLM-routed collaboration between agents (`src/mastra/workflows/agentNetwork.ts`).
* **Reinforcement Learning (RL):** Core feature for self-improvement. Tools in `src/mastra/tools/rlFeedback.ts` (collect, analyze, apply feedback) and `src/mastra/tools/rlReward.ts` (define, calculate, optimize rewards). Uses LLMs for analysis/optimization.
* **Services:** API clients/wrappers in `src/mastra/services/`.
* **Hooks:** Logic injected into agent lifecycle (`src/mastra/hooks/`).

## 4. Key Technologies & Libraries

* **Framework:** `@mastra/*` (core, memory, network, workflows, tools, voice, etc.)
* **AI/LLM:** `@ai-sdk/google`, `@google/generative-ai`, `langchain`, `@langchain/*` (core, google-genai, pinecone)
* **Vector DB:** `@pinecone-database/pinecone`, `@langchain/pinecone`
* **Memory DB:** `@mastra/core/storage/libsql` (backed by Turso via `@turso/libsql-client` inferred from `.env.example`)
* **Agentic Tools:** `@agentic/*` (ai-sdk, brave-search, calculator, google-custom-search, tavily, mcp, etc.)
* **Search APIs:** `exa-js`
* **Observability:** `langsmith`, `langfuse` (from `.env.example`)
* **Schema Validation:** `zod`
* **Tokenization:** `js-tiktoken` (used in `vectorquerytool.ts`)
* **Environment:** `dotenv`

## 5. Configuration & Execution

* **Main Config:** `mastra.config.ts` (integrates components for Mastra).
* **Environment:** `.env` / `.env.development` based on `.env.example`.
* **Execution:** `npm run dev` likely starts the Mastra development server (`mastra dev`).
* **Entry Point:** `src/mastra/index.ts` exports the main configured `Mastra` instance.

## 6. Common Patterns

* Extensive use of `index.ts` barrel files for exporting modules within directories.
* Separation of concerns: `agents`, `tools`, `services`, `database`, `workflows`.
* Factory functions (`createXTool`, `createMemory`) for component initialization.
* Dependency injection (passing `memory`, `embeddings`, etc.).
* `zod` schemas for tool inputs/outputs.
* `LangSmith` tracing integrated in many tools and services.
* Use of `ThreadManager` for managing context via thread IDs in memory operations.
