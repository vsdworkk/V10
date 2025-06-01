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
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Mobile Card Skeletons - Hidden on md and up */}
      <div className="space-y-4 md:hidden">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="size-8" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Skeleton - Hidden on mobile */}
      <div className="hidden rounded-md border md:block">
        <div className="grid grid-cols-6 gap-4 border-b p-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="grid grid-cols-6 gap-4 border-b p-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-20" />
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
