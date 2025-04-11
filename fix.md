# Things to fix

## 1. Fix the error in the research step aka make sure to use @agentic/mastra

```plaintext
Agentic adapter for the Mastra AI Agent framework.

package: @agentic/mastra
exports: function createMastraTools
```

```ts
import 'dotenv/config'

import { createMastraTools } from '@agentic/mastra'
import { WeatherClient } from '@agentic/weather' // Use any of @agentic/* tools need to have agentic mastra adapter or you will get an error it was just updated to new version
import { openai } from '@ai-sdk/openai'  // Use ai-sdk/google instead of ai-sdk/openai
import { Agent } from '@mastra/core/agent'

async function main() {
  const weather = new WeatherClient()

  const weatherAgent = new Agent({
    name: 'Weather Agent',
    instructions: 'You are a helpful assistant. Be as concise as possible.',
    model: openai('gpt-4o-mini'),
    tools: createMastraTools(weather)
  })

  const res = await weatherAgent.generate(
    'What is the weather in San Francisco?'
  )
  console.log(res.text)
}

await main()
```

### List of agentic tools that are compatible with the new version of @agentic/mastra
- @agentic/weather

- @agentic/mastra
  - exports: function createMastraTools
- @agentic/langchain
  - exports: function createLangChainTools
- @agentic/llamaindex
  - exports: function createLlamaIndexTools
- @agentic/genkit
  - exports: function createGenKitTools
- @agentic/serper
  - exports: class SerperClient, namespace serper
  - env vars: SERPER_API_KEY
- @agentic/ai-sdk
  - exports: function createAiSdkTools
- @agentic/google-drive
  - exports: function createGoogleDriveTools
- @agentic/mcp
  - exports: function createMcpTools, class McpTools
- @agentic/notion
  - exports: class NotionClient, namespace notion
  - env vars: NOTION_API_KEY
- @agentic/tavily
  - exports: class TavilyClient, namespace tavily
  - env vars: TAVILY_API_KEY
- @agentic/wikipedia
  - exports: class WikipediaClient, namespace wikipedia
- @agentic/wikidata
  - exports: class WikidataClient, namespace wikidata
- @agentic/social-data
  - exports: class SocialDataClient, namespace socialdata
  - env vars: SOCIAL_DATA_API_KEY
- @agentic/reddit
  - exports: class RedditClient, namespace reddit
- @agentic/midjourney
  - exports: class MidjourneyClient, namespace midjourney
  - env vars: MIDJOURNEY_API_KEY
- @agentic/google-docs
  - exports: class GoogleDocsClient, namespace googleDocs
- @agentic/google-custom-search
  - exports: class GoogleCustomSearchClient, namespace googleCustomSearch
  - env vars: GOOGLE_API_KEY, GOOGLE_CSE_ID
- @agentic/firecrawler
  - exports: class FirecrawlerClient, namespace firecrawler
  - env vars: FIRECRAWLER_API_KEY
- @agentic/exa
  - exports: class ExaClient, namespace exa
  - env vars: EXA_API_KEY
- @agentic/e2b
  - exports: function e2b
  - env vars: E2B_API_KEY
- @agentic/brave-search
  - exports: class BraveSearchClient, namespace braveSearch
  - env vars: BRAVE_SEARCH_API_KEY
- @agentic/arxiv
  - exports: class ArxivClient, namespace arxiv
- @agentic/calculator
  - exports: function calculator

Error: Error: An error occurred while processing your request. Invalid value at 'tools.function_declarations[10].parameters.properties[1].value.properties[1].value.any_of[1].enum[0]' (TYPE_STRING), false
`
Error: Error: An error occurred while processing your request. Invalid value at 'tools.function_declarations[5].parameters.properties[1].value.properties[1].value.any_of[1].enum[0]' (TYPE_STRING), false

## 2. Fix the error in the research step aka make sure to use @agentic/mastra

```json

{
  "activePaths": {
    "research-step": {
      "status": "failed",
      "stepPath": [
        "research-step"
      ]
    }
  },
  "runId": "4a8f167e-bc95-41ba-8bde-566887c4033b",
  "timestamp": 1744314840600,
  "results": {
    "research-step": {
      "status": "failed",
      "error": "Invalid value at 'tools.function_declarations[10].parameters.properties[1].value.properties[1].value.any_of[1].enum[0]' (TYPE_STRING), false"
    }
  },
  "sanitizedOutput": "{\n  \"activePaths\": {\n    \"research-step\": {\n      \"status\": \"failed\",\n      \"stepPath\": [\n        \"research-step\"\n      ]\n    }\n  },\n  \"runId\": \"4a8f167e-bc95-41ba-8bde-566887c4033b\",\n  \"timestamp\": 1744314840600,\n  \"results\": {\n    \"research-step\": {\n      \"status\": \"failed\",\n      \"error\": \"Invalid value at 'tools.function_declarations[10].parameters.properties[1].value.properties[1].value.any_of[1].enum[0]' (TYPE_STRING), false\"\n    }\n  }\n}"
}
```

## 3. Fix the error in mastra/index.ts

when building got a lot of errors like this:

bunch of ANY errors, undefined, null, etc.
