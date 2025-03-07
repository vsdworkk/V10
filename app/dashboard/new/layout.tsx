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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Subtle background pattern */}
      <div 
        className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Top navigation bar with back button */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto py-4 px-4 sm:px-6">
          <div className="flex items-center">
            <a 
              href="/dashboard" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
      
      <main className="py-8 relative z-0">
        {children}
      </main>
      
      {/* Footer with helpful information */}
      <footer className="border-t bg-background/80 backdrop-blur-sm py-6">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Need help? Contact support at support@example.com</p>
            <p className="mt-1">© 2024 APS Pitch Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 