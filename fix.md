# Things to fix

Error: Error: An error occurred while processing your request. Invalid value at 'tools.function_declarations[10].parameters.properties[1].value.properties[1].value.any_of[1].enum[0]' (TYPE_STRING), false

Error: Error: An error occurred while processing your request. Invalid value at 'tools.function_declarations[5].parameters.properties[1].value.properties[1].value.any_of[1].enum[0]' (TYPE_STRING), false

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
