/**
 * @description
 * Server page for "/dashboard/new". It ensures the user is authenticated
 * and renders the wizard with step management via search parameters.
 *
 * Key Features:
 * - Uses search params for step navigation (no server re-renders)
 * - Maintains backward compatibility
 * - Handles localStorage pitch resumption
 *
 * @dependencies
 * - `auth` from "@clerk/nextjs/server" for authentication
 * - `redirect` from "next/navigation" to handle authentication redirects
 *
 * @notes
 * - Step navigation is now handled client-side via search parameters
 * - No more server round-trips for step changes
 */

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import PitchWizard from "./components/wizard"
import CheckStoredPitch from "./components/utilities/check-stored-pitch"

interface CreateNewPitchPageProps {
  searchParams: Promise<{ step?: string }>
}

export default async function CreateNewPitchPage({
  searchParams
}: CreateNewPitchPageProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }

  const { step } = await searchParams
  const initialStep = step ? parseInt(step, 10) : 1

  // Validate step number
  const validStep =
    !isNaN(initialStep) && initialStep > 0 && initialStep <= 50
      ? initialStep
      : 1

  return (
    <div className="size-full">
      <CheckStoredPitch />
      <PitchWizard userId={userId} initialStep={validStep} />
    </div>
  )
}
