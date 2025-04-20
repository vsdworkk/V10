"use server"
/**
 * @description
 * This server page displays details of a specific pitch identified by [pitchId].
 * It:
 * - Verifies user authentication
 * - Fetches the pitch from the DB using getPitchByIdAction
 * - Shows pitch info if found
 */

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getPitchByIdAction } from "@/actions/db/pitches-actions"

interface PitchDetailPageProps {
  params: Promise<{ pitchId: string }>
}

export default async function PitchDetailPage({ params }: PitchDetailPageProps) {
  const { pitchId } = await params

  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }

  const result = await getPitchByIdAction(pitchId, userId)

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

  const pitch = result.data

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-semibold">{pitch.roleName}</h1>
        {pitch.organisationName && (
          <p className="mb-2 text-lg">
            <strong>Organisation:</strong> {pitch.organisationName}
          </p>
        )}
        {pitch.pitchContent && (
          <div className="mt-4">
            <h2 className="font-semibold text-xl">Pitch Content</h2>
            <p className="mt-2 whitespace-pre-line">{pitch.pitchContent}</p>
          </div>
        )}
      </div>
    </div>
  )
}