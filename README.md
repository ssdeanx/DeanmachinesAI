# DeanmachinesAI

A Mastra AI-powered application with intelligent agents, networks, and workflows for research, analysis, and document processing with reinforcement learning capabilities and enhanced search functionality.

![alt text](image.png)

## 📋 Project Overview

DeanmachinesAI leverages the Mastra TypeScript framework to build advanced AI applications with specialized agents, flexible tools, and collaborative workflows. The system utilizes agent networks for dynamic task routing and reinforcement learning for continuous improvement, enabling sophisticated information processing and knowledge generation through vector search and web retrieval capabilities.

## 🏗️ Current Architecture

```mermaid
graph TD
    subgraph "DeanmachinesAI Core"
        A[Mastra Instance] --> B[Agent Networks]
        A --> C[Specialized Agents]
        A --> D[Workflows]
        A --> E[RL System]

        subgraph "Agent Networks"
            B --> B1[DeanInsights Network]
            B --> B2[DataFlow Network]
            B --> B3[ContentCreation Network]
        end

        subgraph "Specialized Agents"
            C --> C1[Research Agent]
            C --> C2[Analyst Agent]
            C --> C3[Writer Agent]
            C --> C4[RL Trainer Agent]
            C --> C5[Data Manager Agent]
        end

        subgraph "Workflows"
            D --> D1[RAG Workflow]
            D --> D2[Weather Workflow]
        end

        subgraph "Tools"
            E1[File System Tools]
            E2[Document Tools]
            E3[RAG Tools]
            E4[RL Feedback Tools]
            E5[RL Reward Tools]
            E6[ExaSearch Tool]
            E7[Vector Query Tool]
        end

        C -.-> E1
        C -.-> E2
        C -.-> E3
        C -.-> E4
        C -.-> E5
        C -.-> E6
        C -.-> E7
        D -.-> E1
        D -.-> E2
        D -.-> E3
        D -.-> E6
        D -.-> E7
    end

    subgraph "External Services"
        F1[Google AI]
        F2[Pinecone DB]
        F3[LangSmith]
        F4[Weather API]
        F5[Exa Search API]
    end

    A --> F1
    A --> F2
    A --> F3
    D2 --> F4
    E6 --> F5
```

## 🛠️ Technology Stack

- **Framework**: Mastra AI (TypeScript)
- **LLM Provider**: Google AI (Gemini 2.0 Pro/Flash)
- **Storage**:
  - Turso (LibSQL) for agent memory
  - Pinecone for vector database
  - Upstash for backup vector storage
- **APIs**:
  - Open-Meteo for weather data
  - Exa for enhanced web search
- **Tokenization**: js-tiktoken with o200 encoding
- **Monitoring & Evaluation**:
  - LangSmith for tracing and observability
  - Custom reinforcement learning feedback loops

## 🔍 Key Features

### Agent Systems

- **Dynamic Agent Networks**: LLM-based routing between specialized agents
- **Collaborative Workflows**: Predefined execution paths for complex tasks
- **Specialized Agents**:
  - Research Agent for information gathering
  - Analyst Agent for data interpretation
  - Writer Agent for documentation
  - RL Trainer Agent for system improvement
  - Data Manager Agent for file operations

### Tools & Capabilities

- **File System Tools**:
  - Reading from files with encoding options
  - Writing to files with backup options
  - Line-based file access for large files
- **RL Feedback System**:
  - Collection of explicit and implicit feedback
  - Analysis of performance metrics
  - Automated policy improvement
- **RL Reward System**:
  - Custom reward function definitions
  - State-action pair evaluation
  - Policy optimization based on observed rewards
- **Document Processing**:
  - Semantic search for relevant content
  - Content analysis and insight generation
  - Formatting for various documentation types
- **Search & Retrieval**:
  - Exa-powered web search with metadata filtering
  - Vector query with js-tiktoken tokenization
  - Hybrid semantic search with reranking capabilities

### Workflow Implementations

