import { UseFormReturn } from "react-hook-form"
import { PitchWizardFormData } from "./schema"
import { createPitchPayload } from "./helpers"
import { debugLog } from "@/lib/debug"

type ToastFunction = (props: {
  title: string
  description: string
  variant?: "default" | "destructive"
}) => void

async function postToAPI<T>(
  endpoint: string,
  payload: any,
  errorMessage: string
): Promise<T> {
  debugLog(`[API] Sending request to ${endpoint}`, payload)

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  const responseText = await res.text()

  if (!res.ok) {
    console.error(`[API] ${endpoint} failed:`, responseText)
    throw new Error(errorMessage)
  }

  const json = JSON.parse(responseText)
  debugLog(`[API] Response from ${endpoint}`, json)
  return json
}

/**
 * Persists user's partial draft (create/update).
 */
export async function savePitchData(
  data: PitchWizardFormData,
  pitchId: string | undefined,
  setPitchId: (id: string) => void,
  toast: ToastFunction,
  currentStep = 1
) {
  const payload = createPitchPayload(data, pitchId, currentStep)

  debugLog(`[savePitchData] Saving step ${currentStep}`, {
    pitchId,
    payloadKeys: Object.keys(payload),
    hasStarExamples: !!payload.starExamples?.length
  })

  try {
    const json = await postToAPI<{ data?: { id: string }; message?: string }>(
      "/api/pitches",
      payload,
      "Failed to save pitch data."
    )

    if (json.data?.id) {
      setPitchId(json.data.id)
    }

    toast({
      title: "Draft Saved",
      description: "Your pitch draft has been saved."
    })

    return json.data
  } catch (err: any) {
    toast({
      title: "Error",
      description: err.message || "Failed to save draft",
      variant: "destructive"
    })
    throw err
  }
}

/**
 * Final pitch generation.
 */
export async function triggerFinalPitch(
  data: PitchWizardFormData,
  pitchId: string | undefined,
  methods: UseFormReturn<PitchWizardFormData>,
  setPitchId: (id: string) => void,
  toast: ToastFunction,
  setIsPitchLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setFinalPitchError: React.Dispatch<React.SetStateAction<string | null>>,
  currentStep: number
) {
  const generationPayload = {
    userId: data.userId,
    pitchId,
    roleName: data.roleName,
    organisationName: data.organisationName,
    roleLevel: data.roleLevel,
    pitchWordLimit: data.pitchWordLimit,
    roleDescription: data.roleDescription || "",
    relevantExperience: data.relevantExperience,
    albertGuidance: data.albertGuidance || "",
    starExamples: data.starExamples,
    starExamplesCount: parseInt(data.starExamplesCount, 10)
  }

  try {
    const result = await postToAPI<{
      success: boolean
      requestId: string
      error?: string
    }>(
      "/api/pitches/generate",
      generationPayload,
      "Failed to generate final pitch"
    )

    if (!result.success) {
      throw new Error(result.error || "Pitch generation failed")
    }

    methods.setValue("agentExecutionId", result.requestId, {
      shouldDirty: true
    })
    methods.setValue("pitchContent", "", { shouldDirty: true })

    await savePitchData(
      methods.getValues(),
      pitchId,
      setPitchId,
      toast,
      currentStep
    )

    return result.requestId
  } catch (err: any) {
    setFinalPitchError(err.message || "An error occurred generating your pitch")
    toast({
      title: "Error",
      description: err.message || "Failed to generate pitch",
      variant: "destructive"
    })
    setIsPitchLoading(false)
    throw err
  }
}

/**
 * Submit final pitch to DB
 */
export async function submitFinalPitch(
  data: PitchWizardFormData,
  pitchId: string | undefined,
  setPitchId: (id: string) => void,
  toast: ToastFunction,
  router: any
) {
  const payload = createPitchPayload(data, pitchId, 999, "final")

  try {
    await postToAPI("/api/pitches", payload, "Failed to submit final pitch.")

    if (typeof window !== "undefined") {
      localStorage.removeItem("currentPitchId")
    }

    toast({
      title: "Success",
      description: "Your pitch has been finalized."
    })

    router.push("/dashboard")
    return true
  } catch (err: any) {
    toast({
      title: "Error",
      description: err.message || "Failed to submit pitch",
      variant: "destructive"
    })
    throw err
  }
}
