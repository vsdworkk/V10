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
 *
 * @dependencies
 * - Next.js Link for navigation
 * - Shadcn UI components (Card, Button) for consistent design
 *
 * @notes
 * - If no pitches are found, displays an empty state message
 * - Additional styling or features can be added (e.g. sorting, searching)
 */

"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SelectPitch } from "@/db/schema/pitches-schema"
import { useMemo } from "react"

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
 */
export default function PitchList({ pitches }: PitchListProps) {
  // Optional: sorting or filtering logic can happen here
  const sortedPitches = useMemo(() => {
    // Example: sort by updatedAt descending
    return pitches.slice().sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime()
      const dateB = new Date(b.updatedAt).getTime()
      return dateB - dateA
    })
  }, [pitches])

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
                <CardTitle>{pitch.roleName}</CardTitle>
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

                {/* Link to a pitch detail/edit page */}
                <Link href={`/dashboard/${pitch.id}`}>
                  <Button variant="outline" size="sm">
                    Edit Pitch
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}