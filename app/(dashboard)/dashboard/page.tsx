/**
 * @description
 * This server page displays all pitches belonging to the authenticated user.
 * It fetches data from the database using a server action, then passes it
 * to a client component (`pitch-table.tsx`) for rendering.
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
 * - `pitch-table.tsx` client component for rendering the list
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
import PitchTable from "@/app/(dashboard)/dashboard/_components/pitch-table"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * PitchTableSkeleton component for showing a loading state
 */
function PitchTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="mb-4 h-4 w-full max-w-md" />
      <div className="mb-4 flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="rounded-md border">
        <div className="grid grid-cols-4 gap-4 border-b p-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="grid grid-cols-4 gap-4 border-b p-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * PitchTableFetcher component that fetches and renders the pitch table
 */
async function PitchTableFetcher() {
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

  return <PitchTable pitches={pitchesRes.data} />
}

/**
 * @function DashboardPage
 * @description
 * Server component that fetches all of a user's pitches and renders them
 * in a client component. If the user is not authenticated, redirects to /login.
 *
 * @returns JSX Element displaying pitch table or an error message
 *
 * @notes
 * - Utilizes Suspense for loading states.
 * - The actual UI rendering is deferred to `pitch-table.tsx`.
 */
export default async function DashboardPage() {
  return (
    <Suspense fallback={<PitchTableSkeleton />}>
      <PitchTableFetcher />
    </Suspense>
  )
}
