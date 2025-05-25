"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { SelectPitch } from "@/db/schema/pitches-schema"
import { Download, Filter } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { useState } from "react"
import html2pdf from "html2pdf.js"
import { saveAs } from "file-saver"
import { Document, Packer, Paragraph } from "docx"

interface PitchTableProps {
  pitches: SelectPitch[]
  credits: number
}

export default function PitchTable({ pitches, credits }: PitchTableProps) {
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [orgFilter, setOrgFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  function handleExport(pitch: SelectPitch, format: "pdf" | "doc") {
    const content = pitch.pitchContent || ""
    if (format === "pdf") {
      const el = document.createElement("div")
      el.innerText = content
      html2pdf()
        .from(el)
        .set({ filename: `${pitch.roleName}.pdf` })
        .save()
    } else {
      const doc = new Document({
        sections: [{ children: [new Paragraph(content)] }]
      })
      Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${pitch.roleName}.docx`)
      })
    }
  }

  // Filter pitches based on search query and selected filters
  const filteredPitches = pitches.filter(pitch => {
    const searchMatch =
      pitch.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pitch.roleLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pitch.organisationName &&
        pitch.organisationName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))

    const roleMatch = roleFilter
      ? pitch.roleName.toLowerCase().includes(roleFilter.toLowerCase())
      : true
    const orgMatch = orgFilter
      ? (pitch.organisationName || "")
          .toLowerCase()
          .includes(orgFilter.toLowerCase())
      : true
    const statusMatch =
      statusFilter === "all"
        ? true
        : statusFilter === "completed"
          ? pitch.status !== "draft"
          : pitch.status === statusFilter

    return searchMatch && roleMatch && orgMatch && statusMatch
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {`Welcome ${user?.firstName ?? ""}`}
        </h2>

        <div className="flex flex-col items-end">
          <Link href="/dashboard/new?new=true">
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <span className="mr-2">+</span> Create New Pitch
            </Button>
          </Link>
          <Badge variant="secondary" className="mt-2 text-xs">
            {credits} credits remaining
          </Badge>
        </div>
      </div>

      <p className="text-gray-600 text-sm">
        View and manage your pitches below
      </p>

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Search pitches..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-3 pr-4 py-1.5 w-full shadow-sm"
          />
        </div>
        <div className="flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 shadow-sm"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="space-y-3 w-64" align="end">
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Role</label>
                <Input
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  placeholder="Role name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Organisation</label>
                <Input
                  value={orgFilter}
                  onChange={e => setOrgFilter(e.target.value)}
                  placeholder="Organisation"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="border rounded-md shadow-md overflow-hidden">
        <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 border-b font-medium text-gray-500 text-sm">
          <div>ROLE</div>
          <div>ORGANISATION</div>
          <div>STATUS</div>
          <div>EXPORT</div>
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
                className="grid grid-cols-4 gap-4 p-2.5 items-center hover:bg-gray-50 transition-colors"
              >
                {/* Role Name */}
                <div>
                  <Link
                    href={
                      pitch.status === "draft"
                        ? `/dashboard/new/${pitch.id}`
                        : `/dashboard/${pitch.id}`
                    }
                    className="font-medium hover:underline text-blue-600"
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
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      pitch.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {pitch.status === "draft" ? "Draft" : "Completed"}
                  </span>
                </div>

                {/* Export */}
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto hover:bg-gray-100 rounded-full"
                      >
                        <Download className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => handleExport(pitch, "pdf")}
                      >
                        Export PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleExport(pitch, "doc")}
                      >
                        Export Word
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredPitches.length > 0 && (
          <div className="p-2 border-t text-xs text-gray-500 bg-gray-50">
            Showing 1 to {filteredPitches.length} of {filteredPitches.length}{" "}
            results
          </div>
        )}
      </div>
    </div>
  )
}
