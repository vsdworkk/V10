/**
 * app/dashboard/_components/pitch-table.tsx
 * Lists pitches with search and filters. Provides Actions menu to export as PDF or DOCX.
 */
"use client"

import { useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { SelectPitch } from "@/db/schema/pitches-schema"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  Download,
  Filter,
  MoreVertical,
  Calendar,
  Building,
  User
} from "lucide-react"

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
      alert(
        "No content available to export. Please ensure the pitch has\ncontent."
      )
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
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
          })
          .save()
      } catch (error) {
        console.error("Error loading PDF library:", error)
        alert("Error loading PDF export. Please try again.")
      }
    } else {
      try {
        const fileSaverModule = await import("file-saver")
        const { Document, Packer, Paragraph, TextRun } = await import("docx")
        const saveAs =
          (fileSaverModule as any).default || (fileSaverModule as any).saveAs
        if (typeof saveAs !== "function") {
          throw new Error("file-saver saveAs not available")
        }

        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = content

        // Build DOCX content from basic HTML structure
        const docParagraphs: any[] = []

        const processElement = (element: Element): void => {
          const tagName = element.tagName.toLowerCase()
          const text = element.textContent?.trim() || ""
          if (!text) return

          switch (tagName) {
            case "h1":
            case "h2":
            case "h3":
              docParagraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text,
                      bold: true,
                      size: tagName === "h1" ? 32 : tagName === "h2" ? 28 : 24
                    })
                  ],
                  spacing: { after: 200 }
                })
              )
              break
            case "p": {
              const children: any[] = []
              if (element.querySelector("strong, b")) {
                element.childNodes.forEach(node => {
                  if ((node as any).nodeType === Node.TEXT_NODE) {
                    const nodeText = node.textContent?.trim()
                    if (nodeText) children.push(new TextRun(nodeText))
                  } else if ((node as any).nodeType === Node.ELEMENT_NODE) {
                    const el = node as Element
                    const nodeText = el.textContent?.trim()
                    if (nodeText) {
                      const isBold =
                        el.tagName.toLowerCase() === "strong" ||
                        el.tagName.toLowerCase() === "b"
                      const isItalic =
                        el.tagName.toLowerCase() === "em" ||
                        el.tagName.toLowerCase() === "i"
                      children.push(
                        new TextRun({
                          text: nodeText,
                          bold: isBold,
                          italics: isItalic
                        })
                      )
                    }
                  }
                })
              } else {
                children.push(new TextRun(text))
              }

              if (children.length > 0) {
                docParagraphs.push(
                  new Paragraph({ children, spacing: { after: 120 } })
                )
              }
              break
            }
            case "li":
              docParagraphs.push(
                new Paragraph({
                  children: [new TextRun(`• ${text}`)],
                  spacing: { after: 80 }
                })
              )
              break
            default:
              if (text && !["ul", "ol", "div"].includes(tagName)) {
                docParagraphs.push(
                  new Paragraph({
                    children: [new TextRun(text)],
                    spacing: { after: 120 }
                  })
                )
              }
          }
        }

        Array.from(tempDiv.children).forEach(processElement)

        if (docParagraphs.length === 0) {
          const plainText = tempDiv.textContent || tempDiv.innerText || ""
          if (plainText.trim()) {
            const paragraphs = plainText
              .split(/\n\s*\n|\. (?=[A-Z])/)
              .filter(p => p.trim())
            paragraphs.forEach(t => {
              docParagraphs.push(
                new Paragraph({
                  children: [new TextRun(t.trim())],
                  spacing: { after: 120 }
                })
              )
            })
          }
        }

        const doc = new Document({
          sections: [
            {
              properties: {},
              children:
                docParagraphs.length > 0
                  ? docParagraphs
                  : [
                      new Paragraph({
                        children: [new TextRun("No content available")]
                      })
                    ]
            }
          ]
        })

        const blob = await Packer.toBlob(doc)
        saveAs(blob, `${pitch.roleName}.docx`)
      } catch (error: any) {
        console.error("Error creating Word document:", error)
        alert("Error creating Word document. Please try again.")
      }
    }
  }

  // Filters
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
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold md:text-2xl">
          {`Welcome ${user?.firstName ?? ""}`}
        </h2>
        <p className="text-sm text-gray-800">
          We're committed to helping you create the best pitch. For questions or
          help using the wizard, contact support@apspitchpro.com
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search pitches."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full shadow-sm"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 whitespace-nowrap shadow-sm"
            >
              <Filter className="size-4" />
              <span>Filter</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-3" align="end">
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
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">No pitches found</p>
          <p className="mt-1 text-sm text-gray-400">
            Try adjusting your search criteria or create a new pitch
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-4 md:hidden">
            {filteredPitches.map(pitch => (
              <Card
                key={pitch.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold leading-tight">
                        {pitch.roleName?.trim() ? pitch.roleName : "Untitled"}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="size-3" />
                        <span>
                          {pitch.roleLevel?.trim()
                            ? pitch.roleLevel
                            : "Untitled"}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={`text-xs ${getStatusColor(pitch.status)}`}
                    >
                      {pitch.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="size-3" />
                      <span>
                        {pitch.organisationName?.trim()
                          ? pitch.organisationName
                          : "Untitled"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="size-3" />
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleExport(pitch, "doc")}
                          >
                            <Download className="mr-2 size-4" />
                            Export as DOCX
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-md border bg-white md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-4 text-left font-medium text-gray-700">
                    Role
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700">
                    Level
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700">
                    Organisation
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700">
                    Status
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700">
                    Created
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPitches.map(pitch => (
                  <tr key={pitch.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <Link
                        href={`/dashboard/${pitch.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {pitch.roleName?.trim() ? pitch.roleName : "Untitled"}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-600">
                      {pitch.roleLevel?.trim() ? pitch.roleLevel : "Untitled"}
                    </td>
                    <td className="p-4 text-gray-600">
                      {pitch.organisationName?.trim()
                        ? pitch.organisationName
                        : "Untitled"}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={`text-xs ${getStatusColor(pitch.status)}`}
                      >
                        {pitch.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDate(pitch.createdAt)}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleExport(pitch, "doc")}
                          >
                            <Download className="mr-2 size-4" />
                            Export as DOCX
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
