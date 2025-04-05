# DeanmachinesAI

A Mastra AI-powered application with intelligent agents and workflows for weather forecasting and activity planning.

## 📋 Project Overview

DeanmachinesAI leverages the Mastra TypeScript framework to build AI applications with agents, tools, and workflows. The project currently focuses on weather data retrieval and analysis, with planned expansions into other domains.

## 🏗️ Current Architecture

```mermaid
graph TD
    subgraph "DeanmachinesAI Project"
        A[Mastra Instance] --> B[Weather Workflow]
        A --> C[Weather Agent]

        subgraph "Weather Components"
            B --> D[Fetch Weather Step]
            B --> E[Plan Activities Step]
            C --> F[Weather Tool]
            F --> G[Open-Meteo API]
            D --> G
        end
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:1px
    style C fill:#bbf,stroke:#333,stroke-width:1px
    style F fill:#bfb,stroke:#333,stroke-width:1px
```

## 🛠️ Technology Stack

- **Framework**: Mastra AI (TypeScript)
- **LLM Provider**: Google AI (Gemini 1.5 Pro)
- **Storage**:
  - Turso (LibSQL) for agent memory
  - Pinecone for vector database
- **APIs**:
  - Open-Meteo for weather data
- **Monitoring**: LangSmith for tracing and evaluation

## 🔍 Current Features

- **Weather Agent**: Provides accurate weather information for locations
- **Weather Tool**: Fetches and formats current weather conditions
- **Weather Workflow**: Multi-step process to fetch weather and recommend activities

## 📈 Development Roadmap

```mermaid
gantt
    title DeanmachinesAI Development Roadmap
    dateFormat  YYYY-MM-DD

    section Foundation
    Project Setup               :done, setup, 2025-03-15, 2025-03-30
    Weather Components          :active, weather, 2025-04-01, 2025-04-15

    section Phase 1
    Memory Integration          :mem, after weather, 30d
    RAG Implementation          :rag, after mem, 20d
    Multi-Agent Coordination    :agents, after rag, 25d

    section Phase 2
    Voice Integration           :voice, after agents, 20d
    Mobile UI Development       :mobile, after voice, 30d
    Deployment & Scaling        :deploy, after mobile, 15d

    section Phase 3
    Advanced Analytics          :analytics, after deploy, 20d
    Enterprise Features         :enterprise, after analytics, 25d
```

## ✅ Current Progress

```mermaid
pie
    title Feature Implementation Progress
    "Complete" : 15
    "In Progress" : 10
    "Planned" : 75
```

## 🌐 Environment Configuration

The project is configured with:

- Google AI API for LLM capabilities
- Turso Database for persistent agent memory
- LangSmith for observability and tracing
- Pinecone for vector database functionality
- Upstash for Redis-based caching (not currently in use)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- API keys for Google AI, Turso, and other services

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/DeanmachinesAI.git

# Navigate to project directory
cd DeanmachinesAI

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.development
# Edit .env.development with your API keys
```

### Running the Project

```bash
# Start the development server
npm run dev
```

## 📊 Future Scope

### Planned Components

1. **Memory System**
   - Persistent conversation history
   - Context-aware responses
   - User preference tracking

2. **RAG Implementation**
   - Document ingestion and vectorization
   - Semantic search capabilities
   - Knowledge base management

3. **Multi-Modal Agents**
   - Voice interface integration
   - Image recognition capabilities
   - Cross-modal reasoning

4. **Specialized Tools**
   - Calendar and scheduling
   - Personal finance assistant
   - Health and wellness tracker

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

```mermaid
graph TB
    User((External User))

    subgraph "Mastra AI System"
        subgraph "Core Services Container"
            CoreService["Mastra Core Service<br>(Node.js)"]
            Logger["Logging Service<br>(@mastra/core/logger)"]
            Middleware["Request Middleware<br>(Node.js)"]
        end

        subgraph "Agent Container"
            AgentManager["Agent Manager<br>(@mastra/core/agent)"]
            subgraph "Specialized Agents"
                ResearchAgent["Research Agent<br>(Google Gemini-2.0-pro)"]
                AnalystAgent["Analyst Agent<br>(Google Gemini-2.0-pro)"]
                WriterAgent["Writer Agent<br>(Google Gemini-2.0-pro)"]
            end
        end

        subgraph "Database Container"
            VectorStore["Vector Store<br>(Pinecone)"]
            MemorySystem["Memory System<br>(LibSQL)"]
            Embeddings["Embeddings Service<br>(Google AI)"]
        end

        subgraph "Workflow Container"
            WorkflowEngine["Workflow Engine<br>(@mastra/core/workflows)"]
            RAGWorkflow["RAG Workflow<br>(Custom)"]
            WeatherWorkflow["Weather Workflow<br>(Custom)"]
        end

        subgraph "Tools Container"
            subgraph "RL Tools"
                FeedbackTools["Feedback Tools<br>(Custom)"]
                RewardTools["Reward Tools<br>(Custom)"]
            end
            GraphRAG["Graph RAG Tool<br>(Custom)"]
            DocumentTools["Document Tools<br>(Custom)"]
        end

        subgraph "Monitoring Container"
            LangSmith["LangSmith Integration<br>(LangSmith SDK)"]
            Telemetry["Telemetry Service<br>(Custom)"]
        end
    end

    subgraph "External Services"
        PineconeDB[("Pinecone DB<br>(Vector Database)")]
        GoogleAI["Google AI<br>(Gemini Models)"]
        WeatherAPI["Weather API<br>(Open-Meteo)"]
    end

    %% Core Service Relationships
    User -->|"Requests"| CoreService
    CoreService -->|"Logs"| Logger
    CoreService -->|"Routes through"| Middleware
    CoreService -->|"Manages"| AgentManager
    CoreService -->|"Uses"| WorkflowEngine

    %% Agent Relationships
    AgentManager -->|"Coordinates"| ResearchAgent
    AgentManager -->|"Coordinates"| AnalystAgent
    AgentManager -->|"Coordinates"| WriterAgent
    ResearchAgent -->|"Uses"| GoogleAI
    AnalystAgent -->|"Uses"| GoogleAI
    WriterAgent -->|"Uses"| GoogleAI

    %% Database Relationships
    VectorStore -->|"Stores vectors in"| PineconeDB
    Embeddings -->|"Generates embeddings"| VectorStore
    MemorySystem -->|"Persists data"| VectorStore

    %% Workflow Relationships
    WorkflowEngine -->|"Executes"| RAGWorkflow
    WorkflowEngine -->|"Executes"| WeatherWorkflow
    WeatherWorkflow -->|"Fetches data"| WeatherAPI
    RAGWorkflow -->|"Uses"| GraphRAG

    %% Tool Relationships
    FeedbackTools -->|"Analyzes"| LangSmith
    RewardTools -->|"Reports to"| LangSmith
    GraphRAG -->|"Stores in"| VectorStore
    DocumentTools -->|"Processes using"| Embeddings

    %% Monitoring Relationships
    LangSmith -->|"Tracks"| ResearchAgent
    LangSmith -->|"Tracks"| AnalystAgent
    LangSmith -->|"Tracks"| WriterAgent
    Telemetry -->|"Monitors"| CoreService
```
