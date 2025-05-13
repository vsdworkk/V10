# Pitch Generation Refactor Plan

This document outlines the steps to refactor the pitch generation system to follow the same architecture pattern as the guidance generation system, creating a more consistent and maintainable codebase.

## Overview

Currently, the application has two different approaches:

1. **Guidance Generation**: Uses a well-structured system with API routes, service layer, and React hook
2. **Pitch Generation**: Uses direct Supabase subscription in the component

This refactor will align the pitch generation with the guidance pattern, creating parallel implementations for consistency.

## Key Architectural Pattern: Pitch ID as Execution ID

An important pattern in the guidance system is the use of the pitch ID as the execution ID. This approach:

1. **Simplifies tracking**: The pitch ID (already in the database) is used as the execution ID for the PromptLayer workflow
2. **Eliminates the need for separate IDs**: No need to generate and track separate execution IDs
3. **Enables easier lookups**: The system can find generated content by querying with either the pitch ID or execution ID
4. **Streamlines callbacks**: The callback from PromptLayer can identify which pitch to update using this ID

Our new pitch generation system will follow this exact same pattern, using the existing pitch ID as the execution ID throughout the entire process flow.

## Architecture Diagram

```
Client Side                    API Layer                     External Service
┌───────────────┐             ┌───────────────┐             ┌───────────────┐
│               │  Request    │               │  Forward    │               │
│    React      ├────────────►│  Next.js API  ├────────────►│  PromptLayer  │
│  Components   │             │    Routes     │             │     API       │
│               │◄────────────┤               │◄────────────┤               │
└───────┬───────┘  Response   └───────┬───────┘  Callback   └───────────────┘
        │                             │
        │                             │
        ▼                             ▼
┌───────────────┐             ┌───────────────┐
│   Custom      │             │               │
│    Hooks      │             │   Database    │
│               │             │               │
└───────────────┘             └───────────────┘
```

## New File Structure

```
app/
  api/
    newpitchgeneration/
      route.ts            # Initiates pitch generation
      status/
        route.ts          # Checks status of pitch generation
      callback/
        route.ts          # Receives callback from PromptLayer
lib/
  services/
    pitch-generation-service.ts  # Client functions for pitch generation
  hooks/
    use-pitch-generation.ts      # React hook to manage pitch generation state
```

## Implementation Steps

### ✅ Step 1: Create the Service Layer

Create a new file: `lib/services/pitch-generation-service.ts`

```typescript
import type { ActionState } from '@/types';

interface PitchGenerationRequest {
  userId: string;
  roleName: string;
  organisationName: string;
  roleLevel: string;
  pitchWordLimit: number;
  roleDescription: string;
  relevantExperience: string;
  albertGuidance: string;
  starExamples: any[]; // Use the proper type from your schema
  starExamplesCount: number;
  pitchId: string; // This is the key field that will be used as the execution ID
}

export async function requestPitchGeneration(request: PitchGenerationRequest): Promise<ActionState<string>> {
  try {
    // PitchId is required - it will be used as the requestId/executionId
    if (!request.pitchId) {
      return {
        isSuccess: false,
        message: 'A pitch ID is required for pitch generation'
      };
    }
    
    // Use the pitch ID as the request ID - same pattern as guidance system
    const requestId = request.pitchId;
    
    const response = await fetch('/api/newpitchgeneration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      isSuccess: true,
      message: 'Pitch generation request initiated',
      data: requestId // Return the pitch ID as the requestId
    };
  } catch (error) {
    console.error('Pitch generation request error:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to request pitch generation'
    };
  }
}

export async function checkPitchGenerationStatus(requestId: string): Promise<ActionState<string>> {
  try {
    // requestId is actually the pitch ID
    const response = await fetch(`/api/newpitchgeneration/status?requestId=${requestId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'completed') {
      return {
        isSuccess: true,
        message: 'Pitch generated',
        data: data.pitchContent
      };
    }
    
    return {
      isSuccess: false,
      message: 'Pitch still processing',
    };
  } catch (error) {
    console.error('Pitch generation status check error:', error);
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : 'Failed to check pitch generation status'
    };
  }
}
```

### ✅ Step 2: Create the React Hook

Create a new file: `lib/hooks/use-pitch-generation.ts`

```typescript
import { useState, useEffect } from 'react';
import { requestPitchGeneration, checkPitchGenerationStatus } from '@/lib/services/pitch-generation-service';

