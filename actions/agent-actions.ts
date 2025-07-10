"use server"

/**
 * Server actions that deal with the external PromptLayer "Master_Agent_V1".
 * The main export, `generateAgentPitchAction`, kicks‑off the workflow and
 * returns the *workflow_version_execution_id* so the caller can persist it
 * (→ `agentExecutionId`) and subscribe to realtime updates.
 */

import { ActionState } from "@/types"
import { StarSchema } from "@/types/pitches-types"
import { debugLog } from "@/lib/debug"

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface GenerateAgentPitchParams {
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

/* ------------------------------------------------------------------ */
/*  Main action                                                       */
/* ------------------------------------------------------------------ */

export async function generateAgentPitchAction(
  pitchData: GenerateAgentPitchParams
): Promise<ActionState<string>> {
  try {
    /* -------------------------------------------------------------- */
    /* 1. Validate STAR count                                         */
    /* -------------------------------------------------------------- */
    const numExamples = pitchData.starExamples.length
    if (numExamples < 2 || numExamples > 4) {
      return {
        isSuccess: false,
        message: `Agent currently supports 2 – 4 STAR examples (you sent ${numExamples}).`
      }
    }

    /* -------------------------------------------------------------- */
    /* 2. Build job‑description & STAR JSON                           */
    /* -------------------------------------------------------------- */
    const jobDescription = [
      `Role: ${pitchData.roleName}`,
      `Level: ${pitchData.roleLevel}`,
      pitchData.roleDescription ? `Description: ${pitchData.roleDescription}` : undefined
    ]
      .filter(Boolean)
      .join("\n")

    const starExamplesArray: StarExampleOutput[] = pitchData.starExamples.map(
      (ex, idx) => ({
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
            (s, i) =>
              `Step ${i + 1}: ${s["what-did-you-specifically-do-in-this-step"]}` +
              (s["what-was-the-outcome-of-this-step-optional"]
                ? `\nOutcome: ${s["what-was-the-outcome-of-this-step-optional"]}`
                : "")
          )
          .join("\n\n"),
        result:
          ex.result?.[
            "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"
          ] || ""
      })
    )

    const starComponents = JSON.stringify({ starExamples: starExamplesArray })
    debugLog("Formatted star components:", starComponents);

    /* -------------------------------------------------------------- */
    /* 2.5 Generate a unique 6‑digit identifier                        */
    /* -------------------------------------------------------------- */
    const idUnique = Math.floor(100000 + Math.random() * 900000).toString()

    /* -------------------------------------------------------------- */
    /* 3. Choose agent version                                        */
    /* -------------------------------------------------------------- */
    const getVersion = (n: number) =>
      ({ 2: "v1.2", 3: "v1.3", 4: "v1.4" } as const)[n] || "v1.2"

    const workflowLabelName = getVersion(numExamples)

    /* -------------------------------------------------------------- */
    /* 4. Prepare PromptLayer call                                    */
    /* -------------------------------------------------------------- */
    const apiKey = process.env.PROMPTLAYER_API_KEY
    if (!apiKey) {
      throw new Error("PROMPTLAYER_API_KEY not set in environment")
    }

    const callbackUrl =
      process.env.PROMPTLAYER_CALLBACK_URL ||
      "https://your‑domain.com/api/promptlayer-callback"

    const introWordCount = Math.round(pitchData.pitchWordLimit * 0.1)
    const conclusionWordCount = Math.round(pitchData.pitchWordLimit * 0.1)
    const starWordCount = Math.round(
      (pitchData.pitchWordLimit * 0.8) / numExamples
    )

    const body = {
      workflow_label_name: workflowLabelName,
      metadata: { callback_url: callbackUrl },
      input_variables: {
        job_description: jobDescription,
        star_components: starComponents,
        Star_Word_Count: starWordCount.toString(),
        User_Experience: pitchData.relevantExperience,
        Intro_Word_Count: introWordCount.toString(),
        Conclusion_Word_Count: conclusionWordCount.toString(),
        ILS: "Isssdsd",
        id_unique: idUnique
      },
      return_all_outputs: true
    }

    const res = await fetch(
      "https://api.promptlayer.com/workflows/Master_Agent_V1/run",
      {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    )

    if (!res.ok) {
      throw new Error(
        `PromptLayer responded ${res.status}: ${await res.text()}`
      )
    }

    const { success, workflow_version_execution_id: _execId, message } =
      await res.json()

    // We ignore the PromptLayer execution‑id for now because the
    // agent does not reliably return it in the callback.  Instead, we rely on
    // our own 6‑digit identifier (`idUnique`) which we sent in the input
    // variables and expect back in the callback payload.

    if (!success) {
      throw new Error(message || "PromptLayer reported a failure.")
    }

    /* -------------------------------------------------------------- */
    /* 5. Return our custom identifier immediately                     */
    /* -------------------------------------------------------------- */
    return {
      isSuccess: true,
      message: `Agent version ${workflowLabelName} launched.`,
      data: idUnique  // caller should persist this to pitches.agentExecutionId
    }
  } catch (err: any) {
    console.error("generateAgentPitchAction error:", err)
    return {
      isSuccess: false,
      message: err.message || "Unknown error contacting PromptLayer"
    }
  }
}