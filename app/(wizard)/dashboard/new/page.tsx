/**
 * @description
 * Server page for "/dashboard/new". It ensures the user is authenticated
 * and renders the multi-step wizard to create a new pitch.
 *
 * Key Features:
 * - Auth check using Clerk's `auth()`
 * - Renders `PitchWizard` client component
 * - Mobile-first responsive design
 *
 * @dependencies
 * - `auth` from "@clerk/nextjs/server" for user authentication
 * - `redirect` from "next/navigation" to handle unauthorized access
 * - `PitchWizard` from "@/app/dashboard/new/_components/pitch-wizard"
 *
 * @notes
 * - The wizard is a multi-step process collecting role/experience/STAR data
 * - Actual DB insertion is done by calling "/api/pitches" in the final step
 * - Layout is mobile-first with responsive breakpoints
 */

"use server"

import { redirect } from "next/navigation"

export default async function CreateNewPitchPage() {
  redirect("/dashboard/new/1")
}
