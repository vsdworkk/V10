import { UseFormReturn } from "react-hook-form"
import { PitchWizardFormData } from "./schema"
import { createPitchPayload } from "./helpers"
import { debugLog } from "@/lib/debug"

type ToastFunction = (props: {
  title: string
  description: string
  variant?: "default" | "destructive"
}) => void

/**
 * Persists user's partial draft (create/update).
 */
export async function savePitchData(
  data: PitchWizardFormData,
  pitchId: string | undefined,
  setPitchId: (id: string) => void,
  toast: ToastFunction,
  currentStep: number = 1
) {
  const payload = createPitchPayload(data, pitchId, currentStep)
  debugLog(`[savePitchData] Starting save for step ${currentStep}`)
  debugLog(`[savePitchData] Saving pitch data for step ${currentStep}`, {
    pitchId,
    payloadKeys: Object.keys(payload),
    hasStarExamples: !!payload.starExamples?.length
  })
  debugLog("[savePitchData] Payload being sent:", payload)

  try {
    debugLog(`[savePitchData] Sending request to /api/pitches`)
    const res = await fetch("/api/pitches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    debugLog(`[savePitchData] Response status: ${res.status} ${res.statusText}`)
    if (!res.ok) {
      const errorText = await res.text()
      console.error(
        `[savePitchData] Response not OK. Status: ${res.status}. Body:`,
        errorText
      )
      throw new Error("Failed to save pitch data.")
    }

    const json = await res.json()
    debugLog("[savePitchData] Full API Response JSON:", json)
    debugLog(`[savePitchData] Response data (parsed):`, {
      success: !!json.data,
      id: json.data?.id,
      message: json.message
    })

    debugLog(`[savePitchData] Step ${currentStep} saved successfully`)

    if (json.data?.id) {
      debugLog(`[savePitchData] Setting pitch ID: ${json.data.id}`)
      setPitchId(json.data.id)
    }

    toast({
      title: "Draft Saved",
      description: "Your pitch draft has been saved."
    })

    return json.data
  } catch (err: any) {
    console.error("[savePitchData] Error:", err)
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
  try {
    const res = await fetch("/api/pitches/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(errText || "Failed to generate final pitch")
    }

    const result = await res.json()
    if (!result.success) {
      throw new Error(result.error || "Failed to generate final pitch")
    }

    // got an agentExecutionId (pitch ID)
    methods.setValue("agentExecutionId", result.requestId, {
      shouldDirty: true
    })
    methods.setValue("pitchContent", "", { shouldDirty: true })

    // We want to save the current step when triggering the final pitch
    await savePitchData(
      methods.getValues(),
      pitchId,
      setPitchId,
      toast,
      currentStep
    )

    return result.requestId
  } catch (err: any) {
    console.error("triggerFinalPitch error:", err)
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
    const res = await fetch("/api/pitches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      throw new Error("Failed to submit final pitch.")
    }

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
    console.error("submitFinalPitch error:", err)
    toast({
      title: "Error",
      description: err.message || "Failed to submit pitch",
      variant: "destructive"
    })
    throw err
  }
}
