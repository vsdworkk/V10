"use server"

/**
 * @description
 * Exports server actions related to agent-driven pitch generation.
 * The primary action here is generateAgentPitchAction, which calls an external
 * agent API to generate the final pitch based on user-provided pitch details.
 */

import { ActionState } from "@/types"
import { StarSchema } from "@/db/schema/pitches-schema"
import { setTimeout } from "timers/promises"

/**
 * @interface GenerateAgentPitchParams
 * Describes the input needed to generate a pitch via the external agent.
 */
export interface GenerateAgentPitchParams {
  roleName: string
  roleLevel: string
  pitchWordLimit: number
  relevantExperience: string
  roleDescription?: string
  /**
   * @description
   * An array of STAR examples (StarSchema), each containing 
   * situation, task, action, result. 
   */
  starExamples: StarSchema[]
}

/**
 * Type used to build the final JSON structure for each example passed to the agent.
 */
interface StarExampleOutput {
  id: string
  situation: string
  task: string
  action: string
  result: string
}

/**
 * @function generateAgentPitchAction
 * Calls the external agent to generate a final pitch text using the dynamic array of STAR examples.
 *
 * @param {GenerateAgentPitchParams} pitchData - The user-provided pitch data
 * @returns {Promise<ActionState<string>>} - The agent-generated text or an error state
 */
