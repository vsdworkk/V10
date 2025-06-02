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
 * - `PitchWizard` from "@/app/(wizard)/dashboard/new/_components/pitch-wizard"
 *
 * @notes
 * - This page allows users to resume a draft pitch from where they left off
 * - If the pitch is not found or doesn't belong to the user, redirects to /dashboard
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getPitchByIdAction } from "@/actions/db/pitches-actions"

export default async function ResumePitchPage({
  params
}: {
  params: Promise<{ pitchId: string }>
}) {
  const { pitchId } = await params

  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }

  const result = await getPitchByIdAction(pitchId, userId)
  if (!result.isSuccess || !result.data) {
    redirect("/dashboard")
  }

  const step = result.data.currentStep || 1
  redirect(`/dashboard/new/${pitchId}/${step}`)
}
