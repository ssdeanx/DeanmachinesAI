/**
 * Product Launch Network
 *
 * This module implements a comprehensive agent network that coordinates between
 * the coding team and marketing team for end-to-end product development and launch.
 *
 * @module ProductLaunchNetwork
 */

import { AgentNetwork } from "@mastra/core/network";
import { createLogger } from "@mastra/core/logger";
import { sharedMemory } from "../../database";

// Import all required agents
import {
  // Core agents
  researchAgent,
  analystAgent,

  // Coding team
  architectAgent,
  coderAgent,
  debuggerAgent,
  uiUxCoderAgent,
  codeDocumenterAgent,

  // Marketing team
  marketResearchAgent,
  copywriterAgent,
  socialMediaAgent,
  seoAgent,
} from "../../agents";

const logger = createLogger({ name: "product-launch-network", level: "info" });

/**
 * ProductLaunchNetwork
 *
 * A comprehensive agent network that coordinates between specialized coding and marketing teams
 * to deliver an end-to-end product development and launch process.
 *
 * @remarks
 * This network facilitates the workflow from initial research and architecture planning
 * through development, testing, documentation, and marketing launch.
 */
export class ProductLaunchNetwork extends AgentNetwork {
  /**
   * Creates a new ProductLaunchNetwork instance.
   *
   * @param options - Optional configuration options for the network
   */
  constructor(options: { projectName: string; productType: string }) {
    super({
      id: "product-launch-network",
      name: "Product Launch Network",
      description: `Coordinates end-to-end product development and launch for ${options.projectName}`,
      memory: sharedMemory, // Following RULE-MemoryInjection
    });

    // Store configuration
    this.metadata.set("projectName", options.projectName);
    this.metadata.set("productType", options.productType);

    // Register all agents in the network
    this.registerAgents();

    // Define the network topology and connections
    this.defineWorkflow();

    logger.info(
      `ProductLaunchNetwork initialized for project: ${options.projectName}`
    );
  }

  /**
   * Registers all agents required for the product launch process.
   *
   * @private
   */
  private registerAgents(): void {
    // Register research and analysis agents
    this.addAgent(researchAgent, { role: "research" });
    this.addAgent(analystAgent, { role: "analysis" });
    this.addAgent(marketResearchAgent, { role: "market-research" });

    // Register coding team agents
    this.addAgent(architectAgent, { role: "architecture" });
    this.addAgent(coderAgent, { role: "implementation" });
    this.addAgent(debuggerAgent, { role: "quality-assurance" });
    this.addAgent(uiUxCoderAgent, { role: "frontend" });
    this.addAgent(codeDocumenterAgent, { role: "documentation" });

    // Register marketing team agents
    this.addAgent(copywriterAgent, { role: "content-creation" });
    this.addAgent(socialMediaAgent, { role: "promotion" });
    this.addAgent(seoAgent, { role: "search-optimization" });

    logger.info("All agents registered in ProductLaunchNetwork");
  }

  /**
   * Defines the workflow and connections between agents.
   *
   * @private
   */
  private defineWorkflow(): void {
    // Define primary workflow phases
    this.createPhase("research", "Initial research and market analysis");
    this.createPhase("planning", "Architecture and technical planning");
    this.createPhase("development", "Implementation and quality assurance");
    this.createPhase("marketing", "Content creation and promotion");
    this.createPhase("launch", "Product launch and monitoring");

    // Define agent connections in the research phase
    this.connect({
      from: "research",
      to: "analysis",
      description: "Research findings for analysis",
    });

    this.connect({
      from: "analysis",
      to: "market-research",
      description: "Analysis insights for market validation",
    });

    this.connect({
      from: "market-research",
      to: "architecture",
      description: "Market requirements for architecture planning",
    });

    // Define agent connections in the planning phase
    this.connect({
      from: "architecture",
      to: "implementation",
      description: "Architecture specifications for implementation",
    });

    this.connect({
      from: "architecture",
      to: "frontend",
      description: "UI/UX specifications for frontend development",
    });

    // Define agent connections in the development phase
    this.connect({
      from: "implementation",
      to: "quality-assurance",
      description: "Code for testing and debugging",
    });

    this.connect({
      from: "frontend",
      to: "quality-assurance",
      description: "UI/UX implementation for testing",
    });

    this.connect({
      from: "quality-assurance",
      to: "documentation",
      description: "Verified code for documentation",
    });

    // Define agent connections in the marketing phase
    this.connect({
      from: "documentation",
      to: "content-creation",
      description: "Technical documentation for content adaptation",
    });

    this.connect({
      from: "content-creation",
      to: "search-optimization",
      description: "Content for SEO optimization",
    });

    this.connect({
      from: "search-optimization",
      to: "promotion",
      description: "Optimized content for social media promotion",
    });

    logger.info("ProductLaunchNetwork workflow defined");
  }

