"use client"

import WizardHeader from "./wizard-header"
import { useCallback, useState, useEffect,useRef } from "react"
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
// import SectionProgressBar from "./section-progress-bar" // <--- We'll place this in the wizard layout aside if needed.
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
    const exampleIndex = Math.floor(indexWithinStar / 4) + 1 // 1-based
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
  starExampleDescriptions: z.array(z.string()).optional(), // Add this line
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
  const [currentStepLocal, setCurrentStepLocal] = useState(pitchData?.currentStep || 1)
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
  // Sidebar Integration - Listen for navigation events
  // ----------------------------------------------------------------
  useEffect(() => {
    // Listen for section navigation events from the sidebar
    const handleSectionNavigate = (e: any) => {
      if (e.detail && e.detail.section) {
        const targetSection = e.detail.section;
        const targetStep = firstStepOfSection(targetSection, starCount);
        setCurrentStepLocal(targetStep);
      }
    };
    
    window.addEventListener("sectionNavigate", handleSectionNavigate);
    return () => window.removeEventListener("sectionNavigate", handleSectionNavigate);
  }, [starCount]); 

  const prevStepRef = useRef(1);
  // Emit current section whenever step changes
  useEffect(() => {
  // Compute the current section whenever the step changes
  const { section } = computeSectionAndHeader(currentStepLocal, starCount);
  
  // Dispatch a custom event to notify the layout that the section changed
  const isForwardNavigation = currentStepLocal > prevStepRef.current;
  const event = new CustomEvent("sectionChange", { 
    detail: { 
      section,
      isForwardNavigation
    } 
  });
  window.dispatchEvent(event);
  
  // Keep track of previous step
  prevStepRef.current = currentStepLocal;
}, [currentStepLocal, starCount]);

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
          setIsPitchLoading(false)
          setFinalPitchError(null)
        }}
        errorMessage={finalPitchError}
      />
    )
  }

  // ----------------------------------------------------------------
  // "Next" handler
  // ----------------------------------------------------------------
  const handleNext = useCallback(async () => {
    // Intro step (step 1) has no data worth persisting yet → just move on
    if (currentStepLocal === 1) {
      setCurrentStepLocal(2)
      return
    }

    // Save current step's data
    const formData = methods.getValues()
    await savePitchData(formData, pitchId, setPitchId, toast, currentStepLocal)

    // if final STAR step, move to review & trigger final pitch
    const lastStarStep = 4 + starCount * 4
    if (currentStepLocal === lastStarStep) {
      setCurrentStepLocal(lastStarStep + 1)
      setIsPitchLoading(true)
      setFinalPitchError(null)

      try {
        await triggerFinalPitch(formData, pitchId, methods, setPitchId, toast, setIsPitchLoading, setFinalPitchError, currentStepLocal)
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

    // else proceed
    setCurrentStepLocal((s) => Math.min(s + 1, totalSteps))
  }, [currentStepLocal, starCount, totalSteps, methods, pitchId, setPitchId, toast])

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
    await savePitchData(data, pitchId, setPitchId, toast, currentStepLocal)
    router.push("/dashboard")
  }, [methods, pitchId, setPitchId, toast, router, currentStepLocal])

  // ----------------------------------------------------------------
  // "Submit Pitch" handler (final)
  // ----------------------------------------------------------------
  const handleSubmitFinal = useCallback(async () => {
    const data = methods.getValues()
    await submitFinalPitch(data, pitchId, setPitchId, toast, router)
  }, [methods, pitchId, setPitchId, toast, router])

  // current section & heading
  const { section: currentSection, header: currentHeader } = computeSectionAndHeader(currentStepLocal, starCount)

  // If you'd like to allow jump-back to older sections:
  const handleSectionNavigate = useCallback(
    (target: Section) => {
      const targetStep = firstStepOfSection(target, starCount)
      if (SECTION_ORDER.indexOf(target) < SECTION_ORDER.indexOf(currentSection)) {
        setCurrentStepLocal(targetStep)
      }
    },
    [currentSection, starCount]
  )

  // Return the entire form + wizard controls
  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        {/* Add global styles for form fields */}
        <style jsx global>{`
          .space-y-8 input, 
          .space-y-8 textarea, 
          .space-y-8 select {
            border-color: #f0f0f5 !important;
            border-width: 1px !important;
            border-radius: 0.5rem !important;
            transition: all 0.2s ease-in-out;
          }
          
          .space-y-8 input:focus, 
          .space-y-8 textarea:focus, 
          .space-y-8 select:focus {
            border-color: #e0e0ef !important;
            box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.08) !important;
          }
        `}</style>

        {/* 
          HEADER MOVED OUTSIDE THE CARD
          This matches the layout in Image 2
        */}
        <div className="mb-6">
          <WizardHeader header={currentHeader} isIntro={currentSection === "INTRO"} />
        </div>

