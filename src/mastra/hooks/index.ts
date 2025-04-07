// Define the AgentResponse type locally based on usage
interface AgentResponse {
  text?: string;
  object?: unknown; // Consider using a more specific type if the object structure is known
  error?: string;
  // Include other potential properties if needed based on the agent's actual response structure
}

/**
 * Response hook configuration interface
 */
interface ResponseHookConfig {
  minResponseLength?: number;
  maxAttempts?: number;
  validateResponse?: (response: AgentResponse) => boolean;
}

/**
 * Creates an onResponse hook for handling agent responses
 * @param config - Configuration options for the response hook
 */
export function createResponseHook(config: ResponseHookConfig = {}) {
  const {
    minResponseLength = 10,
    maxAttempts = 3,
    validateResponse = (response) =>
      !!(
        response.text ||
        (response.object && Object.keys(response.object).length > 0)
      ),
  } = config;

  return async function onResponse(
    response: AgentResponse,
    attempt = 1
  ): Promise<AgentResponse> {
    try {
      // Check if response is valid according to custom validation
      if (validateResponse(response)) {
        return response;
      }

      // Handle empty or invalid responses
      if (!response.text && !response.object) {
        if (attempt < maxAttempts) {
          return onResponse(response, attempt + 1);
        }
        return {
          text: "I apologize, but I couldn't generate a proper response. Please try rephrasing your request.",
          error: "Empty response after maximum retries",
        };
      }

      // Check response length if text is present
      if (response.text && response.text.length < minResponseLength) {
        return {
          ...response,
          text:
            response.text +
            "\n\nI apologize for the brief response. Would you like me to elaborate?",
        };
      }

      return response;
    } catch (error) {
      console.error("Response hook error:", error);
      return {
        text: "I encountered an error processing the response. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
}
