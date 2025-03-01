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

/**
 * We expect a dynamic route param called pitchId (matching [pitchId] in the folder name).
 * In Next.js App Router, we receive that via a function param.
 */
interface PitchDetailPageProps {
  params: { pitchId: string } // The route parameter for the pitch ID
}

export default async function PitchDetailPage({ params }: PitchDetailPageProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }

  // Fetch pitch from the database, ensuring it belongs to the current user
  const result = await getPitchByIdAction(params.pitchId, userId)

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

  // If success, result.data is the pitch object
  const pitch = result.data

  // Wrap the client component in Suspense if needed for any potential async calls
  return (
    <Suspense fallback={<div className="p-6">Loading Pitch...</div>}>
      <EditPitch pitch={pitch} userId={userId} />
    </Suspense>
  )
}