export function usePitchGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [pitchContent, setPitchContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null); // This will actually hold the pitch ID
  
  // Function to request pitch generation
  const generatePitch = async (pitchData: {
    userId: string;
    roleName: string;
    organisationName: string;
    roleLevel: string;
    pitchWordLimit: number;
    roleDescription: string;
    relevantExperience: string;
    albertGuidance: string;
    starExamples: any[]; // Use the proper type from your schema
    starExamplesCount: number;
    pitchId: string; // The pitch ID that will be used as the execution ID
  }) => {
    console.log("[usePitchGeneration] generatePitch called - setting isLoading to true");
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await requestPitchGeneration(pitchData);
      
      if (!result.isSuccess) {
        console.log("[usePitchGeneration] generatePitch received error:", result.message);
        throw new Error(result.message);
      }
      
      // Store the pitch ID as the requestId - following the same pattern as guidance
      console.log("[usePitchGeneration] generatePitch succeeded, setting requestId:", result.data);
      setRequestId(result.data);
      
      // Immediately check if we already have a pitch in the database
      setTimeout(() => {
        console.log("[usePitchGeneration] Immediate check for existing pitch");
        checkPitchGenerationStatus(result.data)
          .then(statusResult => {
            if (statusResult.isSuccess && statusResult.data) {
              console.log("[usePitchGeneration] Found pitch immediately:", statusResult.data.substring(0, 20) + "...");
              setPitchContent(statusResult.data);
              setIsLoading(false);
            } else {
              console.log("[usePitchGeneration] No immediate pitch found, will poll");
            }
          })
          .catch(err => console.error("[usePitchGeneration] Error checking immediate pitch:", err));
      }, 100);
      
    } catch (err: any) {
      console.error("[usePitchGeneration] generatePitch error:", err);
      setError(err instanceof Error ? err.message : 'Failed to request pitch generation');
      setIsLoading(false);
    }
  };
  
  // Poll for pitch generation status when requestId changes
  // The requestId is actually the pitch ID
  useEffect(() => {
    if (!requestId) return;
    
    const pollInterval = 3000; // 3 seconds
    let attempts = 0;
    const maxAttempts = 60; // Timeout after ~3 minutes (pitch generation might take longer than guidance)
    let isPolling = true; // Flag to track if polling is active
    
    const checkStatus = async () => {
      if (!isPolling) return true; // Don't continue if polling was stopped
      
      try {
        // Check status using the pitch ID as the requestId
        const result = await checkPitchGenerationStatus(requestId);
        
        if (result.isSuccess && result.data) {
          console.log("[usePitchGeneration] Received successful pitch data from service");
          if (isPolling) { // Check flag before updating state
            setPitchContent(result.data);
            console.log("[usePitchGeneration] Setting isLoading to false");
            setIsLoading(false);
            isPolling = false; // Stop polling
          }
          return true; // Stop polling
        }
        
        // Continue polling if not complete
        attempts++;
        console.log(`[usePitchGeneration] Poll attempt ${attempts}/${maxAttempts}, continuing polling`);
        if (attempts >= maxAttempts) {
          console.log("[usePitchGeneration] Reached max attempts, setting error and stopping polling");
          if (isPolling) { // Check flag before updating state
            setError('Pitch generation timed out. Please try again.');
            setIsLoading(false);
            isPolling = false; // Stop polling
          }
          return true; // Stop polling
        }
        
        if (!isPolling) return true; // Don't continue if polling was stopped
        return false; // Continue polling
      } catch (err: any) {
        console.error("[usePitchGeneration] Error during polling:", err);
        if (isPolling) { // Check flag before updating state
          setError(err instanceof Error ? err.message : 'Failed to check pitch generation status');
          setIsLoading(false);
          isPolling = false; // Stop polling
        }
        return true; // Stop polling on error
      }
    };
    
    // Start polling
    const poll = async () => {
      const shouldStop = await checkStatus();
      if (!shouldStop && isPolling) {
        setTimeout(poll, pollInterval);
      }
    };
    
    // Force loading state at the start of polling
    setIsLoading(true);
    poll();
    
    // Cleanup
    return () => {
      console.log("[usePitchGeneration] Cleanup function called, stopping polling");
      isPolling = false; // Signal to stop polling on unmount
      attempts = maxAttempts; // Force stop on unmount (legacy approach)
    };
  }, [requestId]);
  
  return {
    isLoading,
    pitchContent,
    error,
    requestId, // This is actually the pitch ID
    generatePitch,
    reset: () => {
      setPitchContent(null);
      setError(null);
      setRequestId(null);
      setIsLoading(false);
    }
  };
}
```

### ✅ Step 3: Create the API Route for Pitch Generation

Create a new file: `app/api/newpitchgeneration/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { updatePitchByExecutionId } from '@/actions/db/pitches-actions';