{/* CARD CONTAINS ONLY THE FORM FIELDS */}
<div 
  className="bg-white rounded-2xl overflow-hidden mb-8"
  style={{ 
    boxShadow: '0 12px 28px -12px rgba(0, 0, 0, 0.07), 0 5px 12px -6px rgba(0, 0, 0, 0.035)' 
  }}
>
  <motion.div
    key={currentStepLocal}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {renderStep()}
  </motion.div>
</div>

     {/* BUTTONS MOVED OUTSIDE THE CARD */}
<div className="pt-10 flex justify-between items-center mt-10">
  {/* Back button */}
  {currentStepLocal > 1 ? (
    <Button 
      variant="outline" 
      onClick={handleBack} 
      className="px-6 py-3 text-gray-600 hover:text-gray-800 flex items-center group transition-all duration-200 font-normal"
    >
      <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1" />
      Back
    </Button>
  ) : (
    <div />
  )}

  <div className="flex items-center space-x-4">
    {/* Save and Close */}
    <Button 
      variant="outline" 
      onClick={handleSaveAndClose} 
      className="px-6 py-3 text-gray-600 hover:text-gray-800 flex items-center group transition-all duration-200 font-normal"
    >
      <Save className="h-4 w-4 mr-2 group-hover:scale-110" />
      Save &amp; Close
    </Button>

    {/* Next or Final Submit */}
    {currentStepLocal < totalSteps ? (
      <Button 
        onClick={handleNext} 
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center group transition-all duration-200 shadow-sm hover:shadow"
      >
        Next Step
        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1" />
      </Button>
    ) : (
      <Button
        type="button"
        onClick={handleSubmitFinal}
        className="bg-green-600 hover:bg-green-700 font-medium"
      >
        Submit Pitch
      </Button>
    )}
  </div>
</div>
      </div>
    </FormProvider>
  )
}

