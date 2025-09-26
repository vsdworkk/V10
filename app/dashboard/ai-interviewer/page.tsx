"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getInterviewSessionsAction } from "@/actions/db/interview-sessions-actions"
import AIInterviewerDashboard from "./_components/ai-interviewer-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default async function AIInterviewerPage() {
  return (
    <Suspense fallback={<AIInterviewerSkeleton />}>
      <AIInterviewerFetcher />
    </Suspense>
  )
}

async function AIInterviewerFetcher() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  const sessionsResult = await getInterviewSessionsAction(userId)
  const sessions = sessionsResult.isSuccess ? sessionsResult.data : []

  return <AIInterviewerDashboard initialSessions={sessions} />
}

function AIInterviewerSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="size-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
