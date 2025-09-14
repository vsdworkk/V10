"use server"

/**
 * @description
 * Server action to trigger PromptLayer "Master_Agent_V1" to generate a pitch.
 * Returns a unique 6-digit ID (→ `agentExecutionId`) for tracking.
 */

import { ActionState } from "@/types"
import { StarSchema } from "@/db/schema/pitches-schema"
import { debugLog } from "@/lib/debug"

interface GenerateAgentPitchParams {
  roleName: string
  roleLevel: string
  pitchWordLimit: number
  relevantExperience: string
  roleDescription?: string
  starExamples: StarSchema[]
}

interface StarExampleOutput {
  id: string
  situation: string
  task: string
  action: string
  result: string
}

function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const PROMPTLAYER_API_KEY = getEnvVar("PROMPTLAYER_API_KEY")
const PROMPTLAYER_CALLBACK_URL = getEnvVar("PROMPTLAYER_CALLBACK_URL")
const PROMPTLAYER_API_URL = getEnvVar("PROMPTLAYER_API_URL")

export async function generateAgentPitchAction(
  pitchData: GenerateAgentPitchParams
): Promise<ActionState<string>> {
  try {
    const {
      roleName,
      roleLevel,
      pitchWordLimit,
      relevantExperience,
      roleDescription,
      starExamples
    } = pitchData

    const numExamples = starExamples.length
    if (numExamples < 2 || numExamples > 4) {
      return {
        isSuccess: false,
        message: `Agent requires 2–4 STAR examples (received ${numExamples}).`
      }
    }

    const jobDescription = [
      `Role: ${roleName}`,
      `Level: ${roleLevel}`,
      roleDescription && `Description: ${roleDescription}`
    ]
      .filter(Boolean)
      .join("\n")

    const starExamplesArray: StarExampleOutput[] = starExamples.map(
      (ex, idx) => ({
        id: String(idx + 1),
        situation: [
          ex.situation?.["where-and-when-did-this-experience-occur"],
          ex.situation?.[
            "briefly-describe-the-situation-or-challenge-you-faced"
          ]
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
          .map((step, i) => {
            const stepText = `Step ${i + 1}: ${step["what-did-you-specifically-do-in-this-step"]}`
            const outcome = step["what-was-the-outcome-of-this-step-optional"]
              ? `\nOutcome: ${step["what-was-the-outcome-of-this-step-optional"]}`
              : ""
            return stepText + outcome
          })
          .join("\n\n"),
        result:
          ex.result?.[
            "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"
          ] || ""
      })
    )

    const starComponents = JSON.stringify({ starExamples: starExamplesArray })
    debugLog("Formatted STAR components:", starComponents)

    const agentExecutionId = Math.floor(
      100000 + Math.random() * 900000
    ).toString()

    const workflowVersion =
      {
        2: "v1.2",
        3: "v1.3",
        4: "v1.4"
      }[numExamples] ?? "v1.2"

    /* Calculate word limits - only STAR examples increased by 13% to compensate for agent under-generation */
    const introWordCount = Math.round(pitchWordLimit * 0.1)
    const conclusionWordCount = Math.round(pitchWordLimit * 0.1)
    const baseStarWordCount = Math.round((pitchWordLimit * 0.8) / numExamples)
    const starWordCount = Math.round(baseStarWordCount * 1.13)

    const body = {
      workflow_label_name: workflowVersion,
      metadata: { callback_url: PROMPTLAYER_CALLBACK_URL },
      input_variables: {
        job_description: jobDescription,
        star_components: starComponents,
        Star_Word_Count: starWordCount.toString(),
        User_Experience: relevantExperience,
        Intro_Word_Count: introWordCount.toString(),
        Conclusion_Word_Count: conclusionWordCount.toString(),
        ILS: "Isssdsd", // Placeholder value
        id_unique: agentExecutionId
      },
      return_all_outputs: true
    }

    /* Make request to PromptLayer */
    const res = await fetch(
      `${PROMPTLAYER_API_URL}/workflows/Master_Agent_V1/run`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": PROMPTLAYER_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    )

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`PromptLayer error ${res.status}: ${errorText}`)
    }

    const result = await res.json()

    if (!result.success) {
      throw new Error(result.message || "PromptLayer returned a failure.")
    }

    /* Return success response */
    return {
      isSuccess: true,
      message: `Agent (version ${workflowVersion}) launched successfully.`,
      data: agentExecutionId
    }
  } catch (err: any) {
    console.error("generateAgentPitchAction error:", err)
    return {
      isSuccess: false,
      message: err.message || "Unknown error while contacting PromptLayer"
    }
  }
}
