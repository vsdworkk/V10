/**
 * Page: /dashboard/new
 * Runs on the server, ensures authentication.
 */
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import PitchWizardWrapper from "./components/wizard/wizard-wrapper"

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

  // hand off to a client wrapper
  return (
    <div className="size-full">
      <PitchWizardWrapper userId={userId} initialStep={validStep} />
    </div>
  )
}
