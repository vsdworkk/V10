/**
 * @description
 * Exports server actions related to agent-driven pitch generation.
 * The primary action here is generateAgentPitchAction, which calls an external
 * agent API to generate the final pitch based on user-provided pitch details.
 *
 * Key Features:
 * - Makes a POST request to the agent API with required input variables
 * - Waits for processing, then makes a GET request to retrieve the results
 * - Returns the pitch in a standard ActionState format
 *
 * @dependencies
 * - "ActionState" from "@/types" for uniform success/fail structure.
 * - Environment variable "AGENT_API_KEY" (defaults to hardcoded key for now).
 */

"use server"
import { ActionState } from "@/types"
import { StarSchema } from "@/db/schema/pitches-schema"
import { setTimeout } from "timers/promises"

/**
 * Interface for our structured STAR example array
 */
interface StarExample {
  id: string;
  situation: string;
  task: string;
  action: string;
  result: string;
}

/**
 * @interface GenerateAgentPitchParams
 * @description Defines the structure of user-provided data necessary to generate
 * a pitch via the external agent.
 */
export interface GenerateAgentPitchParams {
  roleName: string
  roleLevel: string
  pitchWordLimit: number
  roleDescription?: string
  yearsExperience: string
  relevantExperience: string
  starExample1?: StarSchema | {
    situation: string
    task: string
    action: string
    result: string
  }
  starExample2?: StarSchema | {
    situation: string
    task: string
    action: string
    result: string
  }
}

/**
 * @function generateAgentPitchAction
 * @description
 * Server action to generate a final pitch using the external agent API.
 *
 * @param {GenerateAgentPitchParams} pitchData - The user-defined pitch data
 * @returns {Promise<ActionState<string>>} - The agent-generated text or an error state
 */
