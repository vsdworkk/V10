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

    // Hardcoded API key as specified in the documentation
    const apiKey = 'pl_4c3ed9b8d7381ef88414569b8a3b2373';

    // Calculate word counts dynamically based on the formulas
    const numStarExamples = starExamplesArray.length;
    const introWordCount = Math.round(pitchData.pitchWordLimit * 0.10);
    const conclusionWordCount = Math.round(pitchData.pitchWordLimit * 0.10);
    const starWordCount = Math.round((pitchData.pitchWordLimit * 0.80) / numStarExamples);

    // 1. Make POST request to run the agent
    const postOptions = {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input_variables: {
          job_description: jobDescription,
          star_components: starComponents,
          Star_Word_Count: starWordCount.toString(), // Dynamically calculated
          User_Experience: pitchData.relevantExperience,
          Intro_Word_Count: introWordCount.toString(), // Dynamically calculated
          Conclusion_Word_Count: conclusionWordCount.toString(), // Dynamically calculated
          ILS: "Isssdsd" // Hardcoded as specified
        },
        return_all_outputs: false
      })
    };

    // Add this line for debugging:
    console.log("Sending POST request to PromptLayer with options:", JSON.stringify(postOptions, null, 2));

    // Send the POST request to start the agent execution
    const postResponse = await fetch('https://api.promptlayer.com/workflows/Master_Agent_V1/run', postOptions);
    
    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      throw new Error(`Failed to start agent execution: ${errorText}`);
    }
    
    const postData = await postResponse.json();
    
    if (!postData.success) {
      throw new Error(postData.message || "Failed to start agent execution");
    }
    
    // Extract the workflow_version_execution_id from the response
    const executionId = postData.workflow_version_execution_id;
    
    if (!executionId) {
      throw new Error("No execution ID received from agent");
    }
    
    console.log(`Agent execution started with ID: ${executionId}`);
    
    // 2. Poll for results (with retry logic)
    let maxRetries = 30; // 30 retries with 5 second delay = up to 150 seconds of waiting
    let resultData = null;
    
    while (maxRetries > 0) {
      // Wait 5 seconds between checks
      await setTimeout(5000);
      
      // Make GET request to check for results
      const getOptions = {
        method: 'GET', 
        headers: {'X-API-KEY': apiKey}
      };
      
      try {
        const getResponse = await fetch(
          `https://api.promptlayer.com/workflow-version-execution-results?workflow_version_execution_id=${executionId}`, 
          getOptions
        );
        
        if (getResponse.ok) {
          const data = await getResponse.json();
          
          // Check if processing is complete and we have a result
          if (data && typeof data === 'string') {
            resultData = data;
            break;
          }
        }
      } catch (error) {
        console.log(`Polling attempt failed, retries left: ${maxRetries}`, error);
      }
      
      maxRetries--;
    }
    
    if (!resultData) {
      throw new Error("Timed out waiting for agent response. Please try again.");
    }
    
    // Return the agent-generated pitch
    return {
      isSuccess: true,
      message: "Pitch generated successfully via PromptLayer agent",
      data: resultData
    };
  } catch (error) {
    console.error("Error generating pitch with agent:", error);
    
    // Check for timeout errors
    if (error instanceof Error && 
        (error.message.includes('timeout') || 
         error.message.includes('Timed out'))) {
      return {
        isSuccess: false,
        message: "The agent took too long to process your request. Please try again or simplify your inputs."
      };
    }
    
    return {
      isSuccess: false,
      message: (error as Error).message || "Failed to generate pitch with agent"
    };
  }
} 