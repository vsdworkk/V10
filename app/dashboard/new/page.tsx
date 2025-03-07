/**
 * @description
 * Server page for "/dashboard/new". It ensures the user is authenticated
 * and renders the multi-step wizard to create a new pitch.
 *
 * Key Features:
 * - Auth check using Clerk's `auth()`
 * - Renders `PitchWizard` client component
 *
 * @dependencies
 * - `auth` from "@clerk/nextjs/server" for user authentication
 * - `redirect` from "next/navigation" to handle unauthorized access
 * - `PitchWizard` from "@/app/dashboard/new/_components/pitch-wizard"
 *
 * @notes
 * - The wizard is a multi-step process collecting role/experience/STAR data
 * - Actual DB insertion is done by calling "/api/pitchWizard" in the final step
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import PitchWizard from "@/app/dashboard/new/_components/pitch-wizard"
import ProgressBarWrapper from "@/app/dashboard/new/_components/progress-bar-wrapper"

export default async function CreateNewPitchPage() {
  // Check if the user is authenticated
  const { userId } = await auth()

  if (!userId) {
    // If not authenticated, redirect to login
    redirect("/login")
  }

  // Render the client-side wizard, passing the userId
  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <ProgressBarWrapper />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Role Details</h1>
        <p className="text-muted-foreground mt-2">
          Follow the steps below to create a tailored pitch for your APS application.
        </p>
      </div>
      
      <PitchWizard userId={userId} />
    </div>
  )
}