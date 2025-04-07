<div align="center">

# DeanmachinesAI

A Mastra AI-powered application with intelligent agents, networks, and workflows for research, analysis, and document processing with reinforcement learning capabilities and enhanced search functionality.

![alt text](image.png)

## 📋 Project Overview

DeanmachinesAI leverages the Mastra TypeScript framework to build advanced AI applications with specialized agents, flexible tools, and collaborative workflows. The system utilizes agent networks for dynamic task routing and reinforcement learning for continuous improvement, enabling sophisticated information processing and knowledge generation through vector search and web retrieval capabilities.

## 🏗️ Current Architecture

```mermaid
C4Component
    title DeanmachinesAI System Architecture

    Container_Boundary(agents, "Agent Layer") {
        Container_Boundary(search, "Search Tools") {
            Component(brave, "Brave Search")
            Component(tavily, "Tavily Search")
            Component(google, "Google Search")
            Component(calc, "Calculator")
        }

        Container_Boundary(core, "Core Tools") {
            Component(doc, "Document Tools")
            Component(rag, "RAG Tools")
            Component(rl, "RL Tools")
            Component(fs, "File System")
        }

        Container_Boundary(networks, "Agent Networks") {
            Component(dean, "DeanInsights")
            Component(data, "DataFlow")
            Component(content, "ContentCreation")
        }
    }

    Container_Boundary(infra, "Infrastructure") {
        Container_Boundary(vector, "Vector Storage") {
            Component(pinecone, "Pinecone DB")
            Component(turso, "Turso LibSQL")
        }

        Container_Boundary(ai, "AI Services") {
            Component(gemini, "Google Gemini")
            Component(langsmith, "LangSmith")
        }

        Container_Boundary(apis, "External APIs") {
            Component(weather, "Weather API")
            Component(exa, "Exa Search")
        }
    }

    Rel(networks, search, "Uses")
    Rel(networks, core, "Uses")
    Rel(core, vector, "Stores data")
    Rel(search, apis, "Queries")
    Rel(networks, ai, "LLM requests")
    UpdateRelStyle(networks, search, "blue", "thick")
    UpdateRelStyle(networks, ai, "red", "thick")
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
- **Search Tools**:
  - **Brave Search**: Web search with privacy focus and customizable results
  - **Tavily Search**: AI-optimized search engine with comprehensive and quick modes
  - **Google Custom Search**: Enterprise-grade search with safe search options
  - **Calculator**: Mathematical expression evaluation and computation
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
    title DeanmachinesAI Development Roadmap
    dateFormat YYYY-MM-DD

    section Core Infrastructure
    Project Foundation           :done, found, 2025-03-15, 2025-03-25
    Base Architecture           :done, arch, 2025-03-20, 2025-04-01
    Agent System Core           :done, agent, 2025-03-25, 2025-04-10
    Memory Integration          :done, mem, 2025-04-01, 2025-04-15

    section Search & Retrieval
    Vector Store Setup         :done, vec, 2025-04-01, 2025-04-10
    RAG Implementation        :done, rag, 2025-04-05, 2025-04-20
    Brave Search              :done, brave, 2025-04-15, 2025-04-20
    Tavily Integration        :done, tavily, 2025-04-18, 2025-04-25
    Google CSE Setup          :done, gcse, 2025-04-20, 2025-04-28
    Search Optimization       :active, sopt, 2025-04-25, 2025-05-10

    section Agent Networks
    Network Architecture      :done, net, 2025-04-15, 2025-04-30
    Agent Communication       :active, comm, 2025-04-25, 2025-05-15
    Task Distribution        :active, task, 2025-05-01, 2025-05-20
    Network Optimization     :pending, netopt, 2025-05-15, 2025-06-01

    section Machine Learning
    RL Framework             :active, rl, 2025-05-01, 2025-05-25
    Feedback Systems         :active, feed, 2025-05-10, 2025-06-01
    Model Fine-tuning        :pending, tune, 2025-05-20, 2025-06-15
    Performance Analysis     :pending, perf, 2025-06-01, 2025-06-20

    section Enterprise Features
    Security Implementation  :pending, sec, 2025-06-01, 2025-06-25
    Compliance Framework    :pending, comp, 2025-06-15, 2025-07-10
    Enterprise UI           :pending, ui, 2025-06-20, 2025-07-15
    Documentation          :pending, docs, 2025-07-01, 2025-07-25

    section Future Expansion
    Multi-Modal Support     :pending, multi, 2025-07-15, 2025-08-15
    Voice Interface         :pending, voice, 2025-08-01, 2025-08-30
    Mobile Applications     :pending, mobile, 2025-08-15, 2025-09-15
    Edge Computing         :pending, edge, 2025-09-01, 2025-09-30
```

## 🎯 Project Scope

```mermaid
mindmap
  root((DeanmachinesAI))
    Core Features
      Agent Networks
        DeanInsights Network
        DataFlow Network
        ContentCreation Network
      Search Systems
        Brave Search Integration
        Tavily AI Search
        Google CSE
        Vector Search
      Machine Learning
        Reinforcement Learning
        Feedback Systems
        Model Optimization
    Infrastructure
      Storage Solutions
        Pinecone Vector DB
        Turso LibSQL
        File System
      Processing
        Task Queue
        Rate Limiting
        Load Balancing
      Monitoring
        LangSmith Integration
        Performance Metrics
        Error Tracking
    Enterprise
      Security
        Role-Based Access
        Audit Logging
        Encryption
      Compliance
        Data Privacy
        GDPR/CCPA
        ISO Standards
      Scaling
        Horizontal Scaling
        Cloud Deployment
        Edge Computing
    Future Scope
      Multi-Modal
        Voice Interface
        Image Processing
        Video Analysis
      Mobile
        iOS Application
        Android Application
        Cross-Platform SDK
      Integration
        API Gateway
        Third-party APIs
        Custom Plugins
```

## 📊 Implementation Status

```mermaid
pie
    title Feature Implementation Progress
    "Complete" : 35
    "In Progress" : 25
    "Planning" : 20
    "Future Scope" : 20
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

</div>
