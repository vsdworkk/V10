"use client"

import React, { useState, useEffect } from "react"
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
  VideoOff,
  Mic,
  MicOff,
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
        headers: {
          "Content-Type": "application/json"
        },
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

      // Update session status to in_progress
      setSessionStatus("in_progress")

      toast.success("AI Interviewer is ready!")
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
    if (onLeave) {
      onLeave()
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  // Show analytics if interview is completed
  if (session.status === "completed" && session.score) {
    return (
      <CVIProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    Interview Results
                  </h1>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Detailed analysis of your interview performance
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="px-3 py-1">
                    COMPLETED
                  </Badge>
                  <Button onClick={onLeave} variant="outline">
                    Back to Sessions
                  </Button>
                </div>
              </div>
            </div>

            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
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
                  Session Details
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

  function SessionDetailsView({
    session
  }: {
    session: SelectInterviewSession
  }) {
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

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>
              Details about your interview session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Position
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {session.jobTitle}
                </p>
              </div>

              {session.companyName && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Company
                  </label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {session.companyName}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Interview Type
                </label>
                <p className="text-sm capitalize text-slate-600 dark:text-slate-400">
                  {session.interviewType}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Duration
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {session.duration} minutes
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Started At
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(session.startedAt)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Completed At
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(session.completedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {session.jobDescription && (
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                The role requirements used for this interview
              </CardDescription>
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
              <CardTitle>Custom Instructions</CardTitle>
              <CardDescription>
                Special instructions provided for this interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
                {session.customInstructions}
              </p>
            </CardContent>
          </Card>
        )}

        {session.transcript && (
          <Card>
            <CardHeader>
              <CardTitle>Interview Transcript</CardTitle>
              <CardDescription>
                Full conversation transcript from your interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
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

  return (
    <CVIProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  AI Interview Session
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Practice your interview skills with AI-powered feedback
                </p>
              </div>
              <Badge
                variant={
                  sessionStatus === "in_progress" ? "default" : "secondary"
                }
                className="px-3 py-1"
              >
                {sessionStatus.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Session Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Interview Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Cleaner and more professional layout */}
              <div className="grid divide-y divide-slate-200 overflow-hidden rounded-lg border md:grid-cols-3 md:divide-x md:divide-y-0 dark:divide-slate-700 dark:border-slate-700">
                {/* Position */}
                <div className="flex items-start gap-4 p-4">
                  <div className="flex size-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                    <Building2 className="size-5 text-slate-600 dark:text-slate-400" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Position
                    </span>

                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {session.jobTitle}
                    </span>

                    {session.companyName && (
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        @ {session.companyName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-start gap-4 p-4">
                  <div className="flex size-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                    <Clock className="size-5 text-slate-600 dark:text-slate-400" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Duration
                    </span>

                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatDuration(session.duration || 30)}
                    </span>
                  </div>
                </div>

                {/* Interview Type */}
                <div className="flex items-start gap-4 p-4">
                  <div className="flex size-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                    <Video className="size-5 text-slate-600 dark:text-slate-400" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Interview Type
                    </span>

                    <span className="font-semibold capitalize text-slate-900 dark:text-slate-100">
                      {session.interviewType}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Interview Interface */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {!conversationUrl ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center p-8 text-center">
                  <div className="mb-8">
                    <div className="mb-4 flex size-24 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                      <Video className="size-12 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      Ready to Start Your AI Interview?
                    </h2>
                    <p className="max-w-md text-slate-600 dark:text-slate-400">
                      Click the button below to begin your interview session.
                      The AI interviewer will guide you through questions
                      tailored to your role and experience level.
                    </p>
                  </div>

                  {session.customInstructions && (
                    <Card className="mb-6 max-w-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">
                          Custom Instructions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {session.customInstructions}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={createConversation}
                    disabled={isLoading}
                    size="lg"
                    className="bg-purple-600 px-8 text-white hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 size-5" />
                        Start Interview
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

          {/* Instructions */}
          {!conversationUrl && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Interview Tips</CardTitle>
                <CardDescription>
                  Make the most of your AI interview session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Mic className="mt-0.5 size-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        Clear Audio
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Ensure you're in a quiet environment with a good
                        microphone
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Video className="mt-0.5 size-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        Good Lighting
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Position yourself with good lighting for optimal video
                        quality
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        Take Your Time
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Think through your answers and use the STAR method for
                        behavioral questions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 size-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        Be Natural
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Treat this like a real interview - be professional but
                        authentic
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </CVIProvider>
  )
}
