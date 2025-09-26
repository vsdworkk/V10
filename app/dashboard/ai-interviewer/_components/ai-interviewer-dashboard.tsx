"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { SelectInterviewSession } from "@/db/schema/interview-sessions-schema"
import InterviewSessionManager from "@/components/ai-interviewer/interview-session-manager"
import AIInterviewerInterface from "@/components/ai-interviewer/ai-interviewer-interface"
import { getInterviewSessionsAction } from "@/actions/db/interview-sessions-actions"
import { useUser } from "@clerk/nextjs"

interface AIInterviewerDashboardProps {
  initialSessions: SelectInterviewSession[]
}

export default function AIInterviewerDashboard({
  initialSessions
}: AIInterviewerDashboardProps) {
  const [sessions, setSessions] = useState(initialSessions)
  const [currentSession, setCurrentSession] =
    useState<SelectInterviewSession | null>(null)
  const { user } = useUser()
  const router = useRouter()

  const handleSessionsUpdate = async () => {
    if (user?.id) {
      const result = await getInterviewSessionsAction(user.id)
      if (result.isSuccess) {
        setSessions(result.data)
      }
    }
  }

  const handleStartInterview = (session: SelectInterviewSession) => {
    setCurrentSession(session)
  }

  const handleLeaveInterview = () => {
    setCurrentSession(null)
    handleSessionsUpdate() // Refresh sessions when leaving
  }

  if (currentSession) {
    return (
      <AIInterviewerInterface
        session={currentSession}
        onLeave={handleLeaveInterview}
        onSessionUpdate={updatedSession => {
          setSessions(prev =>
            prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
          )
        }}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <InterviewSessionManager
        sessions={sessions}
        onSessionsUpdate={handleSessionsUpdate}
        onStartInterview={handleStartInterview}
      />
    </div>
  )
}
