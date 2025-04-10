
# DeanmachinesAI API Documentation

```plaintext
INFO [2025-04-09 08:14:22.888 -0400] (DeanmachinesAI): ≡ƒôÜ Open API documentation available at <http://localhost:4111/openapi.json>
INFO [2025-04-09 08:14:22.888 -0400] (DeanmachinesAI): ≡ƒº¬ Swagger UI available at <http://localhost:4111/swagger-ui>
INFO [2025-04-09 08:14:22.888 -0400] (DeanmachinesAI): ≡ƒæ¿ΓÇì≡ƒÆ╗ Playground available at <http://localhost:4111/>
```

## Agent Configuration System Updates (April 9, 2025)

### Enhanced Configuration System

The agent configuration system has been significantly improved with a modular, extensible design:

1. **Centralized Configuration Types**
   - Created `config.types.ts` as the main source for configuration type definitions
   - Added proper TypeScript interfaces with comprehensive JSDoc comments
   - Implemented Zod schema validation for runtime configuration verification

2. **Model Provider Support**
   - Added support for multiple AI model providers (Google AI, Google Vertex AI)
   - Created `provider.utils.ts` for centralized provider management
   - Designed an extensible system for adding new providers (e.g., OpenAI) in the future

3. **Agent Implementation Improvements**
   - Fixed memory injection in agent implementations following best practices
   - Standardized error handling across all agents
   - Ensured all agents use correct tool IDs from the tools registry

### Key Files and Components

- **`config.types.ts`**: Core type definitions for agent configurations
- **`provider.utils.ts`**: Utilities for managing different model providers
- **`model.utils.ts`**: Functions for creating model instances
- **Agent Configuration Files**: Updated to use the new type system
- **Agent Implementation Files**: Fixed to use consistent memory injection and error handling

### Usage Examples

#### Creating a Standard Agent

```typescript
// Import configuration and utilities
import { createAgentFromConfig } from "./base.agent";
import analystConfig from "./config/analyst.config";
import { sharedMemory } from "../database";

// Create the agent with proper memory injection and error handling
export const analystAgent = createAgentFromConfig({
  config: analystConfig,
  memory: sharedMemory, // Following RULE-MemoryInjection
  onError: async (error: Error) => {
    logger.error("Analyst agent error:", error);
    return {
      text: "I encountered an error during analysis."
    };
  },
});
```

#### Using Google Vertex AI

```typescript
// In your agent configuration file
import { createVertexModel } from './config/model.utils';

export const myAgentConfig = {
  // Other configuration properties
  model: createVertexModel('gemini-2.0-pro'),
  // Rest of configuration
};
```

## Documentation Improvement Plan

### How to Improve Documentation for Better Context

1. **Code Structure Documentation**
   - Create architectural diagrams showing component relationships
   - Document data flow between agents, tools, and databases
   - Maintain up-to-date dependency graphs

2. **Type System Documentation**
   - Generate TypeScript interface documentation
   - Provide examples for each interface/type
   - Document constraints and validation rules

3. **Integration Test Examples**
   - Add examples showing how components work together
   - Document expected behavior and error cases
   - Include sample configurations for different scenarios

4. **Provider-Specific Documentation**
   - Create dedicated documentation for each model provider
   - Include setup instructions and authentication requirements
   - Provide examples of provider-specific features and limitations

5. **Agent Capability Matrix**
   - Document which tools each agent can access
   - Specify agent-specific behaviors and limitations
   - Include decision trees for agent selection

6. **Knowledge Graph**
   - Build a knowledge graph showing relationships between components
   - Document cross-cutting concerns and dependencies
   - Track evolution of the system architecture over time

7. **Contextual Comments**
   - Add more descriptive code comments explaining "why" not just "what"
   - Include references to architectural decisions and principles
   - Document assumptions and preconditions

Implementation of these documentation improvements will enhance context awareness for both developers and AI assistants working on the DeanmachinesAI project.

## GitHub Copilot Findings

- [2025-04-09] **Finding**: Tool IDs in agent configurations didn't match actual tool registry IDs
  - **Resolution**: Updated all agent configurations to use correct tool IDs from the registry
  - **Files**: Various `*.config.ts` files in `src/mastra/agents/config/`

- [2025-04-09] **Finding**: Agent implementations were inconsistent in their use of memory injection and error handling
  - **Resolution**: Standardized agent creation using proper memory injection pattern
  - **Files**: Various `*.agent.ts` files in `src/mastra/agents/`

- [2025-04-09] **Enhancement**: Created centralized configuration type system
  - **Implementation**: Added `config.types.ts` as the primary source for configuration types
  - **Benefits**: Improved type safety, modular design, and maintainability

- [2025-04-09] **Enhancement**: Added multi-provider support with Google Vertex AI integration
  - **Implementation**: Created `provider.utils.ts` and updated configuration types
  - **Benefits**: Flexibility to use different AI model providers

- [2025-04-09] **Completed**: Finalized configuration system with new model capabilities
  - **Implementation**: Updated `config.types.ts`, `provider.utils.ts`, and `model.utils.ts`
  - **Features**: Added support for experimental models with enhanced capabilities (audio, thinking, image generation)
  - **Benefits**: Improved model selection based on specific capability requirements

- [2025-04-09] **Migration**: Updated all agent configuration files to use new system
  - **Implementation**: Migrated agent configs to use `DEFAULT_MODELS.GOOGLE_STANDARD` and proper Zod schemas
  - **Files**: Updated all `*.config.ts` files in `src/mastra/agents/config/`
  - **Benefits**: Consistent configuration pattern with proper typing across all agents

