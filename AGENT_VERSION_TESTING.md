# Agent Version Testing

This document explains how to test the implementation of version-specific agent calls based on the number of STAR examples.

## Overview

Our application now selects the appropriate version of the Master_Agent_V1 agent based on the number of STAR examples provided by the user:

- **2 STAR examples**: Uses `v1.2` of Master_Agent_V1
- **3 STAR examples**: Uses `v1.3` of Master_Agent_V1
- **4 STAR examples**: Uses `v1.4` of Master_Agent_V1

## Implementation Details

The implementation is in `actions/agent-actions.ts` in the `generateAgentPitchAction` function. It:

1. Validates that the user provided between 2-4 STAR examples
2. Determines the appropriate agent version based on the number of examples
3. Sets the `workflow_label_name` parameter in the PromptLayer API request

## Testing the Implementation

We've provided two test scripts that you can use to verify the implementation:

### Option 1: TypeScript Test (Recommended)

Run the TypeScript test script to test the actual server action:

```bash
npx tsx test-agent-versions.ts
```

This script:
- Creates dummy STAR examples for testing
- Calls the `generateAgentPitchAction` function with 2, 3, and 4 STAR examples
- Logs the results to verify correct version selection

### Option 2: Python Test (Direct API Testing)

If you prefer to test the API directly, you can use the Python test script:

```bash
python test_agent_versions.py
```

This script:
- Makes direct API calls to PromptLayer without going through the server action
- Tests with 2, 3, and 4 STAR examples
- Logs the results to verify correct API behavior

## Expected Results

For both test scripts, you should see:

1. With 2 STAR examples: The agent should use version `v1.2`
2. With 3 STAR examples: The agent should use version `v1.3`
3. With 4 STAR examples: The agent should use version `v1.4`

The success message will confirm which version was used, e.g., "Pitch generated successfully using Master_Agent_V1 version v1.3"

## Troubleshooting

If you encounter errors:

1. **Version not found errors**: Verify that the versions (v1.2, v1.3, v1.4) are correctly created in PromptLayer
2. **API key errors**: Check that the API key is valid and has permission to access the agent
3. **Input validation errors**: Ensure the STAR examples are correctly formatted

## Notes

- The tests use dummy data and will generate generic content
- Each test case will take approximately 1-2 minutes to complete due to the agent processing time
- The API key is hardcoded in the test scripts for simplicity but should be moved to environment variables in production 