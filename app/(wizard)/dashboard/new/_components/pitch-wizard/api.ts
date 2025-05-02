import { UseFormReturn } from "react-hook-form"
import { PitchWizardFormData } from "./schema"
import { createPitchPayload } from "./helpers"

type ToastFunction = (props: {
  title: string;
  description: string;
  variant?: "default" | "destructive";
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

  try {
    const res = await fetch("/api/pitchWizard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    
    if (!res.ok) {
      throw new Error("Failed to save pitch data.")
    }
    
    const json = await res.json()
    if (json.data?.id) {
      setPitchId(json.data.id)
    }
    
    toast({ 
      title: "Draft Saved", 
      description: "Your pitch draft has been saved." 
    })
    
    return json.data
  } catch (err: any) {
    console.error("savePitchData error:", err)
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
    const res = await fetch("/api/finalPitch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roleName: data.roleName,
        roleLevel: data.roleLevel,
        pitchWordLimit: data.pitchWordLimit,
        roleDescription: data.roleDescription || "",
        relevantExperience: data.relevantExperience,
        starExamples: data.starExamples
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(errText || "Failed to generate final pitch")
    }

    const result = await res.json()
    if (!result.isSuccess) {
      throw new Error(result.message || "Failed to generate final pitch")
    }

    // got an agentExecutionId
    methods.setValue("agentExecutionId", result.data, { shouldDirty: true })
    methods.setValue("pitchContent", "", { shouldDirty: true })

    // We want to save the current step when triggering the final pitch
    await savePitchData(methods.getValues(), pitchId, setPitchId, toast, currentStep)

    // poll for final content
    await pollForPitchContent(
      result.data, methods, pitchId,
      setPitchId, toast, setIsPitchLoading, setFinalPitchError, currentStep
    )
    
    return result.data
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
 * Poll the DB for pitchContent after generation.
 */
export async function pollForPitchContent(
  execId: string,
  methods: UseFormReturn<PitchWizardFormData>,
  pitchId: string | undefined,
  setPitchId: (id: string) => void,
  toast: ToastFunction,
  setIsPitchLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setFinalPitchError: React.Dispatch<React.SetStateAction<string | null>>,
  currentStep: number = 999 // Use a large number as default to represent the final step
) {
  const pollIntervalMs = 3000
  const maxAttempts = 40

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((res) => setTimeout(res, pollIntervalMs))
    
    try {
      const pollRes = await fetch(`/api/pitch-by-exec?execId=${execId}`)
      if (!pollRes.ok) continue
      
      const pollJson = await pollRes.json()
      if (pollJson?.isSuccess && pollJson.data?.pitchContent) {
        methods.setValue("pitchContent", pollJson.data.pitchContent, { shouldDirty: true })
        setIsPitchLoading(false)
        await savePitchData(methods.getValues(), pitchId, setPitchId, toast, currentStep)
        return pollJson.data
      }
    } catch (err) {
      console.error("Poll error:", err)
      // Continue polling despite errors
    }
  }

  const errorMessage = "Timed out waiting for generated pitch. You can continue editing or try again later."
  setFinalPitchError(errorMessage)
  toast({
    title: "Generation Delay",
    description: errorMessage,
    variant: "destructive"
  })
  throw new Error(errorMessage)
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
  const payload = createPitchPayload(data, pitchId, 999, 'final')

  try {
    const res = await fetch("/api/pitchWizard", {
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