  /**
   * Executes the product launch process with the given input.
   *
   * @param input - The initial product requirements and specifications
   * @returns A promise resolving to the result of the product launch process
   */
  async execute(input: {
    requirements: string;
    specifications: string;
    targetAudience: string;
  }): Promise<any> {
    logger.info(
      `Starting product launch process for ${this.metadata.get("projectName")}`
    );

    try {
      // Initialize the context with input data
      const context = {
        projectName: this.metadata.get("projectName"),
        productType: this.metadata.get("productType"),
        requirements: input.requirements,
        specifications: input.specifications,
        targetAudience: input.targetAudience,
        timestamp: new Date().toISOString(),
      };

      // Execute the workflow through the defined phases
      const researchResults = await this.executePhase("research", context);
      const planningResults = await this.executePhase("planning", {
        ...context,
        research: researchResults,
      });
      const developmentResults = await this.executePhase("development", {
        ...context,
        planning: planningResults,
      });
      const marketingResults = await this.executePhase("marketing", {
        ...context,
        development: developmentResults,
      });
      const launchResults = await this.executePhase("launch", {
        ...context,
        marketing: marketingResults,
      });

      logger.info(
        `Product launch process completed for ${this.metadata.get(
          "projectName"
        )}`
      );

      return {
        projectName: this.metadata.get("projectName"),
        phases: {
          research: researchResults,
          planning: planningResults,
          development: developmentResults,
          marketing: marketingResults,
          launch: launchResults,
        },
        status: "completed",
      };
    } catch (error) {
      logger.error(
        `Error in product launch process: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }

  /**
   * Executes a specific phase of the product launch process.
   *
   * @private
   * @param phaseName - The name of the phase to execute
   * @param context - The context data for the phase
   * @returns A promise resolving to the result of the phase execution
   */
  private async executePhase(
    phaseName: string,
    context: Record<string, any>
  ): Promise<any> {
    logger.info(`Executing phase: ${phaseName}`);

    // Get agents in this phase based on the workflow definition
    const phaseAgents = this.getAgentsInPhase(phaseName);

    const phaseResults = {};

    // Execute each agent in the phase
    for (const agentRole of phaseAgents) {
      logger.info(`Running agent with role: ${agentRole}`);

      const agentResult = await this.runAgent(agentRole, context);
      phaseResults[agentRole] = agentResult;

      // Update context with this agent's results
      context[agentRole] = agentResult;
    }

    logger.info(`Completed phase: ${phaseName}`);
    return phaseResults;
  }

  /**
   * Gets the agents that should be executed in a specific phase.
   *
   * @private
   * @param phaseName - The name of the phase
   * @returns An array of agent roles in the phase
   */
  private getAgentsInPhase(phaseName: string): string[] {
    switch (phaseName) {
      case "research":
        return ["research", "analysis", "market-research"];

      case "planning":
        return ["architecture"];

      case "development":
        return [
          "implementation",
          "frontend",
          "quality-assurance",
          "documentation",
        ];

      case "marketing":
        return ["content-creation", "search-optimization", "promotion"];

      case "launch":
        return ["content-creation", "promotion"];

      default:
        logger.warn(`Unknown phase: ${phaseName}`);
        return [];
    }
  }
}

// Export singleton instance creator function
export function createProductLaunchNetwork(options: {
  projectName: string;
  productType: string;
}): ProductLaunchNetwork {
  return new ProductLaunchNetwork(options);
}

export default createProductLaunchNetwork;
