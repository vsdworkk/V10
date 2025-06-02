/**
 * @description
 * Server page for "/dashboard/new". It ensures the user is authenticated
 * and redirects to the step-based URL structure for the wizard.
 *
 * Key Features:
 * - Redirects to step-based URL structure
 * - Maintains backward compatibility
 *
 * @dependencies
 * - `redirect` from "next/navigation" to handle URL redirection
 *
 * @notes
 * - This page now redirects to the new step-based URL structure
 * - The actual wizard logic is handled in the step-specific routes
 */

"use server"

import { redirect } from "next/navigation"

export default async function CreateNewPitchPage() {
  // Redirect to the new step-based URL structure
  redirect("/dashboard/new/step/1")
}
