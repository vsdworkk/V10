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
 * - It's a server component for now; any future interactive or dynamic
 *   behavior may require converting it to a client component if needed.
 * - The actual routes (/dashboard, /dashboard/new) will be implemented
 *   in later steps (5, 6, etc.).
 * - OPTIMIZATION: Now accepts userId as a prop to avoid redundant auth checks.
 */

"use server"

import Link from "next/link"
import { FileText, Plus } from "lucide-react"

/**
 * @interface DashboardSidebarProps
 * Defines the props for the DashboardSidebar component.
 */
interface DashboardSidebarProps {
  userId: string
}

/**
 * @function DashboardSidebar
 * @returns JSX element rendering a vertical sidebar with placeholder nav links
 * @notes
 * - We'll rely on Clerk for user info if we need to conditionally display items.
 * - For now, we just show a static list of links for pitch management.
 */
export default async function DashboardSidebar({ userId }: DashboardSidebarProps) {
  // We won't do anything special yet, but you could check user membership here
  // or fetch user data to display in the sidebar.

  return (
    <div className="w-64 flex-shrink-0 border-r bg-white shadow-sm">
      <div className="p-5 border-b">
        <h1 className="text-xl font-bold text-gray-800">Pitch Manager</h1>
      </div>

      <nav className="p-3 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          <FileText className="h-4 w-4" />
          All Pitches
        </Link>

        <Link
          href="/dashboard/new?new=true"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create New Pitch
        </Link>
      </nav>
    </div>
  )
}