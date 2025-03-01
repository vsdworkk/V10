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
 *
 * @notes
 * Currently stubs the GPT-4o call by returning different placeholder content
 * depending on mode. In a real scenario, you would call your GPT-4o endpoint
 * with a structured prompt. Validate pitchData before using it in the actual GPT prompt.
 */
export async function generatePitchAction(
  pitchData: GeneratePitchParams
): Promise<ActionState<string>> {
  try {
    // You would do something like:
    // const apiKey = process.env.GPT_4O_API_KEY
    // if (!apiKey) {
    //   throw new Error("Missing GPT_4O_API_KEY environment variable.")
    // }
    // Then call GPT-4o via fetch or a client library

    const mode = pitchData.mode || "pitch"

    // For demonstration, return a different placeholder text depending on the mode:
    if (mode === "guidance") {
      const guidanceText = `
Albert Guidance Analysis (Placeholder):
Based on your role: "${pitchData.roleName}" at level "${pitchData.roleLevel}",
and your experience: "${pitchData.relevantExperience.slice(0, 80)}...", here
are suggestions for picking relevant experiences for the STAR method:

1) Highlight major achievements from your experience that align with the
   responsibilities of "${pitchData.roleName}".
2) Show how your actions led to a result that demonstrates key APS
   capabilities (e.g., communication, stakeholder management).
3) If you have a second STAR example, focus on a different skill set or
   scenario to show breadth of experience.

(End of placeholder guidance.)
`
      return {
        isSuccess: true,
        message: "Guidance generated successfully",
        data: guidanceText.trim()
      }
    } else {
      // Normal "pitch" mode (default)
      const placeholderPitch = `
Thank you for using the AI-Powered APS Pitch Builder!
This is a placeholder pitch that would normally be generated
by GPT-4o based on your role and STAR examples.

Role: ${pitchData.roleName}, Level: ${pitchData.roleLevel}
Word Limit: ${pitchData.pitchWordLimit}
Years of Experience: ${pitchData.yearsExperience}
Relevant Experience: ${pitchData.relevantExperience.slice(0, 80)}...

[Placeholder generated pitch content...]
`
      return {
        isSuccess: true,
        message: "Pitch generated successfully",
        data: placeholderPitch.trim()
      }
    }
  } catch (error) {
    console.error("Error generating pitch or guidance:", error)
    return {
      isSuccess: false,
      message: (error as Error).message || "Failed to generate pitch/guidance"
    }
  }
}