export async function generateAgentPitchAction(
  pitchData: GenerateAgentPitchParams
): Promise<ActionState<string>> {
  try {
    // Format the job description from the pitch data
    const jobDescription = `
Role: ${pitchData.roleName}
Level: ${pitchData.roleLevel}
${pitchData.roleDescription ? `Description: ${pitchData.roleDescription}` : ''}
Years of Experience: ${pitchData.yearsExperience}
`.trim();

    // Format the STAR examples as a structured JSON object
    const starExamplesArray: StarExample[] = [];
    
    if (pitchData.starExample1) {
      let situationText = "";
      let taskText = "";
      let actionText = "";
      let resultText = "";
      
      // Handle both simple and complex STAR formats
      if (typeof pitchData.starExample1 === 'object') {
        if ('situation' in pitchData.starExample1 && typeof pitchData.starExample1.situation === 'object') {
          // Complex nested structure
          const situation = pitchData.starExample1.situation as StarSchema['situation'];
          situationText = [
            situation["where-and-when-did-this-experience-occur"] || "",
            situation["briefly-describe-the-situation-or-challenge-you-faced"] || "",
            situation["why-was-this-a-problem-or-why-did-it-matter"] || ""
          ].filter(Boolean).join("\n");
          
          const task = pitchData.starExample1.task as StarSchema['task'];
          taskText = [
            task["what-was-your-responsibility-in-addressing-this-issue"] || "",
            task["how-would-completing-this-task-help-solve-the-problem"] || "",
            task["what-constraints-or-requirements-did-you-need-to-consider"] || ""
          ].filter(Boolean).join("\n");
          
          // Handle action steps
          const action = pitchData.starExample1.action;
          if (action && typeof action === 'object' && 'steps' in action && Array.isArray(action.steps)) {
            actionText = action.steps.map((step, index) => {
              return `Step ${index + 1}: ${step["what-did-you-specifically-do-in-this-step"] || ""}\n` +
                    `How: ${step["how-did-you-do-it-tools-methods-or-skills"] || ""}\n` +
                    (step["what-was-the-outcome-of-this-step-optional"] ? 
                    `Outcome: ${step["what-was-the-outcome-of-this-step-optional"]}` : "");
            }).join("\n\n");
          }
          
          const result = pitchData.starExample1.result as StarSchema['result'];
          resultText = [
            result["what-positive-outcome-did-you-achieve"] || "",
            result["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] || "",
            result["what-did-you-learn-from-this-experience"] || ""
          ].filter(Boolean).join("\n");
          
        } else {
          // Simple structure
          situationText = typeof pitchData.starExample1.situation === 'string' 
            ? pitchData.starExample1.situation 
            : "";
          taskText = typeof pitchData.starExample1.task === 'string' 
            ? pitchData.starExample1.task 
            : "";
          actionText = typeof pitchData.starExample1.action === 'string' 
            ? pitchData.starExample1.action 
            : "";
          resultText = typeof pitchData.starExample1.result === 'string' 
            ? pitchData.starExample1.result 
            : "";
        }
      }
      
      // Add the structured example to our array
      starExamplesArray.push({
        id: "1",
        situation: situationText,
        task: taskText,
        action: actionText,
        result: resultText
      });
    }
    
    if (pitchData.starExample2) {
      let situationText = "";
      let taskText = "";
      let actionText = "";
      let resultText = "";
      
      // Handle both simple and complex STAR formats
      if (typeof pitchData.starExample2 === 'object') {
        if ('situation' in pitchData.starExample2 && typeof pitchData.starExample2.situation === 'object') {
          // Complex nested structure
          const situation = pitchData.starExample2.situation as StarSchema['situation'];
          situationText = [
            situation["where-and-when-did-this-experience-occur"] || "",
            situation["briefly-describe-the-situation-or-challenge-you-faced"] || "",
            situation["why-was-this-a-problem-or-why-did-it-matter"] || ""
          ].filter(Boolean).join("\n");
          
          const task = pitchData.starExample2.task as StarSchema['task'];
          taskText = [
            task["what-was-your-responsibility-in-addressing-this-issue"] || "",
            task["how-would-completing-this-task-help-solve-the-problem"] || "",
            task["what-constraints-or-requirements-did-you-need-to-consider"] || ""
          ].filter(Boolean).join("\n");
          
          // Handle action steps
          const action = pitchData.starExample2.action;
          if (action && typeof action === 'object' && 'steps' in action && Array.isArray(action.steps)) {
            actionText = action.steps.map((step, index) => {
              return `Step ${index + 1}: ${step["what-did-you-specifically-do-in-this-step"] || ""}\n` +
                    `How: ${step["how-did-you-do-it-tools-methods-or-skills"] || ""}\n` +
                    (step["what-was-the-outcome-of-this-step-optional"] ? 
                    `Outcome: ${step["what-was-the-outcome-of-this-step-optional"]}` : "");
            }).join("\n\n");
          }
          
          const result = pitchData.starExample2.result as StarSchema['result'];
          resultText = [
            result["what-positive-outcome-did-you-achieve"] || "",
            result["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] || "",
            result["what-did-you-learn-from-this-experience"] || ""
          ].filter(Boolean).join("\n");
          
        } else {
          // Simple structure
          situationText = typeof pitchData.starExample2.situation === 'string' 
            ? pitchData.starExample2.situation 
            : "";
          taskText = typeof pitchData.starExample2.task === 'string' 
            ? pitchData.starExample2.task 
            : "";
          actionText = typeof pitchData.starExample2.action === 'string' 
            ? pitchData.starExample2.action 
            : "";
          resultText = typeof pitchData.starExample2.result === 'string' 
            ? pitchData.starExample2.result 
            : "";
        }
      }
      
      // Add the structured example to our array
      starExamplesArray.push({
        id: "2",
        situation: situationText,
        task: taskText,
        action: actionText,
        result: resultText
      });
    }
    
    // Create the structured JSON object for star_components
    const structuredStarComponents = {
      starExamples: starExamplesArray
    };
    
    // Convert to JSON string for the API
    const starComponents = JSON.stringify(structuredStarComponents);

    // Build the agent request body
    const agentBody = {
      input_variables: {
        job_description: jobDescription,
        star_components: starComponents,
        Star_Word_Count: "300", // Hardcoded as specified
        User_Experience: pitchData.relevantExperience,
        Intro_Word_Count: "200", // Hardcoded as specified
        Conclusion_Word_Count: "200", // Hardcoded as specified
        ILS: "Isssdsd" // Hardcoded as specified
      },
      return_all_outputs: false
    };

    // API key - in production, use environment variable
    const apiKey = process.env.AGENT_API_KEY || 'pl_4c3ed9b8d7381ef88414569b8a3b2373';

    // Make the initial POST request to start the agent
    const options = {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(agentBody)
    };

    const response = await fetch('https://api.promptlayer.com/workflows/Master_Agent_V1/run', options);
    
    if (!response.ok) {
      throw new Error(`Agent API request failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    const executionId = result.workflow_version_execution_id;
    
    if (!executionId) {
      throw new Error('No execution ID returned from agent API');
    }

    // Wait 3 minutes as specified before getting results
    console.log(`Waiting for agent processing, execution ID: ${executionId}`);
    await setTimeout(180000); // 3 minutes (180 seconds)
    
    // Retrieve the results
    const getOptions = {
      method: 'GET', 
      headers: {'X-API-KEY': apiKey}
    };
    
    const getUrl = `https://api.promptlayer.com/workflow-version-execution-results?workflow_version_execution_id=${executionId}`;
    const getResponse = await fetch(getUrl, getOptions);
    
    if (!getResponse.ok) {
      throw new Error(`Agent results request failed with status: ${getResponse.status}`);
    }
    
    const getResult = await getResponse.json();
    
    // Log the complete response to understand its structure
    console.log("Agent API response:", JSON.stringify(getResult, null, 2));
    
    // Extract the generated pitch from the result - handle different possible structures
    let generatedPitch = "";
    
    // Handle the case where the entire response is a string (direct text response)
    if (typeof getResult === 'string') {
      generatedPitch = getResult;
    } 
    // Handle the case where the response is a JSON string that needs to be parsed
    else if (typeof getResult === 'string' && (getResult.startsWith('{') || getResult.startsWith('['))) {
      try {
        const parsedResult = JSON.parse(getResult);
        if (typeof parsedResult === 'string') {
          generatedPitch = parsedResult;
        } else if (parsedResult && typeof parsedResult === 'object') {
          generatedPitch = parsedResult.result || parsedResult.output || parsedResult.response || JSON.stringify(parsedResult);
        }
      } catch (e) {
        // If parsing fails, use the string directly
        generatedPitch = getResult;
      }
    }
    // Check various potential locations in the response structure if it's an object
    else if (getResult && typeof getResult === 'object') {
      if ('result' in getResult && getResult.result) {
        generatedPitch = String(getResult.result);
      } else if ('output' in getResult && getResult.output) {
        generatedPitch = String(getResult.output);
      } else if ('response' in getResult && getResult.response) {
        generatedPitch = String(getResult.response);
      } else if ('output_variables' in getResult && getResult.output_variables) {
        // If output is in an output_variables object
        const outputVars = getResult.output_variables;
        if (typeof outputVars === 'object' && outputVars !== null) {
          // Look for any property that might contain the output
          for (const key of Object.keys(outputVars)) {
            if (outputVars[key] && typeof outputVars[key] === 'string') {
              generatedPitch = outputVars[key];
              break;
            }
          }
        }
      } else if (Array.isArray(getResult) && getResult.length > 0) {
        // If the result is an array, try to get the first item
        const firstItem = getResult[0];
        if (typeof firstItem === 'string') {
          generatedPitch = firstItem;
        } else if (typeof firstItem === 'object' && firstItem !== null) {
          // Try common fields in the first object
          generatedPitch = String(
            firstItem.result || 
            firstItem.output || 
            firstItem.response || 
            firstItem.text || 
            firstItem.content || 
            JSON.stringify(firstItem)
          );
        }
      } else {
        // Last resort: stringify the entire result
        generatedPitch = JSON.stringify(getResult);
      }
    }
    
    console.log("Extracted pitch content:", generatedPitch ? "Content found" : "No content found");
    
    // Looks like we're getting the response as a direct string, so let's use it even if our detection thinks it's empty
    if (!generatedPitch && typeof getResult === 'string' && getResult.length > 100) {
      console.log("Using the raw response as pitch content");
      generatedPitch = getResult;
    }
    
    if (!generatedPitch) {
      throw new Error('No pitch content found in agent API response. Full response: ' + JSON.stringify(getResult));
    }
    
    return {
      isSuccess: true,
      message: "Pitch generated successfully by agent",
      data: generatedPitch
    };
    
  } catch (error) {
    console.error("Error generating pitch with agent:", error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && 
        (error.message.includes('timeout') || 
         error.message.includes('ETIMEDOUT') || 
         error.message.includes('FUNCTION_INVOCATION_TIMEOUT'))) {
      return {
        isSuccess: false,
        message: "The request took too long to process. Please try again or use a shorter description."
      };
    }
    
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to generate pitch with agent"
    };
  }
} 