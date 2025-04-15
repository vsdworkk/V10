/**
 * @description
 * Exports server actions related to AI-driven pitch generation using GPT-4o.
 */
"use server"
import { ActionState } from "@/types"
import OpenAI from "openai"
import { StarSchema, ActionStep } from "@/db/schema/pitches-schema"

export interface GeneratePitchParams {
  roleName: string
  roleLevel: string
  pitchWordLimit: number
  roleDescription?: string

  // Removed yearsExperience
  relevantExperience: string

  // Optionally, these two if using older starExample approach
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

  /**
   * @description
   * "guidance" => Albert suggestions
   * "pitch" => final pitch
   */
  mode?: "guidance" | "pitch"
}

/**
 * @function generatePitchAction
 * Accepts data for either "guidance" or "pitch"
 */
export async function generatePitchAction(
  pitchData: GeneratePitchParams
): Promise<ActionState<string>> {
  try {
    const apiKey = process.env.GPT_4O_API_KEY || process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      throw new Error("Missing OpenAI API key in environment variables.")
    }

    const openai = new OpenAI({
      apiKey,
      timeout: 60000,
      maxRetries: 2
    })

    const mode = pitchData.mode || "pitch"

    // Build the appropriate prompt
    const prompt = mode === "guidance"
      ? buildGuidancePrompt(pitchData)
      : buildPitchPrompt(pitchData)

    // Select model & max tokens
    const model = mode === "guidance" ? "gpt-3.5-turbo" : "gpt-4o"
    const maxTokens = mode === "guidance" ? 500 : 1000

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            mode === "guidance"
              ? "You are an expert recruitment advisor tasked with helping job candidates identify the most impactful experiences from their resume that align with specific job requirements."
              : "You are Albert, an AI assistant specializing in crafting job application pitches. You help users create compelling pitches based on their experience."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: maxTokens
    })

    const aiResponse = response.choices[0]?.message?.content || ""
    if (!aiResponse) {
      throw new Error("Failed to generate response from OpenAI")
    }

    // For guidance mode, strip content inside <scenario_output> if needed
    let processedResponse = aiResponse.trim()
    if (mode === "guidance") {
      processedResponse = extractScenarioOutput(aiResponse)
    }

    return {
      isSuccess: true,
      message: mode === "guidance"
        ? "Guidance generated successfully"
        : "Pitch generated successfully",
      data: processedResponse
    }
  } catch (error) {
    console.error("Error generating pitch or guidance:", error)

    if (
      error instanceof Error &&
      (error.message.includes("timeout") ||
        error.message.includes("ETIMEDOUT") ||
        error.message.includes("FUNCTION_INVOCATION_TIMEOUT"))
    ) {
      return {
        isSuccess: false,
        message:
          "The request took too long to process. Please try again or use a shorter description."
      }
    }

    return {
      isSuccess: false,
      message: (error as Error).message || "Failed to generate pitch/guidance"
    }
  }
}

/**
 * Helper function to extract only the content within <scenario_output> tags
 */
function extractScenarioOutput(response: string): string {
  const scenarioMatch = response.match(/<scenario_output>([\s\S]*?)<\/scenario_output>/)
  if (scenarioMatch && scenarioMatch[1]) {
    return scenarioMatch[1].trim()
  }
  return response.trim()
}

/**
 * Helper function to build the "guidance" prompt
 */
function buildGuidancePrompt(pitchData: GeneratePitchParams): string {
  const jobRequirements = `
Role: ${pitchData.roleName}
Level: ${pitchData.roleLevel}
${pitchData.roleDescription ? `Description: ${pitchData.roleDescription}` : ""}
  `.trim()

  const candidateExperience = pitchData.relevantExperience

  return `
Your goal is to select and recommend three experiences that would make strong STAR (Situation, Task, Action, Result) examples for the candidate to use in their job application or interview.

First, review the following job requirements:
<job_requirements>
${jobRequirements}
</job_requirements>

Now, review the candidate's experience:
<candidate_experience>
${candidateExperience}
</candidate_experience>

IMPORTANT: In your response, you MUST include the XML tags exactly as shown below. Do not modify or omit these tags.

Begin your response with:
<analysis_output>
Explain your rationale here...
</analysis_output>

Then use:
<scenario_output>
Scenario [number]: ...
</scenario_output>

Repeat for at least 3 scenarios, focusing on relevant achievements.
`
}

/**
 * Helper function to build the "pitch" prompt
 * Removed references to yearsExperience and the old STAR subfields:
 * - "why-was-this-a-problem-or-why-did-it-matter"
 * - "how-would-completing-this-task-help-solve-the-problem"
 * - "what-did-you-learn-from-this-experience"
 */
