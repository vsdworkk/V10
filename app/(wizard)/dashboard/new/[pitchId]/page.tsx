/**
 * @description
 * Server page for "/dashboard/new/[pitchId]". It ensures the user is authenticated,
 * fetches the pitch by ID, and renders the multi-step wizard to resume a draft pitch.
 *
 * Key Features:
 * - Auth check using Clerk's `auth()`
 * - Fetches pitch data using getPitchByIdAction
 * - Renders `PitchWizard` client component with the pitch data
 *
 * @dependencies
 * - `auth` from "@clerk/nextjs/server" for user authentication
 * - `redirect` from "next/navigation" to handle unauthorized access
 * - `getPitchByIdAction` from "@/actions/db/pitches-actions"
 * - `PitchWizard` from "@/app/dashboard/new/_components/pitch-wizard"
 *
 * @notes
 * - This page allows users to resume a draft pitch from where they left off
 * - If the pitch is not found or doesn't belong to the user, redirects to /dashboard
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getPitchByIdAction } from "@/actions/db/pitches-actions"
import PitchWizard from "@/app/dashboard/new/_components/pitch-wizard"
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

async function PitchWizardFetcher({ pitchId }: { pitchId: string }) {
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
  return <PitchWizard userId={userId} pitchData={pitchResult.data} />
}

export default async function ResumePitchPage({ params }: { params: Promise<{ pitchId: string }> }) {
  const { pitchId } = await params
  
  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <Suspense fallback={<PitchWizardSkeleton />}>
        <PitchWizardFetcher pitchId={pitchId} />
      </Suspense>
    </div>
  )
} 