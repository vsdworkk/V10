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
import { StarSchema, ActionStep } from "@/db/schema/pitches-schema"

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
      apiKey: apiKey,
      timeout: 60000, // 60 second timeout
      maxRetries: 2 // Limit retries to avoid long waits
    })

    const mode = pitchData.mode || "pitch"
    
    // Build the appropriate prompt based on the mode
    let prompt = ""
    if (mode === "guidance") {
      prompt = buildGuidancePrompt(pitchData)
    } else {
      prompt = buildPitchPrompt(pitchData)
    }

    // For guidance mode, use a faster model with fewer tokens
    const model = mode === "guidance" ? "gpt-3.5-turbo" : "gpt-4o"
    const maxTokens = mode === "guidance" ? 500 : 1000

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: mode === "guidance" 
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

    // For guidance mode, only return the content within scenario_output tags
    let processedResponse = aiResponse.trim()
    if (mode === "guidance") {
      processedResponse = extractScenarioOutput(aiResponse)
    }
    
    return {
      isSuccess: true,
      message: mode === "guidance" ? "Guidance generated successfully" : "Pitch generated successfully",
      data: processedResponse
    }
  } catch (error) {
    console.error("Error generating pitch or guidance:", error)
    
    // Check if it's a timeout error
    if (error instanceof Error && 
        (error.message.includes('timeout') || 
         error.message.includes('ETIMEDOUT') || 
         error.message.includes('FUNCTION_INVOCATION_TIMEOUT'))) {
      return {
        isSuccess: false,
        message: "The request took too long to process. Please try again or use a shorter description."
      }
    }
    
    return {
      isSuccess: false,
      message: (error as Error).message || "Failed to generate pitch/guidance"
    }
  }
}

/**
 * Helper function to extract only the content within scenario_output tags
 */
function extractScenarioOutput(response: string): string {
  // Extract content between a single set of scenario_output tags
  const scenarioMatch = response.match(/<scenario_output>([\s\S]*?)<\/scenario_output>/);
  
  if (scenarioMatch && scenarioMatch[1]) {
    return scenarioMatch[1].trim();
  }
  
  // If no match found or format is incorrect, return original response
  return response.trim();
}

/**
 * Helper function to build the guidance prompt
 */
