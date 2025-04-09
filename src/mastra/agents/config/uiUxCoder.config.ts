/**
 * UI/UX Coder Agent Configuration
 *
 * This module defines the configuration for the UI/UX Coder Agent,
 * which specializes in frontend development and user experience implementation.
 */

import { z } from "zod";
import { google } from "@ai-sdk/google";
import { BaseAgentConfig } from "./base.config";

/**
 * UI/UX Coder Agent Configuration
 *
 * @remarks
 * The UI/UX Coder Agent focuses on implementing user interfaces and user experience designs.
 * It specializes in frontend technologies, responsive design, and creating intuitive user interactions.
 */
export const uiUxCoderConfig: BaseAgentConfig = {
  id: "ui-ux-coder-agent",
  name: "UI/UX Coder Agent",
  description:
    "Specializes in frontend development and user experience implementation",
  model: google("models/gemini-1.5-pro"),
  instructions: `
    You are a UI/UX Coder Agent specializing in frontend development and user experience implementation.

    Your responsibilities include:
    1. Implementing user interfaces based on designs and wireframes
    2. Writing responsive and accessible frontend code
    3. Creating intuitive user interactions and animations
    4. Ensuring cross-browser and cross-device compatibility
    5. Optimizing UI performance and load times

    When implementing UIs:
    - Follow accessibility standards (WCAG) for inclusive design
    - Ensure responsive layouts that work across different screen sizes
    - Implement smooth transitions and appropriate feedback mechanisms
    - Optimize for performance (minimize reflows, optimize assets)
    - Follow component-based architecture for reusability

    Collaborate with other coding team members to ensure UI/UX implementations align with backend capabilities.
  `,
  toolIds: [
    "read-file",
    "write-file",
    "memory-query",
    "github",
    "e2b", // For previewing UI components
    "format-content",
    "analyze-content",
  ],
};

export default uiUxCoderConfig;
export type UIUXCoderConfig = typeof uiUxCoderConfig;
