/**
 * @description
 * This client component receives a list of pitches as props and renders them
 * in a simple layout. Each pitch shows minimal metadata (role, status, etc.)
 * and an "Edit Pitch" button that links to `/dashboard/[pitchId]`.
 *
 * Key features:
 * - Displays pitches in a responsive card grid
 * - Button for creating a new pitch (`/dashboard/new`)
 * - Button/link for editing an existing pitch (`/dashboard/[pitchId]`)
 * - Uses client-side caching for better performance on subsequent loads
 *
 * @dependencies
 * - Next.js Link for navigation
 * - Shadcn UI components (Card, Button) for consistent design
 * - useCachedData hook for data caching
 *
 * @notes
 * - If no pitches are found, displays an empty state message
 * - Additional styling or features can be added (e.g. sorting, searching)
 */

"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SelectPitch } from "@/db/schema/pitches-schema"
import { useMemo, useEffect } from "react"
import { useCachedData } from "@/lib/hooks/use-cached-data"
import { PlayCircle, Edit } from "lucide-react"

/**
 * @interface PitchListProps
 * Defines the shape of the props expected by PitchList.
 */
interface PitchListProps {
  pitches: SelectPitch[]
}

/**
 * @function PitchList
 * @description
 * A client component that displays the user's pitches in a card layout.
 * Also includes a 'Create New Pitch' button for convenience.
 *
 * @param {PitchListProps} props - The list of pitches to display.
 * @returns JSX Element with pitch details
 *
 * @notes
 * - If pitches is empty, shows a friendly "no pitches found" message.
 * - Uses client-side caching for better performance on subsequent loads.
 */
export default function PitchList({ pitches }: PitchListProps) {
  // Use our cached data hook to store the pitches in client-side cache
  const { data: cachedPitches, refetch } = useCachedData<SelectPitch[]>(
    'user-pitches',
    async () => pitches,
    { enabled: false } // Don't fetch on mount, we already have the data
  )

  // Update cache when props change
  useEffect(() => {
    if (pitches) {
      refetch()
    }
  }, [pitches, refetch])

  // Use cached data if available, otherwise use props
  const pitchesToDisplay = cachedPitches || pitches

  // Optional: sorting or filtering logic can happen here
  const sortedPitches = useMemo(() => {
    // Example: sort by updatedAt descending
    return pitchesToDisplay.slice().sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime()
      const dateB = new Date(b.updatedAt).getTime()
      return dateB - dateA
    })
  }, [pitchesToDisplay])

  return (
    <div className="space-y-4">
      {/* Header row with "Create Pitch" button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Pitches</h2>

        <Link href="/dashboard/new">
          <Button>Create New Pitch</Button>
        </Link>
      </div>

      {/* If no pitches, show a friendly message */}
      {sortedPitches.length === 0 ? (
        <p className="text-muted-foreground mt-4">No pitches found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedPitches.map(pitch => (
            <Card key={pitch.id}>
              <CardHeader>
                <Link href={pitch.status === "draft" ? `/dashboard/new/${pitch.id}` : `/dashboard/${pitch.id}`}>
                  <CardTitle className="hover:text-blue-600 transition-colors">{pitch.roleName}</CardTitle>
                </Link>
                <CardDescription>
                  Status: <span className="capitalize">{pitch.status}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Role Level: {pitch.roleLevel}
                </p>
                <p className="text-muted-foreground text-sm">
                  Word Limit: {pitch.pitchWordLimit}
                </p>
                <p className="text-muted-foreground text-sm">
                  Last Updated: {new Date(pitch.updatedAt).toLocaleString()}
                </p>
              </CardContent>

              <CardFooter className="flex gap-2">
                {/* Resume button for draft pitches */}
                {pitch.status === "draft" && (
                  <Link href={`/dashboard/new/${pitch.id}`}>
                    <Button variant="secondary" size="sm">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  </Link>
                )}
                

              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}