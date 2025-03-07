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
 * - OPTIMIZATION: Uses the auth check from layout and implements better loading states
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { getAllPitchesForUserAction } from "@/actions/db/pitches-actions"
import { Suspense } from "react"
import PitchList from "@/app/dashboard/_components/pitch-list"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * PitchListSkeleton component for showing a loading state
 */
function PitchListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * PitchListFetcher component that fetches and renders the pitch list
 */
async function PitchListFetcher() {
  const { userId } = await auth()
  
  // This should never happen since the layout already checks for auth,
  // but we handle it for type safety
  if (!userId) {
    return (
      <div className="text-red-500">
        <p>Authentication error:</p>
        <p>User ID not found. Please try logging in again.</p>
      </div>
    )
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

  return <PitchList pitches={pitchesRes.data} />
}

/**
 * @function DashboardPage
 * @description
 * Server component that fetches all of a user's pitches and renders them
 * in a client component. If the user is not authenticated, redirects to /login.
 *
 * @returns JSX Element displaying pitch list or an error message
 *
 * @notes
 * - Utilizes Suspense for loading states.
 * - The actual UI rendering is deferred to `pitch-list.tsx`.
 */
export default async function DashboardPage() {
  return (
    <Suspense fallback={<PitchListSkeleton />}>
      <PitchListFetcher />
    </Suspense>
  )
}