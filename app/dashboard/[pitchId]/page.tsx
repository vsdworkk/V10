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
import dynamic from "next/dynamic"
import PitchEditor from "./_components/pitch-editor"

interface PitchDetailPageProps {
  params: Promise<{ pitchId: string }>
}

export default async function PitchDetailPage({
  params
}: PitchDetailPageProps) {
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

  // Redirect draft or submitted to wizard flow
  if (pitch.status === "draft") {
    redirect(`/dashboard/new/${pitch.id}`)
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <div className="container mx-auto flex max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6">
        <h1 className="mb-4 text-2xl font-semibold">Edit Pitch</h1>
        <div className="flex flex-1 flex-col">
          <PitchEditor
            pitchId={pitch.id}
            initialContent={pitch.pitchContent || ""}
          />
        </div>
      </div>
    </div>
  )
}
