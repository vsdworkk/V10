"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { Download, Filter, MoreVertical, Calendar, Building, User } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { useState } from "react"

interface PitchTableProps {
  pitches: SelectPitch[]
}

export default function PitchTable({ pitches }: PitchTableProps) {
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [orgFilter, setOrgFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  async function handleExport(pitch: SelectPitch, format: "pdf" | "doc") {
    const content = pitch.pitchContent || ""
    
    if (!content.trim()) {
      alert("No content available to export. Please ensure the pitch has content.")
      return
    }
    
    if (format === "pdf") {
      try {
        const html2pdf = (await import("html2pdf.js")).default
        
        const el = document.createElement("div")
        el.innerHTML = content
        
        el.style.fontFamily = "Arial, sans-serif"
        el.style.lineHeight = "1.6"
        el.style.padding = "20px"
        el.style.maxWidth = "800px"
        
        html2pdf()
          .from(el)
          .set({ 
            filename: `${pitch.roleName}.pdf`,
            margin: 1,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
          })
          .save()
      } catch (error) {
        console.error("Error loading PDF library:", error)
        alert("Error loading PDF export. Please try again.")
      }
    } else {
      try {
        const { saveAs } = await import("file-saver")
        const { Document, Packer, Paragraph } = await import("docx")
        
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = content
        
        const textContent = tempDiv.textContent || tempDiv.innerText || ""
        
        if (!textContent.trim()) {
          alert("No text content found to export.")
          return
        }
        
        const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim())
        
        const docParagraphs = paragraphs.map(text => new Paragraph(text.trim()))
        
        const doc = new Document({
          sections: [{
            properties: {},
            children: docParagraphs.length > 0 ? docParagraphs : [new Paragraph(textContent)]
          }]
        })
        
        const blob = await Packer.toBlob(doc)
        saveAs(blob, `${pitch.roleName}.docx`)
      } catch (error: any) {
        console.error("Error creating Word document:", error)
        alert("Error creating Word document. Please try again.")
      }
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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-semibold">
          {`Welcome ${user?.firstName ?? ""}`}
        </h2>
        <p className="text-gray-600 text-sm">
          View and manage your pitches below
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search pitches..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full shadow-sm"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 shadow-sm whitespace-nowrap"
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
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Results */}
      {filteredPitches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No pitches found</p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your search criteria or create a new pitch
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View - Hidden on md and up */}
          <div className="md:hidden space-y-4">
            {filteredPitches.map((pitch) => (
              <Card key={pitch.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg leading-tight">
                        {pitch.roleName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        <span>{pitch.roleLevel}</span>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(pitch.status)}`}>
                      {pitch.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {pitch.organisationName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-3 w-3" />
                        <span>{pitch.organisationName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(pitch.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Link href={`/dashboard/${pitch.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleExport(pitch, "pdf")}>
                            <Download className="mr-2 h-4 w-4" />
                            Export as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(pitch, "doc")}>
                            <Download className="mr-2 h-4 w-4" />
                            Export as DOC
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block border rounded-md bg-white overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-700">Role</th>
                  <th className="text-left p-4 font-medium text-gray-700">Level</th>
                  <th className="text-left p-4 font-medium text-gray-700">Organisation</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Created</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPitches.map((pitch) => (
                  <tr key={pitch.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <Link 
                        href={`/dashboard/${pitch.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {pitch.roleName}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-600">{pitch.roleLevel}</td>
                    <td className="p-4 text-gray-600">{pitch.organisationName || "—"}</td>
                    <td className="p-4">
                      <Badge className={`text-xs ${getStatusColor(pitch.status)}`}>
                        {pitch.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {formatDate(pitch.createdAt)}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleExport(pitch, "pdf")}>
                            <Download className="mr-2 h-4 w-4" />
                            Export as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(pitch, "doc")}>
                            <Download className="mr-2 h-4 w-4" />
                            Export as DOC
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
