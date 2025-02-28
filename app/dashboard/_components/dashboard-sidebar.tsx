/**
 * @description
 * Server component providing a sidebar for the dashboard area.
 * It displays navigation links for pitch management, such as viewing
 * existing pitches or starting a new pitch wizard.
 *
 * Key features:
 * - Simple vertical list of navigation links relevant to pitch building.
 * - Integrates seamlessly into the dashboard layout.
 *
 * @dependencies
 * - This component currently only uses standard Next.js links,
 *   no external dependencies.
 *
 * @notes
 * - It’s a server component for now; any future interactive or dynamic
 *   behavior may require converting it to a client component if needed.
 * - The actual routes (/dashboard, /dashboard/new) will be implemented
 *   in later steps (5, 6, etc.).
 */

"use server"

import Link from "next/link"
import { auth } from "@clerk/nextjs/server"

/**
 * @function DashboardSidebar
 * @returns JSX element rendering a vertical sidebar with placeholder nav links
 * @notes
 * - We'll rely on Clerk for user info if we need to conditionally display items.
 * - For now, we just show a static list of links for pitch management.
 */
export default async function DashboardSidebar() {
  // Example: If we needed user info
  const { userId } = await auth()

  // We won't do anything special yet, but you could check user membership here
  // or fetch user data to display in the sidebar.

  return (
    <div className="w-64 flex-shrink-0 border-r bg-card p-4">
      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="block rounded px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          All Pitches
        </Link>

        <Link
          href="/dashboard/new"
          className="block rounded px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Create New Pitch
        </Link>
      </nav>
    </div>
  )
}