function buildGuidancePrompt(pitchData: GeneratePitchParams): string {
  // Extract job requirements from role info
  const jobRequirements = `
Role: ${pitchData.roleName}
Level: ${pitchData.roleLevel}
${pitchData.roleDescription ? `Description: ${pitchData.roleDescription}` : ''}
  `.trim();

  // Use candidate experience
  const candidateExperience = pitchData.relevantExperience;

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
Begin your response with this exact text including the tags:
<analysis_output>
Before formulating your response, analyse the job requirements and candidate experience:
Evaluate and rank the experiences based on their relevance and impact, choosing the three most powerful examples.
</analysis_output>
Then surround all scenarios with these exact tags:
<scenario_output>
Scenario [number]: [Achievement/Project from Resume]
This experience from [company/role] demonstrates your ability to [brief explanation of relevance].
Elements to Cover:
- [Competency 1]
- [Competency 2]
- [Competency 3]
Repeat this for Scenario 1,2,3
</scenario_output>
Use simple, supportive, and conversational language within the scenarios, as if you were a friendly mentor offering guidance. Keep explanations brief and present the skills/competencies as short, clear bullet points.
REMINDER: You MUST include the <analysis_output> and <scenario_output> tags literally in your response.
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
    // Check if we're using the new nested structure
    if (typeof pitchData.starExample1 === 'object' && 
        'situation' in pitchData.starExample1 && 
        typeof pitchData.starExample1.situation === 'object') {
      
      // Extract situation data from nested structure with type assertion
      const situation = pitchData.starExample1.situation as StarSchema['situation'];
      const situationText = [
        situation["where-and-when-did-this-experience-occur"] || "",
        situation["briefly-describe-the-situation-or-challenge-you-faced"] || "",
        situation["why-was-this-a-problem-or-why-did-it-matter"] || ""
      ].filter(Boolean).join("\n");
      
      // Extract task data from nested structure with type assertion
      const task = pitchData.starExample1.task as StarSchema['task'];
      const taskText = [
        task["what-was-your-responsibility-in-addressing-this-issue"] || "",
        task["how-would-completing-this-task-help-solve-the-problem"] || "",
        task["what-constraints-or-requirements-did-you-need-to-consider"] || ""
      ].filter(Boolean).join("\n");
      
      // Extract action data from nested structure
      const action = pitchData.starExample1.action;
      let actionText = "";
      if (action && typeof action === 'object' && 'steps' in action && Array.isArray(action.steps)) {
        actionText = action.steps.map((step: ActionStep, index: number) => {
          return `Step ${index + 1}: ${step["what-did-you-specifically-do-in-this-step"] || ""}\n` +
                 `How: ${step["how-did-you-do-it-tools-methods-or-skills"] || ""}\n` +
                 (step["what-was-the-outcome-of-this-step-optional"] ? 
                  `Outcome: ${step["what-was-the-outcome-of-this-step-optional"]}` : "");
        }).join("\n\n");
      }
      
      // Extract result data from nested structure with type assertion
      const result = pitchData.starExample1.result as StarSchema['result'];
      const resultText = [
        result["what-positive-outcome-did-you-achieve"] || "",
        result["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] || "",
        result["what-did-you-learn-from-this-experience"] || ""
      ].filter(Boolean).join("\n");
      
      prompt += `
Here's my first STAR example:
Situation: ${situationText}
Task: ${taskText}
Action: ${actionText}
Result: ${resultText}
`;
    }
    // Legacy format support
    else if (typeof pitchData.starExample1 === 'object') {
      prompt += `
Here's my first STAR example:
Situation: ${pitchData.starExample1.situation || ""}
Task: ${pitchData.starExample1.task || ""}
Action: ${pitchData.starExample1.action || ""}
Result: ${pitchData.starExample1.result || ""}
`;
    }
  }

  if (pitchData.starExample2) {
    // Check if we're using the new nested structure
    if (typeof pitchData.starExample2 === 'object' && 
        'situation' in pitchData.starExample2 && 
        typeof pitchData.starExample2.situation === 'object') {
      
      // Extract situation data from nested structure with type assertion
      const situation = pitchData.starExample2.situation as StarSchema['situation'];
      const situationText = [
        situation["where-and-when-did-this-experience-occur"] || "",
        situation["briefly-describe-the-situation-or-challenge-you-faced"] || "",
        situation["why-was-this-a-problem-or-why-did-it-matter"] || ""
      ].filter(Boolean).join("\n");
      
      // Extract task data from nested structure with type assertion
      const task = pitchData.starExample2.task as StarSchema['task'];
      const taskText = [
        task["what-was-your-responsibility-in-addressing-this-issue"] || "",
        task["how-would-completing-this-task-help-solve-the-problem"] || "",
        task["what-constraints-or-requirements-did-you-need-to-consider"] || ""
      ].filter(Boolean).join("\n");
      
      // Extract action data from nested structure
      const action = pitchData.starExample2.action;
      let actionText = "";
      if (action && typeof action === 'object' && 'steps' in action && Array.isArray(action.steps)) {
        actionText = action.steps.map((step: ActionStep, index: number) => {
          return `Step ${index + 1}: ${step["what-did-you-specifically-do-in-this-step"] || ""}\n` +
                 `How: ${step["how-did-you-do-it-tools-methods-or-skills"] || ""}\n` +
                 (step["what-was-the-outcome-of-this-step-optional"] ? 
                  `Outcome: ${step["what-was-the-outcome-of-this-step-optional"]}` : "");
        }).join("\n\n");
      }
      
      // Extract result data from nested structure with type assertion
      const result = pitchData.starExample2.result as StarSchema['result'];
      const resultText = [
        result["what-positive-outcome-did-you-achieve"] || "",
        result["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] || "",
        result["what-did-you-learn-from-this-experience"] || ""
      ].filter(Boolean).join("\n");
      
      prompt += `
Here's my second STAR example:
Situation: ${situationText}
Task: ${taskText}
Action: ${actionText}
Result: ${resultText}
`;
    }
    // Legacy format support
    else if (typeof pitchData.starExample2 === 'object') {
      prompt += `
Here's my second STAR example:
Situation: ${pitchData.starExample2.situation || ""}
Task: ${pitchData.starExample2.task || ""}
Action: ${pitchData.starExample2.action || ""}
Result: ${pitchData.starExample2.result || ""}
`;
    }
  }

  prompt += `
Please structure the pitch to highlight my skills and experiences most relevant to this role.
Focus on demonstrating how my experience makes me a strong candidate for this position.
`

  return prompt
}