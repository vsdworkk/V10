"use client"

import { useCallback, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

// Step components
import WizardIntroStep from "./wizard-intro-step"
import RoleStep from "./role-step"
import ExperienceStep from "./experience-step"
import GuidanceStep from "./guidance-step"
import SituationStep from "./situation-step"
import TaskStep from "./task-step"
import ActionStep from "./action-step"
import ResultStep from "./result-step"
import ReviewStep from "./review-step"

// UI / hooks
import { Button } from "@/components/ui/button"
import { RefreshCw, Save, ArrowRight, ArrowLeft } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import type { SelectPitch } from "@/db/schema/pitches-schema"
import WizardHeader from "./wizard-header"
import SectionProgressBar from "./section-progress-bar"
import type { Section } from "@/types"

// ---------------------------------------------------
// Constants and Helpers
// ---------------------------------------------------

const SECTION_ORDER: Section[] = ["INTRO", "ROLE", "EXP", "GUIDE", "STAR", "FINAL"]

function firstStepOfSection(section: Section, starCount: number) {
  switch (section) {
    case "INTRO":
      return 1
    case "ROLE":
      return 2
    case "EXP":
      return 3
    case "GUIDE":
      return 4
    case "STAR":
      return 5
    case "FINAL":
    default:
      return 4 + starCount * 4 + 1
  }
}

function computeSectionAndHeader(step: number, starCount: number): { section: Section; header: string } {
  if (step === 1) return { section: "INTRO", header: "Welcome to the Pitch Wizard" }
  if (step === 2) return { section: "ROLE", header: "Role Details" }
  if (step === 3) return { section: "EXP", header: "Your Experience" }
  if (step === 4) return { section: "GUIDE", header: "Guidance" }

  const firstStarStep = 5
  const lastStarStep = 4 + starCount * 4
  if (step >= firstStarStep && step <= lastStarStep) {
    const indexWithinStar = step - firstStarStep
    const exampleIndex = Math.floor(indexWithinStar / 4) + 1 // 1‑based
    const subStepIndex = indexWithinStar % 4
    const subStepLabel = ["Situation", "Task", "Action", "Result"][subStepIndex]
    return {
      section: "STAR",
      header: `STAR Example #${exampleIndex} – ${subStepLabel}`
    }
  }

  // final
  return { section: "FINAL", header: "Review & Edit" }
}

// ---------------------------------------------------
// Zod schema for the wizard
// ---------------------------------------------------

const actionStepSchema = z.object({
  stepNumber: z.number(),
  "what-did-you-specifically-do-in-this-step": z.string(),
  "how-did-you-do-it-tools-methods-or-skills": z.string(),
  "what-was-the-outcome-of-this-step-optional": z.string().optional()
})

const starExampleSchema = z.object({
  situation: z.object({
    "where-and-when-did-this-experience-occur": z.string().min(5, "Please describe where/when."),
    "briefly-describe-the-situation-or-challenge-you-faced": z.string().min(5)
  }),
  task: z.object({
    "what-was-your-responsibility-in-addressing-this-issue": z.string().min(5),
    "what-constraints-or-requirements-did-you-need-to-consider": z.string().min(5)
  }),
  action: z.object({
    steps: z.array(actionStepSchema).min(1, "At least one action step")
  }),
  result: z.object({
    "what-positive-outcome-did-you-achieve": z.string().min(5),
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": z.string().min(5)
  })
})

const pitchWizardSchema = z.object({
  userId: z.string().optional(),
  roleName: z.string().min(2),
  organisationName: z.string().optional(),
  roleLevel: z.enum(["APS1", "APS2", "APS3", "APS4", "APS5", "APS6", "EL1"]),
  pitchWordLimit: z.number().min(400, "Minimum 400 words"),
  roleDescription: z.string().optional(),
  relevantExperience: z.string().min(10),
  albertGuidance: z.string().optional(),

  starExamplesCount: z.enum(["1","2","3","4","5","6","7","8","9","10"]).default("1"),
  starExamples: z.array(starExampleSchema).min(1, "At least one STAR example"),

  pitchContent: z.string().optional(),
  agentExecutionId: z.string().optional()
})

export type PitchWizardFormData = z.infer<typeof pitchWizardSchema>

interface PitchWizardProps {
  userId: string
  pitchData?: SelectPitch
}

export default function PitchWizard({ userId, pitchData }: PitchWizardProps) {
  const router = useRouter()
  const { toast } = useToast()

  // local wizard state
  const [currentStepLocal, setCurrentStepLocal] = useState(1)
  const [pitchId, setPitchId] = useState<string | undefined>(pitchData?.id)

  // This is the boolean that shows the placeholder until we get final text
  const [isPitchLoading, setIsPitchLoading] = useState(false)
  const [finalPitchError, setFinalPitchError] = useState<string | null>(null)

  // React Hook Form setup
  const methods = useForm<PitchWizardFormData>({
    resolver: zodResolver(pitchWizardSchema),
    defaultValues: mapExistingDataToDefaults(userId, pitchData),
    mode: "onChange"
  })

  // watch starExamplesCount
  const starCount = parseInt(methods.watch("starExamplesCount") || "1", 10)
  const totalSteps = 4 + starCount * 4 + 1

  // ----------------------------------------------------------------
  // Render the step
  // ----------------------------------------------------------------
  function renderStep() {
    // Step 1 => Intro
    if (currentStepLocal === 1) return <WizardIntroStep />
    // Step 2 => Role
    if (currentStepLocal === 2) return <RoleStep />
    // Step 3 => Experience
    if (currentStepLocal === 3) return <ExperienceStep />
    // Step 4 => Guidance
    if (currentStepLocal === 4) return <GuidanceStep />

    // Next: starExamples sub-steps
    const firstStarStep = 5
    const lastStarStep = 4 + starCount * 4
    if (currentStepLocal >= firstStarStep && currentStepLocal <= lastStarStep) {
      const stepInStar = currentStepLocal - firstStarStep
      const exampleIndex = Math.floor(stepInStar / 4)
      const subStepIndex = stepInStar % 4

      if (subStepIndex === 0) return <SituationStep exampleIndex={exampleIndex} />
      if (subStepIndex === 1) return <TaskStep exampleIndex={exampleIndex} />
      if (subStepIndex === 2) return <ActionStep exampleIndex={exampleIndex} />
      if (subStepIndex === 3) return <ResultStep exampleIndex={exampleIndex} />
    }

    // Step: review
    // Pass in a callback so ReviewStep can also clear isPitchLoading
    return (
      <ReviewStep
        isPitchLoading={isPitchLoading}
        onPitchLoaded={() => {
          setIsPitchLoading(false);
          setFinalPitchError(null);
        }}
        errorMessage={finalPitchError}
      />
    )
  }

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS!

  // ----------------------------------------------------------------
  // "Next" handler
  // ----------------------------------------------------------------
  const handleNext = useCallback(async () => {
    // Intro step (step 1) has no data worth persisting yet → just move on
    if (currentStepLocal === 1) {
      setCurrentStepLocal(2)
      return
    }

    // Save current step's data first
    const formData = methods.getValues()
    await savePitchData(formData, pitchId, setPitchId, toast)

    // figure out if we are on the last STAR step
    const lastStarStep = 4 + starCount * 4
    if (currentStepLocal === lastStarStep) {
      // user just finished the final STAR sub-step
      // First, move to the Review step immediately
      setCurrentStepLocal(lastStarStep + 1)
      // Then set loading state to true so the Review step shows a loading indicator
      setIsPitchLoading(true)
      setFinalPitchError(null)

      // Start the pitch generation process in the background
      try {
        // generate final pitch
        await triggerFinalPitch(formData, pitchId, methods, setPitchId, toast, setIsPitchLoading, setFinalPitchError)
      } catch (err: any) {
        console.error("Final pitch generation error:", err)
        setFinalPitchError(err.message || "An error occurred generating your pitch")
        toast({
          title: "Error",
          description: err.message || "Failed to generate pitch",
          variant: "destructive"
        })
        setIsPitchLoading(false)
      }
      return
    }

    // otherwise, just move forward
    setCurrentStepLocal((s) => Math.min(s + 1, totalSteps))
  }, [currentStepLocal, starCount, totalSteps, methods, pitchId, setPitchId, toast, setIsPitchLoading, setFinalPitchError])

  // ----------------------------------------------------------------
  // "Back" handler
  // ----------------------------------------------------------------
  const handleBack = useCallback(async () => {
    setCurrentStepLocal((s) => Math.max(s - 1, 1))
  }, [])

  // ----------------------------------------------------------------
  // "Save & Close" handler
  // ----------------------------------------------------------------
  const handleSaveAndClose = useCallback(async () => {
    const data = methods.getValues()
    // Save user's partial draft
    await savePitchData(data, pitchId, setPitchId, toast)
    router.push("/dashboard")
  }, [methods, pitchId, setPitchId, toast, router])

  // ----------------------------------------------------------------
  // "Submit Pitch" handler
  // ----------------------------------------------------------------
  const handleSubmitFinal = useCallback(async () => {
    const data = methods.getValues()
    // Mark the pitch as final in the DB
    await submitFinalPitch(data, pitchId, setPitchId, toast, router)
  }, [methods, pitchId, setPitchId, toast, router])

  // figure out current section for the progress bar
  const { section: currentSection, header: currentHeader } = computeSectionAndHeader(currentStepLocal, starCount)

  // for jump-back in the progress bar (optional)
  const handleSectionNavigate = useCallback(
    (target: Section) => {
      const targetStep = firstStepOfSection(target, starCount)
      // Do not allow forward jumps
      if (SECTION_ORDER.indexOf(target) < SECTION_ORDER.indexOf(currentSection)) {
        setCurrentStepLocal(targetStep)
      }
    },
    [currentSection, starCount]
  )

  // NOW, after all hooks are called, we can conditionally render
  
  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        {/* Sticky Header + Progress Bar */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b flex flex-col items-center py-4">
          <WizardHeader header={currentHeader} isIntro={currentSection === "INTRO"} />
          <div className="mb-6" />
          <SectionProgressBar
            current={currentSection}
            onNavigate={handleSectionNavigate}
            className="mb-2 mt-0.5"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mt-2">
          <motion.div
            key={currentStepLocal}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>

          <div className="flex justify-between pt-8 mt-6 border-t">
            {/* Back button */}
            {currentStepLocal > 1 ? (
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            <div className="flex space-x-3 ml-auto">
              {/* Save and Close */}
              <Button variant="outline" onClick={handleSaveAndClose} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save &amp; Close
              </Button>

              {/* Next or Final Submit */}
              {currentStepLocal < totalSteps ? (
                <Button onClick={handleNext} className="flex items-center gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmitFinal}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Pitch
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

// ---------------------------------------------------
// Helpers
// ---------------------------------------------------

function mapExistingDataToDefaults(
  userId: string,
  pitchData?: SelectPitch
): Partial<PitchWizardFormData> {
  // map DB record into form defaults
  if (!pitchData) {
    return {
      userId,
      roleName: "",
      organisationName: "",
      roleLevel: "APS4" as PitchWizardFormData["roleLevel"],
      pitchWordLimit: 650,
      roleDescription: "",
      relevantExperience: "",
      albertGuidance: "",
      starExamples: [createEmptyStarExample()],
      starExamplesCount: "1" as PitchWizardFormData["starExamplesCount"],
      pitchContent: "",
      agentExecutionId: ""
    }
  }

  const validLevels = ["APS1","APS2","APS3","APS4","APS5","APS6","EL1"] as const
  const safeLevel = (validLevels.includes(pitchData.roleLevel as any)
    ? pitchData.roleLevel
    : "APS4") as PitchWizardFormData["roleLevel"]

  const sc = pitchData.starExamplesCount
    ? String(pitchData.starExamplesCount)
    : "1"
  const safeStarCount = (/^\d+$/.test(sc) ? sc : "1") as PitchWizardFormData["starExamplesCount"]

  return {
    userId: pitchData.userId,
    roleName: pitchData.roleName ?? "",
    organisationName: pitchData.organisationName ?? "",
    roleLevel: safeLevel,
    pitchWordLimit: pitchData.pitchWordLimit || 650,
    roleDescription: pitchData.roleDescription ?? "",
    relevantExperience: pitchData.relevantExperience ?? "",
    albertGuidance: pitchData.albertGuidance ?? "",
    starExamples: (pitchData.starExamples && pitchData.starExamples.length > 0
      ? pitchData.starExamples
      : [createEmptyStarExample()]) as PitchWizardFormData["starExamples"],
    starExamplesCount: safeStarCount,
    pitchContent: pitchData.pitchContent ?? "",
    agentExecutionId: pitchData.agentExecutionId ?? ""
  }
}

function createEmptyStarExample() {
  return {
    situation: {
      "where-and-when-did-this-experience-occur": "",
      "briefly-describe-the-situation-or-challenge-you-faced": ""
    },
    task: {
      "what-was-your-responsibility-in-addressing-this-issue": "",
      "what-constraints-or-requirements-did-you-need-to-consider": ""
    },
    action: {
      steps: [
        {
          stepNumber: 1,
          "what-did-you-specifically-do-in-this-step": "",
          "how-did-you-do-it-tools-methods-or-skills": "",
          "what-was-the-outcome-of-this-step-optional": ""
        }
      ]
    },
    result: {
      "what-positive-outcome-did-you-achieve": "",
      "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": ""
    }
  }
}

/**
 * Persists the user's partial draft to the DB (create/update).
 */
async function savePitchData(
  data: PitchWizardFormData,
  pitchId: string | undefined,
  setPitchId: (id: string) => void,
  toast: any
) {
  const payload = {
    ...(pitchId ? { id: pitchId } : {}),
    userId: data.userId,
    roleName: data.roleName,
    organisationName: data.organisationName,
    roleLevel: data.roleLevel,
    pitchWordLimit: data.pitchWordLimit,
    roleDescription: data.roleDescription || "",
    relevantExperience: data.relevantExperience || "",
    albertGuidance: data.albertGuidance || "",
    pitchContent: data.pitchContent || "",
    starExamples: data.starExamples,
    starExamplesCount: parseInt(data.starExamplesCount, 10),
    status: "draft",
    currentStep: 1,
    agentExecutionId: data.agentExecutionId || null
  }

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
    toast({ title: "Draft Saved", description: "Your pitch draft has been saved." })
  } catch (err: any) {
    console.error("savePitchData error:", err)
    toast({
      title: "Error",
      description: err.message || "Failed to save draft",
      variant: "destructive"
    })
  }
}

/**
 * Called when finishing the final STAR sub-step to generate the final pitch text.
 */
async function triggerFinalPitch(
  data: PitchWizardFormData,
  pitchId: string | undefined,
  methods: ReturnType<typeof useForm<PitchWizardFormData>>,
  setPitchId: (id: string) => void,
  toast: any,
  setIsPitchLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setFinalPitchError: React.Dispatch<React.SetStateAction<string | null>>
) {
  // Call /api/finalPitch
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

  // We have an agentExecutionId now (our 6-digit code).
  methods.setValue("agentExecutionId", result.data, { shouldDirty: true })
  methods.setValue("pitchContent", "", { shouldDirty: true })

  // Save that agentExecutionId to DB
  await savePitchData(methods.getValues(), pitchId, setPitchId, toast)

  // optional: Poll for pitchContent
  await pollForPitchContent(result.data, methods, pitchId, setPitchId, toast, setIsPitchLoading, setFinalPitchError)
}

/**
 * Poll our DB (via /api/pitch-by-exec?execId=...) for the final pitchContent.
 */
async function pollForPitchContent(
  execId: string,
  methods: ReturnType<typeof useForm<PitchWizardFormData>>,
  pitchId: string | undefined,
  setPitchId: (id: string) => void,
  toast: any,
  setIsPitchLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setFinalPitchError: React.Dispatch<React.SetStateAction<string | null>>
) {
  const pollIntervalMs = 3000
  const maxAttempts = 40 // ~2 minutes

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((res) => setTimeout(res, pollIntervalMs))

    const pollRes = await fetch(`/api/pitch-by-exec?execId=${execId}`)
    if (!pollRes.ok) continue

    const pollJson = await pollRes.json()
    if (pollJson?.isSuccess && pollJson.data?.pitchContent) {
      const content = pollJson.data.pitchContent as string
      methods.setValue("pitchContent", content, { shouldDirty: true })

      //  Step 3 addition: once we have final pitch, hide the loading state
      setIsPitchLoading(false)

      await savePitchData(methods.getValues(), pitchId, setPitchId, toast)
      return
    }
  }
  
  // Instead of throwing an error, set the error message state
  // and keep the loading state active so the user can see the error in the ReviewStep
  const errorMessage = "Timed out waiting for generated pitch. You can continue editing or try again later.";
  setFinalPitchError(errorMessage);
  toast({
    title: "Generation Delay",
    description: errorMessage,
    variant: "destructive"
  });
  
  // We don't call setIsPitchLoading(false) here because we want to keep showing the loading state
  // with the error message in the ReviewStep
}

/**
 * Called in the final ReviewStep to mark pitch as final in DB.
 */
async function submitFinalPitch(
  data: PitchWizardFormData,
  pitchId: string | undefined,
  setPitchId: (id: string) => void,
  toast: any,
  router: any
) {
  const payload = {
    ...(pitchId ? { id: pitchId } : {}),
    userId: data.userId,
    roleName: data.roleName,
    organisationName: data.organisationName,
    roleLevel: data.roleLevel,
    pitchWordLimit: data.pitchWordLimit,
    roleDescription: data.roleDescription || "",
    relevantExperience: data.relevantExperience,
    albertGuidance: data.albertGuidance,
    pitchContent: data.pitchContent,
    starExamples: data.starExamples,
    starExamplesCount: parseInt(data.starExamplesCount, 10),
    status: "final",
    currentStep: 999,
    agentExecutionId: data.agentExecutionId
  }

  try {
    const res = await fetch("/api/pitchWizard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      throw new Error("Failed to submit final pitch.")
    }

    // Clear local storage or other wizard state
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentPitchId")
    }

    toast({
      title: "Success",
      description: "Your pitch has been finalized."
    })
    router.push("/dashboard")
  } catch (err: any) {
    console.error("submitFinalPitch error:", err)
    toast({
      title: "Error",
      description: err.message || "Failed to submit pitch",
      variant: "destructive"
    })
  }
}