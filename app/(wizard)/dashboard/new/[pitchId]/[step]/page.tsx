"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getPitchByIdAction } from "@/actions/db/pitches-actions"
import PitchWizard from "@/app/(wizard)/dashboard/new/_components/pitch-wizard"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface PitchWizardStepPageProps {
  params: Promise<{ pitchId: string; step: string }>
}

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
  stepNum,
  userId
}: {
  pitchId: string
  stepNum: number
  userId: string
}) {
  const pitchResult = await getPitchByIdAction(pitchId, userId)

  if (!pitchResult.isSuccess || !pitchResult.data) {
    redirect("/dashboard")
  }

  return (
    <PitchWizard
      userId={userId}
      pitchData={pitchResult.data}
      initialStep={stepNum}
    />
  )
}

export default async function PitchWizardStepPage({
  params
}: PitchWizardStepPageProps) {
  const { pitchId, step } = await params
  const stepNum = parseInt(step, 10)

  if (!Number.isFinite(stepNum) || stepNum < 1 || stepNum > 100) {
    redirect(`/dashboard/new/${pitchId}/1`)
  }

  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Suspense fallback={<PitchWizardSkeleton />}>
        <PitchWizardFetcher
          pitchId={pitchId}
          stepNum={stepNum}
          userId={userId}
        />
      </Suspense>
    </div>
  )
}