export async function POST(req: NextRequest) {
  try {
    const pitchData = await req.json();
    const { 
      userId, 
      pitchId, 
      roleName, 
      organisationName, 
      roleLevel, 
      pitchWordLimit, 
      roleDescription, 
      relevantExperience,
      albertGuidance,
      starExamples,
      starExamplesCount 
    } = pitchData;
    
    // Validate required fields
    if (!userId || !pitchId || !roleName || !roleLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Use the pitchId as the requestId for the agent - this is the key pattern
    // that matches the guidance system
    const requestId = pitchId;
    
    // Store the request in database with the pitch ID set as the agentExecutionId
    try {
      const updateResult = await updatePitchByExecutionId(requestId, {
        agentExecutionId: requestId, // Store the pitch ID as the execution ID
        // Set status to indicate pitch generation is in progress
        status: 'draft'
      });
      
      if (!updateResult.isSuccess) {
        console.error(`Failed to update pitch with execution ID: ${updateResult.message}`);
        return NextResponse.json({ error: `Failed to update pitch: ${updateResult.message}` }, { status: 500 });
      }
      
      console.log(`Successfully updated pitch with execution ID: ${requestId}`);
    } catch (error) {
      console.error(`Error updating pitch with execution ID: ${error}`);
      return NextResponse.json({ error: `Error updating pitch: ${error}` }, { status: 500 });
    }
    
    // Call PromptLayer with proper error handling and timeout
    const promptLayerApiKey = process.env.AGENT_API_KEY;
    if (!promptLayerApiKey) {
      return NextResponse.json({ error: 'PromptLayer API key not configured' }, { status: 500 });
    }
    
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/api/newpitchgeneration/callback`;
    
    // We use AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout
    
    try {
      // Prepare star examples in a format suitable for PromptLayer
      const formattedStarExamples = starExamples.map((example, index) => {
        return {
          index: index + 1,
          situation: example.situation,
          task: example.task,
          action: example.action,
          result: example.result
        };
      });

      // Make the PromptLayer API call
      // Note that we're passing the pitch ID as id_unique - this is how guidance system works
      const response = await fetch(
        "https://api.promptlayer.com/workflows/Pitch Generator/run", // Use the correct workflow name
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": promptLayerApiKey,
          },
          body: JSON.stringify({
            workflow_label_name: "v1", 
            input_variables: {
              role_name: roleName,
              organisation_name: organisationName || "",
              role_level: roleLevel,
              word_limit: pitchWordLimit,
              job_description: roleDescription,
              user_experience: relevantExperience,
              ai_guidance: albertGuidance,
              star_examples: formattedStarExamples,
              star_count: starExamplesCount,
              id_unique: requestId // The pitch ID is passed as id_unique to PromptLayer
            },
            metadata: {
              source: "webapp",
              callback_url: callbackUrl
            },
          }),
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PromptLayer error: ${errorText}`);
      }
      
      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        requestId, // Return the pitch ID as the requestId
        message: "Pitch generation request initiated"
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error requesting pitch generation:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```

### ✅ Step 4: Create the API Route for Checking Pitch Status

Create a new file: `app/api/newpitchgeneration/status/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getPitchByExecutionIdAction } from '@/actions/db/pitches-actions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('requestId');
    
    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId parameter' }, { status: 400 });
    }
    
    // Note: The requestId is actually the pitch ID
    // getPitchByExecutionIdAction is designed to look up by BOTH agentExecutionId and id fields
    // This is the exact same pattern used by the guidance system
    const result = await getPitchByExecutionIdAction(requestId);
    console.log(`Pitch status check for requestId ${requestId}: ${result.isSuccess ? 'found' : 'not found'}`);
    
    if (!result.isSuccess) {
      return NextResponse.json({ 
        status: 'pending',
        message: 'Pitch not found or still processing' 
      });
    }
    
    // If we have pitch content, return it
    if (result.data?.pitchContent) {
      return NextResponse.json({
        status: 'completed',
        pitchContent: result.data.pitchContent
      });
    }
    
    // Otherwise, it's still processing
    return NextResponse.json({ 
      status: 'pending',
      message: 'Pitch still processing' 
    });
  } catch (error: any) {
    console.error("Error checking pitch status:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
```

### ✅ Step 5: Create the API Route for Callback from PromptLayer

Create a new file: `app/api/newpitchgeneration/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { updatePitchByExecutionId } from '@/actions/db/pitches-actions';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Extract the unique ID (which is the pitch ID) from the callback data
    let uniqueId = "";
    
    // Check common locations for the ID - same approach as guidance system
    if (data.input_variables?.id_unique) {
      uniqueId = data.input_variables.id_unique;
    } else if (data.output?.data?.id_unique) {
      uniqueId = data.output.data.id_unique;
    } else if (data.id_unique) {
      uniqueId = data.id_unique;
    } else if (data.data?.id_unique) {
      uniqueId = data.data.id_unique;
    }
    
    if (!uniqueId) {
      console.error("No unique ID found in callback data", data);
      return NextResponse.json(
        { error: "No unique ID provided in callback" },
        { status: 400 }
      );
    }
    
    // Extract the pitch content
    let pitchContent = "";
    if (data.output?.data?.["Final Pitch"]) {
      pitchContent = data.output.data["Final Pitch"];
    } else if (data.data?.["Final Pitch"]) {
      pitchContent = data.data["Final Pitch"];
    }
    
    if (!pitchContent) {
      console.error("No pitch content found in callback data", data);
      return NextResponse.json(
        { error: "No pitch content found in callback" },
        { status: 400 }
      );
    }
    
    // Format the pitch content as HTML if needed
    const htmlPitchContent = formatPitchAsHtml(pitchContent);
    
    // Update the database using updatePitchByExecutionId which can find the record
    // using either the agentExecutionId field or the id field (the pitch ID)
    // This is the exact same pattern used by the guidance system
    console.log(`Updating pitch with execution ID ${uniqueId} and pitch content (${htmlPitchContent.length} chars)`);
    const updateResult = await updatePitchByExecutionId(uniqueId, {
      pitchContent: htmlPitchContent,
      status: 'final'
    });
    
    if (!updateResult.isSuccess) {
      console.error(`Failed to update pitch: ${updateResult.message}`);
      return NextResponse.json(
        { error: updateResult.message },
        { status: 500 }
      );
    }
    
    console.log("Pitch saved successfully");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in pitch callback:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Format plain text pitch as HTML for the rich text editor
 */
function formatPitchAsHtml(text: string): string {
  if (!text) return "";
  
  // Basic conversion of plain text to HTML
  // Replace line breaks with paragraph tags
  let html = "";
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const para of paragraphs) {
    if (!para.trim()) continue;
    
    // Check if paragraph is a heading (e.g. "# Heading" or "## Subheading")
    if (para.startsWith('# ')) {
      const headingText = para.substring(2).trim();
      html += `<h1>${headingText}</h1>`;
    } else if (para.startsWith('## ')) {
      const headingText = para.substring(3).trim();
      html += `<h2>${headingText}</h2>`;
    } else if (para.startsWith('### ')) {
      const headingText = para.substring(4).trim();
      html += `<h3>${headingText}</h3>`;
    } else {
      // Regular paragraph
      const lines = para.split('\n');
      const processedPara = lines.join('<br>');
      html += `<p>${processedPara}</p>`;
    }
  }
  
  return html;
}
```

### ✅ Step 6: Update the API Route with Correct Workflow Details

Modified the `app/api/newpitchgeneration/route.ts` file to use the correct workflow details from the existing implementation:

1. Updated to use the correct PromptLayer API key environment variable
2. Enhanced the STAR example formatting to match the existing implementation
3. Implemented proper version selection logic based on the number of examples
4. Used the appropriate word count calculations and input parameter names
5. Updated to use the correct workflow name "Master_Agent_V1"

### ✅ Step 7: Update the ReviewStep Component

Updated the `ReviewStep.tsx` component to use the new hook instead of the direct Supabase subscription:

1. Imported the new `usePitchGeneration` hook
2. Removed Supabase realtime subscription logic
3. Added logic to trigger pitch generation when needed
4. Added effects to handle generated pitch content and errors
5. Updated loading state to include both parent loading state and hook loading state
6. Used the hook's error state in the error handling UI

## Testing the Implementation

### 1. Test API Routes Individually

Use tools like Postman or curl to test each API route:

- POST to `/api/newpitchgeneration` with sample pitch data
- GET from `/api/newpitchgeneration/status?requestId=some-id` (where "some-id" is a pitch ID)
- POST to `/api/newpitchgeneration/callback` with sample callback data

### 2. Test the Hook in Isolation

Create a simple test component that uses the hook to verify it works correctly.

### 3. Integration Testing

1. Go through the pitch wizard process
2. Verify pitch generation starts
3. Confirm the UI shows loading state
4. Validate the pitch content appears when ready
5. Check that editing works correctly

## Deployment Considerations

1. **Environment Variables**: Ensure all necessary environment variables are set in your deployment environment.

2. **Rollout Strategy**: Consider a phased rollout starting with staging/testing environments before production.

3. **Monitoring**: Add appropriate logging to track any issues in the new implementation.

## Fallback Plan

In case of issues:
1. Keep the old implementation in place but commented out
2. Add a feature flag to switch between old and new implementations if needed

---

This refactor creates a more consistent architecture across the application, making it easier to maintain and understand the code. The pitch generation system will now follow the same patterns as the guidance system, with clear separation of concerns and better error handling. 