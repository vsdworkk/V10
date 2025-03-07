"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectPitch } from "@/db/schema/pitches-schema"
import { Download, Filter } from "lucide-react"
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
    pitch.roleLevel.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your Pitches</h2>

        <Link href="/dashboard/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <span className="mr-2">+</span> Create New Pitch
          </Button>
        </Link>
      </div>

      <p className="text-gray-600">View and manage your pitches below</p>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Search pitches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-3 pr-4 py-2 w-full"
          />
        </div>

        <div className="flex items-center">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b font-medium text-gray-500">
          <div>ROLE</div>
          <div>COMPANY</div>
          <div>STATUS</div>
          <div>EXPORT</div>
        </div>

        {filteredPitches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pitches found. Create your first pitch to get started!
          </div>
        ) : (
          <div className="divide-y">
            {filteredPitches.map((pitch) => (
              <div key={pitch.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                <div>
                  <Link href={`/dashboard/${pitch.id}`} className="font-medium hover:underline">
                    {pitch.roleName}
                  </Link>
                </div>
                <div>
                  {pitch.roleDescription || "Not specified"}
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    pitch.status === "draft" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {pitch.status === "draft" ? "Draft" : "Completed"}
                  </span>
                </div>
                <div>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <Download className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredPitches.length > 0 && (
          <div className="p-4 border-t text-sm text-gray-500">
            Showing 1 to {filteredPitches.length} of {filteredPitches.length} results
          </div>
        )}
      </div>
    </div>
  )
} 