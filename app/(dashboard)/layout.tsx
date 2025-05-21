/**
 * @description
 * Server layout for all `/dashboard` pages. This layout checks authentication
 * (via Clerk) and, if authenticated, displays a sidebar plus the main area
 * for pitch management features.
 *
 * Key features:
 * - Auth check with Clerk's `auth()`.
 * - Redirection to `/login` if the user is not signed in.
 * - Renders the dashboard sidebar in a left column and the route's `children` in the main area.
 *
 * @dependencies
 * - Imports `auth` from "@clerk/nextjs/server" to verify user sessions.
 * - Imports `redirect` from "next/navigation" to handle unauthenticated access.
 * - Imports `DashboardSidebar` from `/_components` to show pitch nav links.
 *
 * @notes
 * - Future steps will fill in the actual pitch routes in the main area.
 * - Currently, the sidebar is minimal and references placeholders.
 * - If you want to rely solely on the `middleware.ts` for route protection, you could remove the redirect logic here, but this double-check helps ensure security.
 * - OPTIMIZATION: We perform a single auth check here and pass the userId to children components to avoid redundant auth checks.
 */

"use server"

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import DashboardSidebar from "./dashboard/_components/dashboard-sidebar"

/**
 * @interface DashboardLayoutProps
 * Describes the expected children to be rendered in the layout.
 */
interface DashboardLayoutProps {
  children: React.ReactNode
}

/**
 * @function DashboardLayout
 * @description
 * The main server layout for `/dashboard`. Checks user authentication
 * and renders a sidebar plus the main content area.
 *
 * @param {DashboardLayoutProps} param0 - Children to be displayed in the layout
 * @returns A JSX element containing the sidebar and the main content
 *
 * @notes
 * - If not authenticated, redirects to `/login`.
 */
export default async function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const { userId } = await auth()

  // If there's no user, redirect to sign in.
  if (!userId) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar userId={userId} />

      <main className="m-4 flex-1 rounded-lg bg-white p-8 shadow-sm">
        {children}
      </main>
    </div>
  )
}