- [2025-04-09] **Enhancement**: Added structured response schemas using Zod
  - **Implementation**: Added Zod schemas for agent responses in configuration files
  - **Benefits**: Type-safe responses, improved validation, better integration with tools

- [2025-04-10] **Enhancement**: Implemented advanced prompt engineering techniques for agents
  - **Implementation**: Updated all agent instructions with cutting-edge 2025 prompt techniques
  - **Files**: All `*.config.ts` files in `src/mastra/agents/config/`
  - **Techniques**: Chain-of-thought reasoning, role-based prompting, context expansion, multi-turn prompts, negative prompting, tree-of-thought analysis, adversarial self-assessment, structured outputs
  - **Benefits**: Significantly improved reasoning, task decomposition, error prevention, and output quality

The configuration system is now fully implemented with the following components:

- **`config.types.ts`**: Central source of truth for configuration types with detailed model capabilities
- **`provider.utils.ts`**: Utilities for managing different model providers (Google AI, Vertex AI)
- **`model.utils.ts`**: Functions for creating model instances with proper configuration
- **`index.ts`**: Barrel file exporting all configuration components with proper type safety

The migration to the new system is complete for all agent configurations, providing a consistent pattern using `modelConfig: DEFAULT_MODELS.GOOGLE_STANDARD` that leverages the experimental models with enhanced capabilities.

## Advanced Prompt Engineering Implementation (April 10, 2025)

### Key Improvements to Agent Instructions

We've enhanced all agent configurations with cutting-edge prompt engineering techniques from 2025:

1. **Expert Role Definition**
   - Created clear, specialized expert roles for each agent
   - Established specific domains of expertise with precise responsibilities
   - Enhanced agent identity and specialization awareness

2. **Structured Process Frameworks**
   - Implemented detailed process phases for each agent type
   - Added systematic methodologies with distinct steps
   - Created explicit workflows for complex tasks

3. **Advanced Reasoning Techniques**
   - **Chain-of-Thought Reasoning**: Explicit cognitive steps for methodical problem-solving
   - **Tree-of-Thought Analysis**: Multiple reasoning paths explored simultaneously
   - **Competing Solutions Approach**: Multiple solution strategies evaluated systematically

4. **Negative Prompting**
   - Added explicit anti-patterns and constraints to avoid common pitfalls
   - Implemented "DO NOT" and "AVOID" directives to prevent problematic outputs
   - Enhanced output quality through boundary-setting

5. **Multi-Perspective Analysis**
   - Different analytical lenses for the same problem (e.g., emotional, rational, distinctive)
   - Multiple hypothesis testing for diagnostic scenarios
   - Platform-specific content strategies for varied contexts

6. **Self-Assessment Mechanisms**
   - Adversarial self-assessment with explicit challenge questions
   - Output verification steps to validate reasoning
   - Confidence level requirements for assertions

7. **Example Demonstrations**
   - Added concrete thought process examples for each agent role
   - Included step-by-step reasoning demonstrations
   - Provided clear exemplars of expected output formats

8. **Output Templating**
   - Structured output formats for consistent deliverables
   - Clear section organization for complex responses
   - Standardized communication patterns across agents

These enhancements have been systematically applied to all agent configurations, resulting in significant improvements in reasoning quality, task execution, and output consistency.


{
  "activePaths": {
    "research-step": {
      "status": "failed",
      "stepPath": [
        "research-step"
      ]
    }
  },
  "runId": "dfc05fc1-30d2-42b4-846a-96c58286551c",
  "timestamp": 1744289860175,
  "results": {
    "research-step": {
      "status": "failed",
      "error": "Invalid value at 'tools.function_declarations[10].parameters.properties[1].value.properties[1].value.any_of[1].enum[0]' (TYPE_STRING), false"
    }
  },
  "sanitizedOutput": "{\n  \"activePaths\": {\n    \"research-step\": {\n      \"status\": \"failed\",\n      \"stepPath\": [\n        \"research-step\"\n      ]\n    }\n  },\n  \"runId\": \"dfc05fc1-30d2-42b4-846a-96c58286551c\",\n  \"timestamp\": 1744289860175,\n  \"results\": {\n    \"research-step\": {\n      \"status\": \"failed\",\n      \"error\": \"Invalid value at 'tools.function_declarations[10].parameters.properties[1].value.properties[1].value.any_of[1].enum[0]' (TYPE_STRING), false\"\n    }\n  }\n}"
}

```

GET

/api/networks

GET

/api/networks/Knowledge_Work_MoE_Network__knowledge-work-moe-v1_

POST

/api/networks/Knowledge_Work_MoE_Network__knowledge-work-moe-v1_/generate

POST

/api/networks/Knowledge_Work_MoE_Network__knowledge-work-moe-v1_/stream

GET

/api/networks

GET

/api/networks/ContentCreation_Network

POST

/api/networks/ContentCreation_Network/generate

POST

/api/networks/ContentCreation_Network/stream

GET

/api/networks

GET

/api/networks/DataFlow_Network

POST

/api/networks/DataFlow_Network/generate

POST

/api/networks/DataFlow_Network/stream

GET

/api/networks

GET

/api/networks/DeanInsights_Network

POST

/api/networks/DeanInsights_Network/generate

POST

/api/networks/DeanInsights_Network/stream
