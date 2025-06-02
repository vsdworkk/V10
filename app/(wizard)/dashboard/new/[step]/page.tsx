"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import PitchWizard from "@/app/(wizard)/dashboard/new/_components/pitch-wizard"
import CheckStoredPitch from "@/app/(wizard)/dashboard/new/_components/check-stored-pitch"

interface NewPitchStepPageProps {
  params: Promise<{ step: string }>
}

export default async function NewPitchStepPage({
  params
}: NewPitchStepPageProps) {
  const { step } = await params
  const stepNum = parseInt(step, 10)

  if (!Number.isFinite(stepNum) || stepNum < 1 || stepNum > 100) {
    redirect("/dashboard/new/1")
  }

  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }

  return (
    <div className="size-full">
      <CheckStoredPitch />
      <PitchWizard userId={userId} initialStep={stepNum} />
    </div>
  )
}
