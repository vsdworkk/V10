"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectPitch } from "@/db/schema/pitches-schema"
import { Download, Filter, PlayCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface PitchTableProps {
  pitches: SelectPitch[]
}

export default function PitchTable({ pitches }: PitchTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter pitches based on search query
  const filteredPitches = pitches.filter(
    pitch =>
      pitch.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pitch.roleLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pitch.organisationName &&
        pitch.organisationName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Pitches</h2>

        <Link href="/dashboard/new?new=true">
          <Button className="bg-blue-600 shadow-sm hover:bg-blue-700">
            <span className="mr-2">+</span> Create New Pitch
          </Button>
        </Link>
      </div>

      <p className="text-sm text-gray-600">
        View and manage your pitches below
      </p>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Search pitches..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full py-1.5 pl-3 pr-4 shadow-sm"
          />
        </div>
        <div className="flex items-center">
          <Button
            variant="outline"
            className="flex items-center gap-2 shadow-sm"
          >
            <Filter className="size-4" />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border shadow-md">
        <div className="grid grid-cols-4 gap-4 border-b bg-gray-50 p-3 text-sm font-medium text-gray-500">
          <div>ROLE</div>
          <div>ORGANISATION</div>
          <div>STATUS</div>
          <div>ACTIONS</div>
        </div>

        {filteredPitches.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pitches found. Create your first pitch to get started!
          </div>
        ) : (
          <div className="divide-y">
            {filteredPitches.map(pitch => (
              <div
                key={pitch.id}
                className="grid grid-cols-4 items-center gap-4 p-2.5 transition-colors hover:bg-gray-50"
              >
                {/* Role Name */}
                <div>
                  <Link
                    href={
                      pitch.status === "draft"
                        ? `/dashboard/new/${pitch.id}`
                        : `/dashboard/${pitch.id}`
                    }
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {pitch.roleName}
                  </Link>
                </div>

                {/* Organisation */}
                <div className="text-sm text-gray-600">
                  {pitch.organisationName || "Not specified"}
                </div>

                {/* Status Badge */}
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      pitch.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {pitch.status === "draft" ? "Draft" : "Completed"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {/* Resume button only for drafts */}
                  {pitch.status === "draft" && (
                    <Link href={`/dashboard/new/${pitch.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <PlayCircle className="size-4" />
                        <span className="text-xs">Resume</span>
                      </Button>
                    </Link>
                  )}

                  {/* Download button always available */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto rounded-full p-1 hover:bg-gray-100"
                  >
                    <Download className="size-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredPitches.length > 0 && (
          <div className="border-t bg-gray-50 p-2 text-xs text-gray-500">
            Showing 1 to {filteredPitches.length} of {filteredPitches.length}{" "}
            results
          </div>
        )}
      </div>
    </div>
  )
}