- **RAG Research Workflow**: Research, analysis and documentation generation
- **Weather Workflow**: Location-based forecasts and activity recommendations

## 📈 Development Progress

```mermaid
gantt
    title DeanmachinesAI Development Progress
    dateFormat  YYYY-MM-DD

    section Foundation
    Project Setup               :done, setup, 2025-03-15, 2025-03-30
    Weather Components          :done, weather, 2025-04-01, 2025-04-15
    File System Tools           :done, files, 2025-04-05, 2025-04-10

    section Phase 1
    Memory Integration          :done, mem, 2025-04-10, 2025-04-20
    RAG Implementation          :done, rag, 2025-04-15, 2025-04-25
    Agent Networks              :done, networks, 2025-04-25, 2025-05-05
    RL Feedback & Reward        :done, rl, 2025-05-01, 2025-05-10

    section Current
    Vector Query Implementation :done, vquery, 2025-04-01, 2025-04-06
    Exa Search Integration      :done, exasearch, 2025-04-03, 2025-04-06
    Token Optimization          :active, tokens, 2025-04-05, 2025-04-10

    section Phase 2
    Voice Integration           :voice, after tokens, 15d
    Mobile UI Development       :mobile, after voice, 25d
    Deployment & Scaling        :deploy, after mobile, 15d

    section Phase 3
    Advanced Analytics          :analytics, after deploy, 20d
    Enterprise Features         :enterprise, after analytics, 25d
```

## ✅ Current Progress

```mermaid
pie
    title Feature Implementation Progress
    "Complete" : 55
    "In Progress" : 20
    "Planned" : 25
```

## 🧠 Agent Networks

DeanmachinesAI implements three specialized agent networks that enable dynamic collaboration between agents:

### 1. DeanInsights Network

Orchestrates all specialized agents to deliver comprehensive research and analysis with well-structured outputs.

### 2. DataFlow Network

Focused on data processing operations with an emphasis on reinforcement learning and continuous improvement.

### 3. ContentCreation Network

Specializes in researching topics and producing high-quality content with continuous improvement through feedback.

## 🔎 Enhanced Search & Retrieval

The system implements advanced search capabilities:

### ExaSearch Tool

- Provides high-quality web search results
- Supports filtering by site, date ranges, and content types
- Returns formatted results for RAG applications
- Handles full content retrieval for comprehensive analysis

### Vector Query Tool

- Uses js-tiktoken with o200 encoding for efficient tokenization
- Integrates with Pinecone for high-performance vector search
- Supports semantic reranking with configurable weight balancing
- Enables metadata filtering for precise result targeting

## 🤖 Reinforcement Learning

The system implements two reinforcement learning subsystems:

### RL Feedback System

- Collects explicit feedback from users
- Derives implicit feedback from system metrics
- Analyzes patterns to identify improvement opportunities
- Applies insights to improve agent prompts and behavior

### RL Reward System

- Defines custom reward functions for specific tasks
- Evaluates state-action pairs to calculate rewards
- Tracks reward history for policy optimization
- Suggests improvements based on historical performance

## 🌐 Environment Configuration

The project requires configuration for:

- Google AI API for LLM capabilities
- Turso Database for persistent agent memory
- LangSmith for observability and tracing
- Pinecone for vector database functionality
- Exa API for advanced web search

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- API keys for Google AI, Turso, Exa, and other services

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

## 🔮 Future Scope

### Planned Enhancements

1. **Extended Agent Networks**
   - Domain-specific agent networks
   - Cross-network collaboration
   - Hierarchical decision making

2. **Advanced RL Capabilities**
   - Multi-objective reinforcement learning
   - Exploration vs. exploitation balancing
   - Transfer learning between agents

3. **Multi-Modal Support**
   - Voice interface integration
   - Image recognition capabilities
   - Cross-modal reasoning

4. **Enterprise Features**
   - Role-based access controls
   - Audit logging and compliance
   - High-availability deployment options

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📊 System Architecture

