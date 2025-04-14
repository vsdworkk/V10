"use server"

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
 * - "AGENT_API_KEY" or similar environment variable, if needed.
 */

import { ActionState } from "@/types"
import { StarSchema } from "@/db/schema/pitches-schema"
import { setTimeout } from "timers/promises"

/**
 * @interface GenerateAgentPitchParams
 * Describes the input needed to generate a pitch via the external agent.
 * - starExamples: an array of STAR examples in the new dynamic format (StarSchema).
 */
export interface GenerateAgentPitchParams {
  roleName: string
  roleLevel: string
  pitchWordLimit: number
  yearsExperience: string
  relevantExperience: string
  roleDescription?: string
  starExamples: StarSchema[]  // Replaces starExample1 / starExample2
}

/**
 * Type used for building the final JSON structure each example passes to the agent.
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
 * Calls the external agent to generate a final pitch text using the new, dynamic array of STAR examples.
 *
 * @param {GenerateAgentPitchParams} pitchData - The user-provided pitch data
 * @returns {Promise<ActionState<string>>} - The agent-generated text or an error state
 */
export async function generateAgentPitchAction(
  pitchData: GenerateAgentPitchParams
): Promise<ActionState<string>> {
  try {
    // 1) Format the core job description from pitch data.
    const jobDescription = `
Role: ${pitchData.roleName}
Level: ${pitchData.roleLevel}
${pitchData.roleDescription ? `Description: ${pitchData.roleDescription}` : ""}
Years of Experience: ${pitchData.yearsExperience}
`.trim()

    // 2) Convert the starExamples array into a simpler output array for the agent.
    const starExamplesArray: StarExampleOutput[] = pitchData.starExamples.map((example, index) => {
      // Extract situation
      const s = example.situation
      const situationText = [
        s["where-and-when-did-this-experience-occur"] || "",
        s["briefly-describe-the-situation-or-challenge-you-faced"] || "",
        s["why-was-this-a-problem-or-why-did-it-matter"] || ""
      ]
        .filter(Boolean)
        .join("\n")

      // Extract task
      const t = example.task
      const taskText = [
        t["what-was-your-responsibility-in-addressing-this-issue"] || "",
        t["how-would-completing-this-task-help-solve-the-problem"] || "",
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

      // Extract result
      const r = example.result
      const resultText = [
        r["what-positive-outcome-did-you-achieve"] || "",
        r["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] || "",
        r["what-did-you-learn-from-this-experience"] || ""
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

    // 3) Build the star_components JSON for the agent
    const structuredStarComponents = {
      starExamples: starExamplesArray
    }
    const starComponents = JSON.stringify(structuredStarComponents)

    // Hardcoded or environment-based API key
    const apiKey = "pl_4c3ed9b8d7381ef88414569b8a3b2373"

    // 4) Dynamically allocate word counts for intro, conclusion, each STAR example
    const numExamples = starExamplesArray.length || 1
    const introWordCount = Math.round(pitchData.pitchWordLimit * 0.10)
    const conclusionWordCount = Math.round(pitchData.pitchWordLimit * 0.10)
    const starWordCount = Math.round((pitchData.pitchWordLimit * 0.80) / numExamples)

    // 5) POST request to start the agent
    const postBody = {
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
      const errorText = await postResponse.text()
      throw new Error(`Failed to start agent execution: ${errorText}`)
    }

    const postData = await postResponse.json()
    if (!postData.success) {
      throw new Error(postData.message || "Failed to start agent execution")
    }

    // 6) Poll for results
    const executionId = postData.workflow_version_execution_id
    if (!executionId) {
      throw new Error("No execution ID received from agent")
    }

    console.log(`Agent execution started with ID: ${executionId}`)

    let maxRetries = 30 // up to 30 retries (5-second intervals) = 150s total
    let resultData: string | null = null

    while (maxRetries > 0) {
      await setTimeout(5000) // Wait 5s

      const getOptions = {
        method: "GET",
        headers: { "X-API-KEY": apiKey }
      }

      try {
        const getResponse = await fetch(
          `https://api.promptlayer.com/workflow-version-execution-results?workflow_version_execution_id=${executionId}`,
          getOptions
        )

        if (getResponse.ok) {
          const data = await getResponse.json()
          // If the agent has returned a string result, consider it complete
          if (data && typeof data === "string") {
            resultData = data
            break
          }
        }
      } catch (error) {
        console.log(`Polling attempt failed (retries left: ${maxRetries})`, error)
      }

      maxRetries--
    }

    if (!resultData) {
      throw new Error("Timed out waiting for agent response. Please try again.")
    }

    // Return success with the agent's pitch text
    return {
      isSuccess: true,
      message: "Pitch generated successfully via agent",
      data: resultData
    }
  } catch (error: any) {
    console.error("Error generating pitch with agent:", error)

    // If it looks like a timeout
    if (typeof error.message === "string" && error.message.includes("timeout")) {
      return {
        isSuccess: false,
        message: "The agent took too long to process your request. Please try again or simplify your inputs."
      }
    }

    return {
      isSuccess: false,
      message: error.message || "Failed to generate pitch with agent"
    }
  }
}