export async function generateAgentPitchAction(
  pitchData: GenerateAgentPitchParams
): Promise<ActionState<string>> {
  try {
    // Validate number of STAR examples
    const numExamples = pitchData.starExamples.length;
    if (numExamples < 2 || numExamples > 4) {
      return {
        isSuccess: false,
        message: `This system requires between 2 and 4 STAR examples (you provided ${numExamples})`
      };
    }

    // 1) Format the core job description from pitch data. 
    //    (Removed "yearsExperience".)
    const jobDescription = `
Role: ${pitchData.roleName}
Level: ${pitchData.roleLevel}
${pitchData.roleDescription ? `Description: ${pitchData.roleDescription}` : ""}
`.trim()

    // 2) Convert the starExamples array into a simpler output array for the agent.
    const starExamplesArray: StarExampleOutput[] = pitchData.starExamples.map((example, index) => {
      // Extract situation fields
      const s = example.situation || {}
      const situationText = [
        s["where-and-when-did-this-experience-occur"] || "",
        s["briefly-describe-the-situation-or-challenge-you-faced"] || ""
      ]
        .filter(Boolean)
        .join("\n")

      // Extract task fields
      const t = example.task || {}
      const taskText = [
        t["what-was-your-responsibility-in-addressing-this-issue"] || "",
        t["what-constraints-or-requirements-did-you-need-to-consider"] || ""
      ]
        .filter(Boolean)
        .join("\n")

      // Extract action steps
      let actionText = ""
      if (example.action && Array.isArray(example.action.steps)) {
        actionText = example.action.steps
          .map((step, i) => {
            return `Step ${i + 1}: ${step["what-did-you-specifically-do-in-this-step"] || ""}\n` +
                   `How: ${step["how-did-you-do-it-tools-methods-or-skills"] || ""}\n` +
                   (step["what-was-the-outcome-of-this-step-optional"] 
                     ? `Outcome: ${step["what-was-the-outcome-of-this-step-optional"]}`
                     : "")
          })
          .join("\n\n")
      }

      // Extract result fields
      const r = example.result || {}
      const resultText = [
        r["what-positive-outcome-did-you-achieve"] || "",
        r["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] || ""
      ]
        .filter(Boolean)
        .join("\n")

      return {
        id: String(index + 1), // Just label them 1, 2, 3, ...
        situation: situationText,
        task: taskText,
        action: actionText,
        result: resultText
      }
    })

    // 3) Build the JSON for the agent
    const structuredStarComponents = {
      starExamples: starExamplesArray
    }
    const starComponents = JSON.stringify(structuredStarComponents)

    // Hardcoded or environment-based API key
    const apiKey = "pl_4c3ed9b8d7381ef88414569b8a3b2373"

    // 4) Dynamically allocate word counts for intro, conclusion, each STAR example
    const introWordCount = Math.round(pitchData.pitchWordLimit * 0.10)
    const conclusionWordCount = Math.round(pitchData.pitchWordLimit * 0.10)
    const starWordCount = Math.round((pitchData.pitchWordLimit * 0.80) / numExamples)

    // 5) POST request to start the agent
    // Select the appropriate version based on the number of STAR examples
    // Version mapping:
    // - v1.2: Optimized for handling 2 STAR examples
    // - v1.3: Optimized for handling 3 STAR examples
    // - v1.4: Optimized for handling 4 STAR examples
    const getAgentVersionLabel = (exampleCount: number) => {
      switch (exampleCount) {
        case 2:
          return "v1.2"; // Version for 2 STAR examples
        case 3:
          return "v1.3"; // Version for 3 STAR examples 
        case 4:
          return "v1.4"; // Version for 4 STAR examples
        default:
          // Fallback to v1.2 if the count is unexpected
          console.log(`Unexpected STAR example count: ${exampleCount}, defaulting to version v1.2`);
          return "v1.2";
      }
    };

    const workflowLabelName = getAgentVersionLabel(numExamples);
    console.log(`Using Master_Agent_V1 version ${workflowLabelName} for ${numExamples} STAR examples`);

    // Build callback URL from env or fallback to public URL
    const callbackUrl = process.env.PROMPTLAYER_CALLBACK_URL || "https://your-domain.com/api/promptlayer-callback";

    const postBody = {
      workflow_label_name: workflowLabelName, // Specify which labeled version to use
      metadata: {
        callback_url: callbackUrl
      },
      input_variables: {
        job_description: jobDescription,
        star_components: starComponents,
        Star_Word_Count: starWordCount.toString(),
        User_Experience: pitchData.relevantExperience,
        Intro_Word_Count: introWordCount.toString(),
        Conclusion_Word_Count: conclusionWordCount.toString(),
        ILS: "Isssdsd" // Hardcoded per your specification
      },
      return_all_outputs: false
    }

    const postOptions = {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postBody)
    }

    console.log("Sending POST request to agent:", JSON.stringify(postOptions, null, 2))

    const postResponse = await fetch(
      "https://api.promptlayer.com/workflows/Master_Agent_V1/run",
      postOptions
    )

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      // Check if the error might be related to version selection
      if (errorText.includes("version") || errorText.includes("workflow_label_name") || errorText.includes("workflow_version_number")) {
        throw new Error(`Invalid agent version (${workflowLabelName}): ${errorText}`);
      }
      throw new Error(`Failed to start agent execution: ${errorText}`);
    }

    const postData = await postResponse.json()
    if (!postData.success) {
      throw new Error(postData.message || "Failed to start agent execution")
    }

    // 6) Capture execution ID and respond immediately
    const executionId = postData.workflow_version_execution_id;
    if (!executionId) {
      throw new Error("No execution ID received from agent");
    }

    console.log(`Agent execution started with ID: ${executionId}. Awaiting callback at ${callbackUrl}`);

    // Return success immediately; result will arrive asynchronously via callback
    return {
      isSuccess: true,
      message: `Agent execution started using version ${workflowLabelName}. Results will be delivered via callback.`,
      data: executionId // Consumer can track by execution ID if needed
    }
  } catch (error: any) {
    console.error("Error generating pitch with agent:", error)

    if (error.message?.includes("timeout")) {
      return {
        isSuccess: false,
        message:
          "The agent took too long to process your request. Please try again or simplify your inputs."
      }
    }

    return {
      isSuccess: false,
      message: error.message || "Failed to generate pitch with agent"
    }
  }
}