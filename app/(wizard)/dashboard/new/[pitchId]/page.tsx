/**
 * @description
 * Server page for "/dashboard/new/[pitchId]". It ensures the user is authenticated,
 * fetches the pitch by ID, and redirects to the step-based URL structure.
 *
 * Key Features:
 * - Auth check using Clerk's `auth()`
 * - Fetches pitch data using getPitchByIdAction
 * - Redirects to step-based URL structure with current step
 *
 * @dependencies
 * - `auth` from "@clerk/nextjs/server" for user authentication
 * - `redirect` from "next/navigation" to handle unauthorized access
 * - `getPitchByIdAction` from "@/actions/db/pitches-actions"
 *
 * @notes
 * - This page redirects users to the step-based URL structure
 * - Preserves the user's progress by redirecting to their current step
 * - If the pitch is not found or doesn't belong to the user, redirects to /dashboard
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getPitchByIdAction } from "@/actions/db/pitches-actions"
import PitchWizard from "@/app/(wizard)/dashboard/new/_components/pitch-wizard"

interface ResumePitchPageProps {
  params: Promise<{ pitchId: string }>
  searchParams: Promise<{ step?: string }>
}

export default async function ResumePitchPage({
  params,
  searchParams
}: ResumePitchPageProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }

  const { pitchId } = await params
  const { step } = await searchParams
  
  // Fetch the pitch by ID
  const pitchResult = await getPitchByIdAction(pitchId, userId)

  // If the pitch is not found or doesn't belong to the user, redirect to dashboard
  if (!pitchResult.isSuccess) {
    redirect("/dashboard")
  }

  const initialStep = step ? parseInt(step, 10) : pitchResult.data.currentStep || 1

  // Validate step number
  const validStep = !isNaN(initialStep) && initialStep > 0 && initialStep <= 50 ? initialStep : 1

  return (
    <div className="size-full">
      <PitchWizard
        userId={userId}
        pitchData={pitchResult.data}
        initialStep={validStep}
      />
    </div>
  )
}
