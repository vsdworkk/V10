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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 relative" style={{background: 'linear-gradient(to bottom right, #f8fafc, #ffffff, #faf5ff)'}}>
      {/* Subtle grid-pattern overlay */}
      <div
        className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <DashboardSidebar userId={userId} />

      <main className="flex-1 p-8 bg-white shadow-sm m-4 rounded-lg relative z-10">
        {children}
      </main>
    </div>
  )
}