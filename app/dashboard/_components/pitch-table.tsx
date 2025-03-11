"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectPitch } from "@/db/schema/pitches-schema"
import { Download, Filter, PlayCircle, Edit } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface PitchTableProps {
  pitches: SelectPitch[]
}

export default function PitchTable({ pitches }: PitchTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Filter pitches based on search query
  const filteredPitches = pitches.filter(pitch => 
    pitch.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pitch.roleLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pitch.organisationName && pitch.organisationName.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Pitches</h2>

        <Link href="/dashboard/new?new=true">
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
            <span className="mr-2">+</span> Create New Pitch
          </Button>
        </Link>
      </div>

      <p className="text-gray-600 text-sm">View and manage your pitches below</p>

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Search pitches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-3 pr-4 py-1.5 w-full shadow-sm"
          />
        </div>

        <div className="flex items-center">
          <Button variant="outline" className="flex items-center gap-2 shadow-sm">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      <div className="border rounded-md shadow-md overflow-hidden">
        <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 border-b font-medium text-gray-500 text-sm">
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
            {filteredPitches.map((pitch) => (
              <div key={pitch.id} className="grid grid-cols-4 gap-4 p-2.5 items-center hover:bg-gray-50 transition-colors">
                <div>
                  <Link 
                    href={pitch.status === "draft" ? `/dashboard/new/${pitch.id}` : `/dashboard/${pitch.id}`} 
                    className="font-medium hover:underline text-blue-600"
                  >
                    {pitch.roleName}
                  </Link>
                </div>
                <div className="text-sm text-gray-600">
                  {pitch.organisationName || "Not specified"}
                </div>
                <div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    pitch.status === "draft" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {pitch.status === "draft" ? "Draft" : "Completed"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {pitch.status === "draft" ? (
                    <Link href={`/dashboard/new/${pitch.id}`}>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <PlayCircle className="h-4 w-4" />
                        <span className="text-xs">Resume</span>
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/dashboard/${pitch.id}`}>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50">
                        <Edit className="h-4 w-4" />
                        <span className="text-xs">Edit</span>
                      </Button>
                    </Link>
                  )}
                  
                  <Button variant="ghost" size="sm" className="p-1 h-auto hover:bg-gray-100 rounded-full">
                    <Download className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredPitches.length > 0 && (
          <div className="p-2 border-t text-xs text-gray-500 bg-gray-50">
            Showing 1 to {filteredPitches.length} of {filteredPitches.length} results
          </div>
        )}
      </div>
    </div>
  )
} 