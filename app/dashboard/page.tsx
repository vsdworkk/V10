/**
 * @description
 * This server page displays all pitches belonging to the authenticated user.
 * It fetches data from the database using a server action, then passes it
 * to a client component (`pitch-list.tsx`) for rendering.
 *
 * Key features:
 * - Auth check using Clerk's `auth()`
 * - Database fetch via `getAllPitchesForUserAction`
 * - Returns a user-friendly UI with a list of all pitches
 * - Includes a button to create a new pitch, which directs to `/dashboard/new`
 *
 * @dependencies
 * - `@clerk/nextjs/server` for user authentication
 * - `@/actions/db/pitches-actions` for accessing pitch records
 * - `pitch-list.tsx` client component for rendering the list
 *
 * @notes
 * - Relies on `dashboard/layout.tsx` to display a sidebar
 * - If the fetch fails, displays an error message. If no pitches are found, displays a friendly empty state
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getAllPitchesForUserAction } from "@/actions/db/pitches-actions"
import { Suspense } from "react"
import PitchList from "@/app/dashboard/_components/pitch-list"

/**
 * @function DashboardPage
 * @description
 * Server component that fetches all of a user's pitches and renders them
 * in a client component. If the user is not authenticated, redirects to /login.
 *
 * @returns JSX Element displaying pitch list or an error message
 *
 * @notes
 * - Utilizes Suspense for future expansions if needed (e.g., loading states).
 * - The actual UI rendering is deferred to `pitch-list.tsx`.
 */
export default async function DashboardPage() {
  const { userId } = await auth()

  // If no user is logged in, rely on an extra redirect for safety
  if (!userId) {
    redirect("/login")
  }

  // Fetch all pitches for this user
  const pitchesRes = await getAllPitchesForUserAction(userId)

  // If the DB action fails, display an error
  if (!pitchesRes.isSuccess) {
    return (
      <div className="text-red-500">
        <p>Error loading your pitches:</p>
        <p>{pitchesRes.message}</p>
      </div>
    )
  }

  // Wrap the client component in Suspense (optional usage here)
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
      <PitchList pitches={pitchesRes.data} />
    </Suspense>
  )
}