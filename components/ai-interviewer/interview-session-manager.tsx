// Client component to manage interview sessions list and creation dialog.
// Interview Type is fixed to behavioral, duration fixed to 15 minutes,
// and custom instructions are not collected.
"use client"

import React, { useState } from "react"
import {
  SelectInterviewSession,
  InsertInterviewSession
} from "@/db/schema/interview-sessions-schema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  Building2,
  User,
  Plus,
  Trash2,
  Play,
  Eye
} from "lucide-react"
import { toast } from "sonner"
import {
  createInterviewSessionAction,
  deleteInterviewSessionAction
} from "@/actions/db/interview-sessions-actions"

interface InterviewSessionManagerProps {
  sessions: SelectInterviewSession[]
  onSessionsUpdate: () => void
  onStartInterview: (session: SelectInterviewSession) => void
}

// Local form state for creating a session. We've simplified the form to
// only collect core fields; type, duration, and custom instructions are
// now fixed defaults.
interface CreateSessionForm {
  jobTitle: string
  companyName: string
  jobDescription: string
}

export default function InterviewSessionManager({
  sessions,
  onSessionsUpdate,
  onStartInterview
}: InterviewSessionManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateSessionForm>({
    jobTitle: "",
    companyName: "",
    jobDescription: ""
  })

  const handleCreateSession = async () => {
    if (!formData.jobTitle.trim()) {
      toast.error("Job title is required")
      return
    }

    setIsLoading(true)
    try {
      const sessionData: Omit<InsertInterviewSession, "userId"> = {
        jobTitle: formData.jobTitle,
        companyName: formData.companyName || null,
        jobDescription: formData.jobDescription || null,
        interviewType: "behavioral", // fixed default
        duration: 15, // fixed default (minutes)
        customInstructions: null, // removed from form
        status: "scheduled"
      }

      const result = await createInterviewSessionAction(sessionData)

      if (result.isSuccess) {
        toast.success("Interview session created successfully!")
        setIsCreateDialogOpen(false)
        setFormData({
          jobTitle: "",
          companyName: "",
          jobDescription: ""
        })
        onSessionsUpdate()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to create interview session")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this interview session?")) {
      return
    }

    try {
      const result = await deleteInterviewSessionAction(sessionId)
      if (result.isSuccess) {
        toast.success("Interview session deleted successfully!")
        onSessionsUpdate()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to delete interview session")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "in_progress":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not set"
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Interview Sessions
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your AI interview practice sessions
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="h-10 justify-start px-3 text-sm text-white shadow-sm transition-all hover:brightness-110"
              style={{ backgroundColor: "#444ec1" }}
            >
              <Plus className="mr-2 size-4" />
              New Practice Interview
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Interview Session</DialogTitle>
              <DialogDescription>
                Set up a new AI interview practice session
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.jobTitle}
                  onChange={e =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Tech Corp"
                  value={formData.companyName}
                  onChange={e =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the full job description here. This will help the AI interviewer ask more relevant questions..."
                  value={formData.jobDescription}
                  onChange={e =>
                    setFormData({ ...formData, jobDescription: e.target.value })
                  }
                  rows={4}
                  className="resize-y"
                />
                <p className="mt-1 text-xs text-slate-500">
                  The AI interviewer will use this to ask targeted questions
                  about the specific requirements and responsibilities.
                </p>
              </div>

              {/* Interview Type, Duration, and Custom Instructions removed.
                  Defaults applied on create: behavioral, 15 minutes, no custom instructions. */}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSession}
                  disabled={isLoading}
                  className="h-10 justify-start px-3 text-sm text-white shadow-sm transition-all hover:brightness-110"
                  style={{ backgroundColor: "#444ec1" }}
                >
                  {isLoading ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="mb-4 size-12 text-slate-400" />
            <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">
              No interview sessions yet
            </h3>
            <p className="mb-4 text-center text-slate-600 dark:text-slate-400">
              Create your first AI interview session to start practicing
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map(session => (
            <Card
              key={session.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {session.jobTitle}
                      </h3>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-3 dark:text-slate-400">
                      {session.companyName && (
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4" />
                          <span>{session.companyName}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Clock className="size-4" />
                        <span>{session.duration} minutes</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        <span>{formatDate(session.createdAt)}</span>
                      </div>
                    </div>

                    {session.jobDescription && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Job Description:</span>{" "}
                        {session.jobDescription}
                      </p>
                    )}

                    {session.customInstructions && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Instructions:</span>{" "}
                        {session.customInstructions}
                      </p>
                    )}
                  </div>

                  <div className="ml-4 flex items-center gap-2">
                    {session.status === "scheduled" && (
                      <Button
                        size="sm"
                        onClick={() => onStartInterview(session)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="mr-1 size-4" />
                        Start
                      </Button>
                    )}

                    {session.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onStartInterview(session)}
                      >
                        <Eye className="mr-1 size-4" />
                        Review
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