// ----------------------------------------------------------------
//  HELPER FUNCTIONS
// ----------------------------------------------------------------

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
      roleLevel: "APS4",
      pitchWordLimit: 650,
      roleDescription: "",
      relevantExperience: "",
      albertGuidance: "",
      starExamples: [createEmptyStarExample()],
      starExamplesCount: "1",
      pitchContent: "",
      agentExecutionId: ""
    }
  }

  const validLevels = ["APS1","APS2","APS3","APS4","APS5","APS6","EL1"] as const
  type RoleLevelEnum = typeof validLevels[number]; // Derive the enum type

  const determinedLevel = (validLevels.includes(pitchData.roleLevel as any) // Check if DB value is valid
    ? pitchData.roleLevel
    : "APS4") // Use default if not

  const sc = pitchData.starExamplesCount
    ? String(pitchData.starExamplesCount)
    : "1"

  // Define valid star counts and derive the enum type
  const validStarCounts = ["1","2","3","4","5","6","7","8","9","10"] as const;
  type StarCountEnum = typeof validStarCounts[number];

  const safeStarCount = (validStarCounts.includes(sc as any) ? sc : "1")

  return {
    userId: pitchData.userId,
    roleName: pitchData.roleName ?? "",
    organisationName: pitchData.organisationName ?? "",
    roleLevel: determinedLevel as RoleLevelEnum, // Assert the type here
    pitchWordLimit: pitchData.pitchWordLimit || 650,
    roleDescription: pitchData.roleDescription ?? "",
    relevantExperience: pitchData.relevantExperience ?? "",
    albertGuidance: pitchData.albertGuidance ?? "",
    starExamples: (pitchData.starExamples && pitchData.starExamples.length > 0
      ? pitchData.starExamples.map(ex => ({ // Map and provide defaults
          situation: {
            "where-and-when-did-this-experience-occur": ex.situation?.["where-and-when-did-this-experience-occur"] ?? "",
            "briefly-describe-the-situation-or-challenge-you-faced": ex.situation?.["briefly-describe-the-situation-or-challenge-you-faced"] ?? "",
          },
          task: {
            "what-was-your-responsibility-in-addressing-this-issue": ex.task?.["what-was-your-responsibility-in-addressing-this-issue"] ?? "",
            "what-constraints-or-requirements-did-you-need-to-consider": ex.task?.["what-constraints-or-requirements-did-you-need-to-consider"] ?? "",
          },
          action: {
            steps: ex.action?.steps?.map(step => ({
              stepNumber: step.stepNumber ?? 1,
              "what-did-you-specifically-do-in-this-step": step["what-did-you-specifically-do-in-this-step"] ?? "",
              "how-did-you-do-it-tools-methods-or-skills": step["how-did-you-do-it-tools-methods-or-skills"] ?? "",
              "what-was-the-outcome-of-this-step-optional": step["what-was-the-outcome-of-this-step-optional"],
            })) ?? [ // Default action step if needed
              {
                stepNumber: 1,
                "what-did-you-specifically-do-in-this-step": "",
                "how-did-you-do-it-tools-methods-or-skills": "",
                "what-was-the-outcome-of-this-step-optional": "",
              }
            ],
          },
          result: {
            "what-positive-outcome-did-you-achieve": ex.result?.["what-positive-outcome-did-you-achieve"] ?? "",
            "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": ex.result?.["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] ?? "",
          },
        }))
      : [createEmptyStarExample()]),
    starExamplesCount: safeStarCount as StarCountEnum, // Assert the type here
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
 * Persists user's partial draft (create/update).
 */
async function savePitchData(
  data: PitchWizardFormData,
  pitchId: string | undefined,
  setPitchId: (id: string) => void,
  toast: any,
  currentStep: number = 1
) {
  const payload = {
    ...(pitchId ? { id: pitchId } : {}),
    userId: data.userId,
    roleName: data.roleName,
    organisationName: data.organisationName,
    roleLevel: data.roleLevel,
    pitchWordLimit: data.pitchWordLimit,
    roleDescription: data.roleDescription ?? "",
    relevantExperience: data.relevantExperience ?? "",
    albertGuidance: data.albertGuidance ?? "",
    pitchContent: data.pitchContent ?? "",
    starExamples: data.starExamples,
    starExamplesCount: parseInt(data.starExamplesCount, 10),
    status: "draft",
    currentStep: currentStep,
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
 * Final pitch generation.
 */
async function triggerFinalPitch(
  data: PitchWizardFormData,
  pitchId: string | undefined,
  methods: ReturnType<typeof useForm<PitchWizardFormData>>,
  setPitchId: (id: string) => void,
  toast: any,
  setIsPitchLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setFinalPitchError: React.Dispatch<React.SetStateAction<string | null>>,
  currentStep: number
) {
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
}

/**
 * Poll the DB for pitchContent after generation.
 */
async function pollForPitchContent(
  execId: string,
  methods: ReturnType<typeof useForm<PitchWizardFormData>>,
  pitchId: string | undefined,
  setPitchId: (id: string) => void,
  toast: any,
  setIsPitchLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setFinalPitchError: React.Dispatch<React.SetStateAction<string | null>>,
  currentStep: number = 999 // Use a large number as default to represent the final step
) {
  const pollIntervalMs = 3000
  const maxAttempts = 40

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((res) => setTimeout(res, pollIntervalMs))
    const pollRes = await fetch(`/api/pitch-by-exec?execId=${execId}`)
    if (!pollRes.ok) continue
    const pollJson = await pollRes.json()
    if (pollJson?.isSuccess && pollJson.data?.pitchContent) {
      methods.setValue("pitchContent", pollJson.data.pitchContent, { shouldDirty: true })
      setIsPitchLoading(false)
      await savePitchData(methods.getValues(), pitchId, setPitchId, toast, currentStep)
      return
    }
  }

  const errorMessage = "Timed out waiting for generated pitch. You can continue editing or try again later."
  setFinalPitchError(errorMessage)
  toast({
    title: "Generation Delay",
    description: errorMessage,
    variant: "destructive"
  })
}

/**
 * Submit final pitch to DB
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

    if (typeof window !== "undefined") {
      localStorage.removeItem("currentPitchId")
    }

    toast({ title: "Success", description: "Your pitch has been finalized." })
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