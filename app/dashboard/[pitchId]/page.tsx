"use server"
/**
 * @description
 * This server page displays and manages the details of a specific pitch identified by [pitchId].
 * It:
 * - Verifies user authentication
 * - Fetches the pitch from the DB using getPitchByIdAction
 * - Passes the pitch data to a client component for editing
 *
 * Key features:
 * - Show pitch info if found
 * - Render a client component (EditPitch) for interactive updates
 * - Error handling if pitch is missing or doesn't belong to the user
 *
 * @dependencies
 * - auth from "@clerk/nextjs/server" for user authentication
 * - redirect from "next/navigation" to handle redirect if unauthenticated
 * - getPitchByIdAction from "@/actions/db/pitches-actions" to fetch pitch data
 * - Suspense from "react" if we want to wrap the client component with a fallback
 *
 * @notes
 * - If the DB fetch fails or doesn't return a pitch, we display an error message.
 * - We rely on the client component to handle final editing logic and calls to update.
 */

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getPitchByIdAction } from "@/actions/db/pitches-actions"
import EditPitch from "./_components/edit-pitch"
import ProgressBarWrapper from "@/app/dashboard/new/_components/progress-bar-wrapper"
import EditHeader from "./_components/edit-header"

/**
 * In Next.js 15, dynamic route params are async.
 * So here we define params as a Promise<{ pitchId: string }> and await it below.
 */
interface PitchDetailPageProps {
  params: Promise<{ pitchId: string }>
}

export default async function PitchDetailPage({ params }: PitchDetailPageProps) {
  // Destructure pitchId from the awaited params
  const { pitchId } = await params

  // Check Clerk auth
  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }

  // Fetch pitch from DB
  const result = await getPitchByIdAction(pitchId, userId)

  // If DB action fails or pitch not found
  if (!result.isSuccess || !result.data) {
    return (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-semibold">Pitch Not Found</h1>
        <p className="text-muted-foreground">
          {result.message || "We could not find a pitch with that ID."}
        </p>
      </div>
    )
  }

  // Render the EditPitch client component in Suspense, if needed
  const pitch = result.data
  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <ProgressBarWrapper>
        <EditHeader />
        <Suspense fallback={<div className="p-6">Loading Pitch...</div>}>
          <EditPitch pitch={pitch} userId={userId} />
        </Suspense>
      </ProgressBarWrapper>
    </div>
  )
}