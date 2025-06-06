"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getPitchByIdAction } from "@/actions/db/pitches-actions"
import PitchWizard from "@/app/(wizard)/dashboard/new/_components/pitch-wizard"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function PitchWizardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
      <div className="flex justify-between pt-4">
        <Skeleton className="h-10 w-20" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  )
}

async function PitchWizardFetcher({
  pitchId,
  stepNumber
}: {
  pitchId: string
  stepNumber: number
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  // Fetch the pitch by ID
  const pitchResult = await getPitchByIdAction(pitchId, userId)

  // If the pitch is not found or doesn't belong to the user, redirect to dashboard
  if (!pitchResult.isSuccess) {
    redirect("/dashboard")
  }

  // Pass the pitch data to the PitchWizard component
  return (
    <PitchWizard
      userId={userId}
      pitchData={pitchResult.data}
      initialStep={stepNumber}
    />
  )
}

export default async function ResumePitchWithStepPage({
  params
}: {
  params: Promise<{ pitchId: string; step: string }>
}) {
  const { pitchId, step } = await params
  const stepNumber = parseInt(step, 10)

  // Validate step number
  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 50) {
    redirect(`/dashboard/new/${pitchId}/step/1`)
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Suspense fallback={<PitchWizardSkeleton />}>
        <PitchWizardFetcher pitchId={pitchId} stepNumber={stepNumber} />
      </Suspense>
    </div>
  )
}