function buildPitchPrompt(pitchData: GeneratePitchParams): string {
  let prompt = `
Please generate a professional pitch for a "${pitchData.roleName}" position at level "${pitchData.roleLevel}" in the Australian Public Service.

Here's a brief summary of my relevant experience:
${pitchData.relevantExperience}

${pitchData.roleDescription ? `The role description is: ${pitchData.roleDescription}` : ""}

The pitch should be under ${pitchData.pitchWordLimit} words.
`.trim()

  // Optionally include starExample1, starExample2 in a legacy format
  if (pitchData.starExample1) {
    // If new nested structure
    if (
      typeof pitchData.starExample1 === "object" &&
      "situation" in pitchData.starExample1 &&
      pitchData.starExample1.situation &&
      typeof pitchData.starExample1.situation === "object"
    ) {
      const situation = pitchData.starExample1.situation
      const task = pitchData.starExample1.task
      const action = pitchData.starExample1.action
      const result = pitchData.starExample1.result

      // Build text from the minimal fields now
      const situationText = [
        situation["where-and-when-did-this-experience-occur"] || "",
        situation["briefly-describe-the-situation-or-challenge-you-faced"] || ""
      ]
        .filter(Boolean)
        .join("\n")

      const taskText = [
        typeof task === 'object' && task ? 
          task["what-was-your-responsibility-in-addressing-this-issue"] || "" : "",
        typeof task === 'object' && task ? 
          task["what-constraints-or-requirements-did-you-need-to-consider"] || "" : ""
      ]
        .filter(Boolean)
        .join("\n")

      let actionText = ""
      if (action && typeof action === 'object' && 'steps' in action && Array.isArray(action.steps)) {
        actionText = action.steps
          .map((step: ActionStep, index: number) => {
            return `Step ${index + 1}: ${
              step["what-did-you-specifically-do-in-this-step"] || ""
            }\nHow: ${step["how-did-you-do-it-tools-methods-or-skills"] || ""}${
              step["what-was-the-outcome-of-this-step-optional"]
                ? `\nOutcome: ${step["what-was-the-outcome-of-this-step-optional"]}`
                : ""
            }`
          })
          .join("\n\n")
      }

      const resultText = [
        typeof result === 'object' && result ? 
          result["what-positive-outcome-did-you-achieve"] || "" : "",
        typeof result === 'object' && result ? 
          result["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] || "" : ""
      ]
        .filter(Boolean)
        .join("\n")

      prompt += `
Here's my first STAR example:
Situation: ${situationText}
Task: ${taskText}
Action: ${actionText}
Result: ${resultText}
`
    } else {
      // Legacy fallback if starExample1 is a flat object
      prompt += `
Here's my first STAR example:
Situation: ${pitchData.starExample1.situation || ""}
Task: ${pitchData.starExample1.task || ""}
Action: ${pitchData.starExample1.action || ""}
Result: ${pitchData.starExample1.result || ""}
`
    }
  }

  if (pitchData.starExample2) {
    // If new nested structure
    if (
      typeof pitchData.starExample2 === "object" &&
      "situation" in pitchData.starExample2 &&
      pitchData.starExample2.situation &&
      typeof pitchData.starExample2.situation === "object"
    ) {
      const situation = pitchData.starExample2.situation
      const task = pitchData.starExample2.task
      const action = pitchData.starExample2.action
      const result = pitchData.starExample2.result

      const situationText = [
        situation["where-and-when-did-this-experience-occur"] || "",
        situation["briefly-describe-the-situation-or-challenge-you-faced"] || ""
      ]
        .filter(Boolean)
        .join("\n")

      const taskText = [
        typeof task === 'object' && task ? 
          task["what-was-your-responsibility-in-addressing-this-issue"] || "" : "",
        typeof task === 'object' && task ? 
          task["what-constraints-or-requirements-did-you-need-to-consider"] || "" : ""
      ]
        .filter(Boolean)
        .join("\n")

      let actionText = ""
      if (action && typeof action === 'object' && 'steps' in action && Array.isArray(action.steps)) {
        actionText = action.steps
          .map((step: ActionStep, index: number) => {
            return `Step ${index + 1}: ${
              step["what-did-you-specifically-do-in-this-step"] || ""
            }\nHow: ${step["how-did-you-do-it-tools-methods-or-skills"] || ""}${
              step["what-was-the-outcome-of-this-step-optional"]
                ? `\nOutcome: ${step["what-was-the-outcome-of-this-step-optional"]}`
                : ""
            }`
          })
          .join("\n\n")
      }

      const resultText = [
        typeof result === 'object' && result ? 
          result["what-positive-outcome-did-you-achieve"] || "" : "",
        typeof result === 'object' && result ? 
          result["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] || "" : ""
      ]
        .filter(Boolean)
        .join("\n")

      prompt += `
Here's my second STAR example:
Situation: ${situationText}
Task: ${taskText}
Action: ${actionText}
Result: ${resultText}
`
    } else {
      // Legacy fallback
      prompt += `
Here's my second STAR example:
Situation: ${pitchData.starExample2.situation || ""}
Task: ${pitchData.starExample2.task || ""}
Action: ${pitchData.starExample2.action || ""}
Result: ${pitchData.starExample2.result || ""}
`
    }
  }

  prompt += `
Please structure the pitch to highlight my skills and experiences most relevant to this role.
Focus on demonstrating how my experience makes me a strong candidate for this position.
`
  return prompt
}