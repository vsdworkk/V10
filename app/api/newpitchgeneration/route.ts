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
    const promptLayerApiKey = process.env.PROMPTLAYER_API_KEY;
    if (!promptLayerApiKey) {
      return NextResponse.json({ error: 'PromptLayer API key not configured' }, { status: 500 });
    }
    
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/api/newpitchgeneration/callback`;
    
    // We use AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout
    
    try {
      // Prepare star examples in a format suitable for PromptLayer
      const formattedStarExamples = starExamples.map((ex: any, idx: number) => ({
        id: String(idx + 1),
        situation: [
          ex.situation?.["where-and-when-did-this-experience-occur"],
          ex.situation?.["briefly-describe-the-situation-or-challenge-you-faced"]
        ]
          .filter(Boolean)
          .join("\n"),
        task: [
          ex.task?.["what-was-your-responsibility-in-addressing-this-issue"],
          ex.task?.["what-constraints-or-requirements-did-you-need-to-consider"]
        ]
          .filter(Boolean)
          .join("\n"),
        action: ex.action.steps
          .map(
            (s: any, i: number) =>
              `Step ${i + 1}: ${s["what-did-you-specifically-do-in-this-step"]}\n` +
              `How: ${s["how-did-you-do-it-tools-methods-or-skills"]}\n` +
              (s["what-was-the-outcome-of-this-step-optional"]
                ? `Outcome: ${s["what-was-the-outcome-of-this-step-optional"]}`
                : "")
          )
          .join("\n\n"),
        result: [
          ex.result?.["what-positive-outcome-did-you-achieve"],
          ex.result?.[
            "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"
          ]
        ]
          .filter(Boolean)
          .join("\n")
      }));

      // Build job description string
      const jobDescription = [
        `Role: ${roleName}`,
        `Level: ${roleLevel}`,
        roleDescription ? `Description: ${roleDescription}` : undefined
      ]
        .filter(Boolean)
        .join("\n");

      // Choose agent version based on number of examples
      const numExamples = starExamplesCount || starExamples.length;
      const getVersion = (n: number) =>
        ({ 2: "v1.2", 3: "v1.3", 4: "v1.4" } as const)[n] || "v1.2";
      
      const workflowLabelName = getVersion(numExamples);

      // Calculate word counts
      const introWordCount = Math.round(pitchWordLimit * 0.1);
      const conclusionWordCount = Math.round(pitchWordLimit * 0.1);
      const starWordCount = Math.round((pitchWordLimit * 0.8) / numExamples);

      // Make the PromptLayer API call with the correct workflow and parameters
      const response = await fetch(
        "https://api.promptlayer.com/workflows/Master_Agent_V1/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": promptLayerApiKey,
          },
          body: JSON.stringify({
            workflow_label_name: workflowLabelName,
            input_variables: {
              job_description: jobDescription,
              star_components: JSON.stringify({ starExamples: formattedStarExamples }),
              Star_Word_Count: starWordCount.toString(),
              User_Experience: relevantExperience,
              Intro_Word_Count: introWordCount.toString(),
              Conclusion_Word_Count: conclusionWordCount.toString(),
              ILS: "Isssdsd", // This appears to be a constant in the original code
              id_unique: requestId // The pitch ID is passed as id_unique to PromptLayer
            },
            metadata: {
              source: "webapp",
              callback_url: callbackUrl
            },
            return_all_outputs: true
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
        message: `Agent version ${workflowLabelName} launched.`
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