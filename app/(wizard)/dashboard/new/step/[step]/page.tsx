"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import PitchWizard from "@/app/(wizard)/dashboard/new/_components/pitch-wizard"
import CheckStoredPitch from "@/app/(wizard)/dashboard/new/_components/check-stored-pitch"

export default async function CreateNewPitchWithStepPage({
  params
}: {
  params: Promise<{ step: string }>
}) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }

  const { step } = await params
  const stepNumber = parseInt(step, 10)

  // Validate step number (1-based, reasonable range)
  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 50) {
    redirect("/dashboard/new/step/1")
  }

  return (
    <div className="size-full">
      <CheckStoredPitch />
      <PitchWizard userId={userId} initialStep={stepNumber} />
    </div>
  )
}
