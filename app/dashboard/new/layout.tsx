/**
 * @description
 * Server layout for the pitch wizard. This layout checks authentication
 * (via Clerk) and, if authenticated, displays only the main content area
 * without the sidebar.
 *
 * Key features:
 * - Auth check using Clerk's `auth()`
 * - Redirection to `/login` if the user is not signed in
 * - Renders only the main content area without the dashboard sidebar
 *
 * @dependencies
 * - Imports `auth` from "@clerk/nextjs/server" for user authentication
 * - Imports `redirect` from "next/navigation" to handle unauthorized access
 *
 * @notes
 * - This layout specifically overrides the dashboard layout to hide the sidebar
 *   during the pitch wizard flow, as requested.
 */

"use server"

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

/**
 * @interface PitchWizardLayoutProps
 * Describes the expected children to be rendered in the layout.
 */
interface PitchWizardLayoutProps {
  children: React.ReactNode
}

/**
 * @function PitchWizardLayout
 * @description
 * The layout for the pitch wizard. Checks user authentication
 * and renders only the main content area without the sidebar.
 *
 * @param {PitchWizardLayoutProps} param0 - Children to be displayed in the layout
 * @returns A JSX element containing only the main content
 *
 * @notes
 * - If not authenticated, redirects to `/login`.
 */
export default async function PitchWizardLayout({
  children
}: PitchWizardLayoutProps) {
  const { userId } = await auth()

  // If there's no user, redirect to sign in.
  if (!userId) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">{children}</main>
    </div>
  )
} 