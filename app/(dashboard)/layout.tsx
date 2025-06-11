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
import { SidebarProvider } from "@/components/ui/sidebar"
import MobileHeader from "./dashboard/_components/mobile-header"
import DesktopHeader from "./dashboard/_components/desktop-header"

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
    <SidebarProvider>
      <div
        className="relative flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-purple-50"
        style={{
          background:
            "linear-gradient(to bottom right, #f8fafc, #ffffff, #faf5ff)"
        }}
      >
        {/* Subtle grid-pattern overlay */}
        <div
          className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <DashboardSidebar userId={userId} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header - Only visible on mobile */}
          <MobileHeader />

          {/* Desktop Header - Only visible on desktop */}
          <DesktopHeader />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
              <div className="relative z-10 rounded-lg bg-white p-4 shadow-sm md:p-6 lg:p-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
