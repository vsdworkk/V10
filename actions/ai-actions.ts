/**
 * @description
 * Exports server actions related to AI-driven pitch generation using GPT-4o.
 * The primary action here is generatePitchAction, which takes user-provided
 * pitch details (role info, experience, STAR examples, etc.) and produces
 * either a final pitch or a guidance analysis depending on the mode.
 *
 * Key Features:
 * - Compose a prompt with role information, years of experience, relevant
 *   experience text, and any STAR examples.
 * - Sends the prompt to GPT-4o (in the future) via the GPT_4O_API_KEY.
 * - Returns either a placeholder pitch or a placeholder guidance block.
 *
 * @dependencies
 * - "ActionState" from "@/types/server-action-types" for uniform success/fail structure.
 * - Environment variable "GPT_4O_API_KEY" (optional usage if real GPT-4o integration is available).
 *
 * @notes
 * In production, you'd have distinct prompts for "guidance" and "pitch."
 * You can add more fields or refine prompts as needed.
 */

"use server"
import { ActionState } from "@/types"
import OpenAI from "openai"

/**
 * @interface GeneratePitchParams
 * @description Defines the structure of user-provided data necessary to generate
 * an APS pitch or AI guidance.
 */
export interface GeneratePitchParams {
  roleName: string
  roleLevel: string
  pitchWordLimit: number
  roleDescription?: string
  yearsExperience: string
  relevantExperience: string
  starExample1?: {
    situation: string
    task: string
    action: string
    result: string
  }
  starExample2?: {
    situation: string
    task: string
    action: string
    result: string
  }
  /**
   * @description
   * Optional parameter indicating the mode of generation:
   * "guidance" => Albert suggestions on relevant experiences, etc.
   * "pitch" => Final pitch generation (default).
   */
  mode?: "guidance" | "pitch"
}

/**
 * @function generatePitchAction
 * @description
 * Server action to generate either:
 * 1) A final pitch using GPT-4o (mode = 'pitch'), or
 * 2) Guidance/suggestions (mode = 'guidance').
 *
 * @param {GeneratePitchParams} pitchData - The user-defined pitch/guidance data
 * @returns {Promise<ActionState<string>>} - The AI-generated text or an error state
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
      apiKey: apiKey
    })

    const mode = pitchData.mode || "pitch"
    
    // Build the appropriate prompt based on the mode
    let prompt = ""
    if (mode === "guidance") {
      prompt = buildGuidancePrompt(pitchData)
    } else {
      prompt = buildPitchPrompt(pitchData)
    }

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use GPT-4o model
      messages: [
        {
          role: "system",
          content: mode === "guidance" 
            ? "You are Albert, an AI assistant specializing in providing guidance for job applications. You help users craft effective STAR examples for their pitch."
            : "You are Albert, an AI assistant specializing in crafting job application pitches. You help users create compelling pitches based on their experience."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const aiResponse = response.choices[0]?.message?.content || ""
    
    if (!aiResponse) {
      throw new Error("Failed to generate response from OpenAI")
    }

    return {
      isSuccess: true,
      message: mode === "guidance" ? "Guidance generated successfully" : "Pitch generated successfully",
      data: aiResponse.trim()
    }
  } catch (error) {
    console.error("Error generating pitch or guidance:", error)
    return {
      isSuccess: false,
      message: (error as Error).message || "Failed to generate pitch/guidance"
    }
  }
}

/**
 * Helper function to build the guidance prompt
 */
function buildGuidancePrompt(pitchData: GeneratePitchParams): string {
  return `
I'm applying for a "${pitchData.roleName}" position at level "${pitchData.roleLevel}".
I have ${pitchData.yearsExperience} years of experience.

Here's a brief summary of my relevant experience:
${pitchData.relevantExperience}

${pitchData.roleDescription ? `The role description is: ${pitchData.roleDescription}` : ''}

Word limit for my pitch: ${pitchData.pitchWordLimit}

Please provide me with guidance on:
1. How to select the most relevant experiences for my STAR examples
2. What specific skills or achievements I should highlight for this role
3. How to structure my examples to be most effective
4. Any tips specific to the Australian Public Service (APS) application process for this level
`
}

/**
 * Helper function to build the pitch prompt
 */
function buildPitchPrompt(pitchData: GeneratePitchParams): string {
  let prompt = `
Please generate a professional pitch for a "${pitchData.roleName}" position at level "${pitchData.roleLevel}" in the Australian Public Service.
I have ${pitchData.yearsExperience} years of experience.

Here's a brief summary of my relevant experience:
${pitchData.relevantExperience}

${pitchData.roleDescription ? `The role description is: ${pitchData.roleDescription}` : ''}

The pitch should be under ${pitchData.pitchWordLimit} words.
`

  if (pitchData.starExample1) {
    prompt += `
Here's my first STAR example:
Situation: ${pitchData.starExample1.situation}
Task: ${pitchData.starExample1.task}
Action: ${pitchData.starExample1.action}
Result: ${pitchData.starExample1.result}
`
  }

  if (pitchData.starExample2) {
    prompt += `
Here's my second STAR example:
Situation: ${pitchData.starExample2.situation}
Task: ${pitchData.starExample2.task}
Action: ${pitchData.starExample2.action}
Result: ${pitchData.starExample2.result}
`
  }

  prompt += `
Please structure the pitch to highlight my skills and experiences most relevant to this role.
Focus on demonstrating how my experience makes me a strong candidate for this position.
`

  return prompt
}