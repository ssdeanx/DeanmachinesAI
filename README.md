# DeanmachinesAI

A Mastra AI-powered application with intelligent agents, networks, and workflows for research, analysis, and document processing with reinforcement learning capabilities.

![alt text](image.png)

## 📋 Project Overview

DeanmachinesAI leverages the Mastra TypeScript framework to build advanced AI applications with specialized agents, flexible tools, and collaborative workflows. The system utilizes agent networks for dynamic task routing and reinforcement learning for continuous improvement, enabling sophisticated information processing and knowledge generation.

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
        end

        C -.-> E1
        C -.-> E2
        C -.-> E3
        C -.-> E4
        C -.-> E5
        D -.-> E1
        D -.-> E2
        D -.-> E3
    end

    subgraph "External Services"
        F1[Google AI]
        F2[Pinecone DB]
        F3[LangSmith]
        F4[Weather API]
    end

    A --> F1
    A --> F2
    A --> F3
    D2 --> F4
```

## 🛠️ Technology Stack

- **Framework**: Mastra AI (TypeScript)
- **LLM Provider**: Google AI (Gemini 2.0 Pro)
- **Storage**:
  - Turso (LibSQL) for agent memory
  - Pinecone for vector database
- **APIs**:
  - Open-Meteo for weather data
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

    section Phase 2
    Voice Integration           :voice, after rl, 20d
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
    "Complete" : 45
    "In Progress" : 15
    "Planned" : 40
```

## 🧠 Agent Networks

DeanmachinesAI implements three specialized agent networks that enable dynamic collaboration between agents:

### 1. DeanInsights Network

Orchestrates all specialized agents to deliver comprehensive research and analysis with well-structured outputs.

### 2. DataFlow Network

Focused on data processing operations with an emphasis on reinforcement learning and continuous improvement.

### 3. ContentCreation Network

Specializes in researching topics and producing high-quality content with continuous improvement through feedback.

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
        subgraph "Agent Layer"
            ResearchAgent["Research Agent<br>(Google Gemini 2.0 Pro)"]
            AnalystAgent["Analyst Agent<br>(Google Gemini 2.0 Pro)"]
            WriterAgent["Writer Agent<br>(Google Gemini 2.0 Pro)"]
            RLTrainerAgent["RL Trainer Agent<br>(Google Gemini 2.0 Pro)"]
            DataManagerAgent["Data Manager Agent<br>(Google Gemini 2.0 Pro)"]
        end

        subgraph "Core Services"
            LangChainService["LangChain Service<br>(Node.js)"]
            LangSmithService["LangSmith Service<br>(Node.js)"]

            subgraph "LangChain Components"
                ModelProvider["Model Provider<br>(OpenAI/Google/Anthropic)"]
                ConversationChain["Conversation Chain<br>(LangChain)"]
                LLMChain["LLM Chain<br>(LangChain)"]
            end

            subgraph "LangSmith Components"
                TracingModule["Tracing Module<br>(LangSmith SDK)"]
                FeedbackModule["Feedback Module<br>(LangSmith SDK)"]
                EvaluationModule["Evaluation Module<br>(LangSmith SDK)"]
            end
        end

        subgraph "Database Layer"
            VectorStore["Vector Store<br>(Pinecone)"]
            MemoryStore["Memory Store<br>(LibSQL)"]

            subgraph "Vector Store Components"
                EmbeddingsManager["Embeddings Manager<br>(Google AI)"]
                GraphRAG["Graph RAG<br>(Custom)"]
                VectorIndex["Vector Index<br>(Pinecone)"]
            end

            subgraph "Memory Components"
                ThreadManager["Thread Manager<br>(LibSQL)"]
                StorageAdapter["Storage Adapter<br>(LibSQL)"]
            end
        end

        subgraph "Workflow Engine"
            RAGWorkflow["RAG Workflow<br>(Custom)"]
            WeatherWorkflow["Weather Workflow<br>(Custom)"]

            subgraph "Workflow Components"
                StepExecutor["Step Executor<br>(Custom)"]
                ContextManager["Context Manager<br>(Custom)"]
                WorkflowRouter["Workflow Router<br>(Custom)"]
            end
        end
    end

    subgraph "External Services"
        GoogleAI["Google AI<br>(External API)"]
        PineconeDB["Pinecone DB<br>(External Service)"]
        LangSmithAPI["LangSmith API<br>(External Service)"]
    end

    %% Connections between components
    User -->|"Queries"| RAGWorkflow
    User -->|"Weather Requests"| WeatherWorkflow

    %% Agent Layer connections
    RAGWorkflow -->|"Delegates Research"| ResearchAgent
    RAGWorkflow -->|"Delegates Analysis"| AnalystAgent
    RAGWorkflow -->|"Delegates Writing"| WriterAgent
    RAGWorkflow -->|"Collects Feedback"| RLTrainerAgent
    RAGWorkflow -->|"Manages Data"| DataManagerAgent

    %% Core Services connections
    ResearchAgent -->|"Uses"| LangChainService
    AnalystAgent -->|"Uses"| LangChainService
    WriterAgent -->|"Uses"| LangChainService
    LangChainService -->|"Traces"| LangSmithService
    LangChainService -->|"Uses"| ModelProvider
    ModelProvider -->|"Calls"| GoogleAI

    %% Database Layer connections
    LangChainService -->|"Stores Vectors"| VectorStore
    LangChainService -->|"Manages Memory"| MemoryStore
    VectorStore -->|"Uses"| EmbeddingsManager
    VectorStore -->|"Implements"| GraphRAG
    VectorStore -->|"Stores In"| PineconeDB

    %% Workflow connections
    WorkflowRouter -->|"Executes"| StepExecutor
    StepExecutor -->|"Manages"| ContextManager

    %% External service connections
    LangSmithService -->|"Reports to"| LangSmithAPI
    EmbeddingsManager -->|"Generates via"| GoogleAI
```