```mermaid
graph TB
    User((External User))

    subgraph "Mastra AI System"
        subgraph "Agent Networks Container"
            DeanInsights["DeanInsights Network<br>AgentNetwork"]
            DataFlow["DataFlow Network<br>AgentNetwork"]
            ContentCreation["ContentCreation Network<br>AgentNetwork"]

            subgraph "Agent Components"
                Research["Research Agent<br>LLM Agent"]
                Analyst["Analyst Agent<br>LLM Agent"]
                Writer["Writer Agent<br>LLM Agent"]
                RLTrainer["RL Trainer Agent<br>LLM Agent"]
                DataManager["Data Manager Agent<br>LLM Agent"]
            end
        end

        subgraph "Database Container"
            LibSQL["LibSQL Store<br>SQLite"]
            VectorStore["Vector Store<br>Pinecone"]

            subgraph "Memory Components"
                ThreadManager["Thread Manager<br>TypeScript"]
                MemoryManager["Memory Manager<br>LibSQL"]
                VectorIndex["Vector Index<br>Pinecone"]
            end
        end

        subgraph "Services Container"
            LangChain["LangChain Service<br>TypeScript"]
            LangFuse["LangFuse Service<br>TypeScript"]
            LangSmith["LangSmith Service<br>TypeScript"]
            ExaSearch["ExaSearch Service<br>TypeScript"]

            subgraph "LLM Components"
                GoogleAI["Google AI<br>Gemini"]
                Embeddings["Embeddings<br>Google AI"]
                ModelRouter["Model Router<br>TypeScript"]
            end
        end

        subgraph "Tools Container"
            subgraph "Core Tools"
                DocumentTools["Document Tools<br>TypeScript"]
                SearchTools["Search Tools<br>TypeScript"]
                RLTools["RL Tools<br>TypeScript"]
                FileTools["File Tools<br>TypeScript"]
            end
        end
    end

    %% External Service Connections
    User -->|"Interacts with"| DeanInsights
    User -->|"Interacts with"| DataFlow
    User -->|"Interacts with"| ContentCreation

    %% Agent Network Relationships
    DeanInsights -->|"Uses"| Research
    DeanInsights -->|"Uses"| Analyst
    DeanInsights -->|"Uses"| Writer
    DeanInsights -->|"Uses"| RLTrainer
    DeanInsights -->|"Uses"| DataManager

    DataFlow -->|"Uses"| DataManager
    DataFlow -->|"Uses"| Analyst
    DataFlow -->|"Uses"| RLTrainer

    ContentCreation -->|"Uses"| Research
    ContentCreation -->|"Uses"| Writer
    ContentCreation -->|"Uses"| RLTrainer

    %% Database Relationships
    Research -->|"Stores data"| LibSQL
    Analyst -->|"Stores data"| LibSQL
    Writer -->|"Stores data"| LibSQL
    Research -->|"Uses"| VectorStore
    Analyst -->|"Uses"| VectorStore

    LibSQL -->|"Managed by"| MemoryManager
    VectorStore -->|"Indexed by"| VectorIndex
    MemoryManager -->|"Uses"| ThreadManager

    %% Service Relationships
    Research -->|"Uses"| LangChain
    Analyst -->|"Uses"| LangChain
    Writer -->|"Uses"| LangChain

    LangChain -->|"Routes to"| ModelRouter
    ModelRouter -->|"Uses"| GoogleAI
    ModelRouter -->|"Uses"| Embeddings

    Research -->|"Uses"| ExaSearch
    Writer -->|"Uses"| ExaSearch

    %% Tool Relationships
    Research -->|"Uses"| DocumentTools
    Research -->|"Uses"| SearchTools
    DataManager -->|"Uses"| FileTools
    RLTrainer -->|"Uses"| RLTools

    %% Monitoring Services
    LangChain -->|"Monitored by"| LangFuse
    LangChain -->|"Monitored by"| LangSmith
```
