"use client"

import React, { useState } from "react"
import { CVIProvider } from "@/app/components/cvi/components/cvi-provider"
import { Conversation } from "@/app/components/cvi/components/conversation"
import { SelectInterviewSession } from "@/db/schema/interview-sessions-schema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Video,
  Mic,
  Clock,
  Building2,
  User,
  BarChart3
} from "lucide-react"
import { toast } from "sonner"
import InterviewAnalyticsDashboard from "./interview-analytics-dashboard"

interface AIInterviewerInterfaceProps {
  session: SelectInterviewSession
  onSessionUpdate?: (session: SelectInterviewSession) => void
  onLeave?: () => void
}

// ──────────────────────────────────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────────────────────────────────
const formatDuration = (minutes: number) => {
  if (!minutes) return "—"
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h${m ? ` ${m}m` : ""}`
}

const formatDate = (date: Date | string | null) => {
  if (!date) return "Not available"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function StatusBadge({ status }: { status: SelectInterviewSession["status"] }) {
  const map: Record<string, string> = {
    scheduled: "bg-muted text-muted-foreground",
    in_progress: "bg-blue-600 text-white",
    completed: "bg-emerald-600 text-white",
    canceled: "bg-destructive text-destructive-foreground"
  }
  const label = String(status).replace("_", " ").toUpperCase()
  return (
    <Badge className={`px-2.5 py-0.5 text-xs ${map[status] || "bg-muted"}`}>
      {label}
    </Badge>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Details panel
// ──────────────────────────────────────────────────────────────────────────────
function SessionDetailsView({ session }: { session: SelectInterviewSession }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session information</CardTitle>
          <CardDescription>Metadata for this interview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail
              label="Position"
              icon={Building2}
              value={session.jobTitle}
            />
            {session.companyName && (
              <Detail label="Company" icon={User} value={session.companyName} />
            )}
            <Detail
              label="Interview type"
              icon={Video}
              value={session.interviewType}
              cap
            />
            <Detail
              label="Duration"
              icon={Clock}
              value={formatDuration(session.duration || 30)}
            />
            <Detail
              label="Started"
              icon={Clock}
              value={formatDate(session.startedAt)}
            />
            <Detail
              label="Completed"
              icon={Clock}
              value={formatDate(session.completedAt)}
            />
          </div>
        </CardContent>
      </Card>

      {session.jobDescription && (
        <Card>
          <CardHeader>
            <CardTitle>Job description</CardTitle>
            <CardDescription>Criteria used for this interview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{session.jobDescription}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {session.customInstructions && (
        <Card>
          <CardHeader>
            <CardTitle>Custom instructions</CardTitle>
            <CardDescription>Special guidance for this session</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap text-sm">
              {session.customInstructions}
            </p>
          </CardContent>
        </Card>
      )}

      {session.transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>Full conversation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 max-h-96 overflow-y-auto rounded-md border p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {session.transcript}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Detail({
  label,
  value,
  icon: Icon,
  cap
}: {
  label: string
  value: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  cap?: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        <Icon className="size-4" />
        {label}
      </div>
      <div className={`text-sm ${cap ? "capitalize" : ""}`}>{value}</div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────
export default function AIInterviewerInterface({
  session,
  onSessionUpdate,
  onLeave
}: AIInterviewerInterfaceProps) {
  const [conversationUrl, setConversationUrl] = useState<string | null>(
    session.conversationUrl || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [sessionStatus, setSessionStatus] = useState(session.status)

  const createConversation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai-interviewer/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          replicaId: session.replicaId,
          personaId: session.personaId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create conversation")
      }

      const data = await response.json()
      setConversationUrl(data.conversation_url)
      setSessionStatus("in_progress")
      toast.success("AI interviewer is ready")
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to start interview"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeave = () => {
    setConversationUrl(null)
    setSessionStatus("scheduled")
    onLeave?.()
  }

  // Completed view
  if (session.status === "completed" && session.score) {
    return (
      <CVIProvider>
        <div className="bg-background min-h-screen">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Interview results
                </h1>
                <p className="text-muted-foreground text-sm">
                  Analysis of your interview performance
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge
                  status={"completed" as SelectInterviewSession["status"]}
                />
                <Button variant="outline" onClick={onLeave}>
                  Back
                </Button>
              </div>
            </div>

            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="size-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="flex items-center gap-2"
                >
                  <User className="size-4" />
                  Session details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="mt-6">
                <InterviewAnalyticsDashboard session={session} />
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <SessionDetailsView session={session} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CVIProvider>
    )
  }

  return (
    <CVIProvider>
      <div className="bg-background min-h-screen">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="size-5" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Interview Session Details
              </h1>
            </div>
            <StatusBadge
              status={sessionStatus as SelectInterviewSession["status"]}
            />
          </div>

          {/* Meta */}
          <Card className="mb-8">
            <CardContent className="p-4 md:p-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <MetaItem label="Position" value={session.jobTitle} />
                <MetaItem
                  label="Duration"
                  value={formatDuration(session.duration || 30)}
                />
                <MetaItem label="Type" value={session.interviewType} cap />
              </div>
            </CardContent>
          </Card>

          {/* Main */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {!conversationUrl ? (
                <div className="flex min-h-[460px] flex-col items-center justify-center p-10 text-center">
                  <div className="mb-6 flex size-20 items-center justify-center rounded-full border">
                    <Video className="size-10" />
                  </div>

                  {session.customInstructions && (
                    <Card className="mb-6 w-full max-w-md text-left">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Custom instructions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-muted-foreground text-sm">
                          {session.customInstructions}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={createConversation}
                    disabled={isLoading}
                    size="lg"
                    aria-busy={isLoading}
                    className="px-6"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Connecting
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 size-5" />
                        Start interview
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Conversation
                    conversationUrl={conversationUrl}
                    onLeave={handleLeave}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          {!conversationUrl && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-base">Interview tips</CardTitle>
                <CardDescription>
                  Simple checks before you start
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul role="list" className="grid gap-3 sm:grid-cols-2">
                  <Tip
                    icon={Mic}
                    title="Clear audio"
                    text="Use a quiet room and a good microphone."
                  />
                  <Tip
                    icon={Video}
                    title="Good lighting"
                    text="Face a light source for clear video."
                  />
                  <Tip
                    icon={Clock}
                    title="Take your time"
                    text="Use the STAR method for behavioral answers."
                  />
                  <Tip
                    icon={User}
                    title="Be natural"
                    text="Answer as you would in a real interview."
                  />
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </CVIProvider>
  )
}

function MetaItem({
  label,
  value,
  cap
}: {
  label: string
  value: React.ReactNode
  cap?: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-bold uppercase tracking-wide">{label}</div>
      <div className={`text-sm ${cap ? "capitalize" : ""}`}>{value}</div>
    </div>
  )
}

function Tip({
  icon: Icon,
  title,
  text
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  text: string
}) {
  return (
    <li className="hover:bg-muted/40 flex items-start gap-3 rounded-lg p-3 transition-colors">
      <span className="bg-muted mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <p className="text-muted-foreground text-sm">{text}</p>
      </div>
    </li>
  )
}
