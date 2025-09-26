"use client"

import React from "react"
import { SelectInterviewSession } from "@/db/schema/interview-sessions-schema"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  MessageCircle,
  Code,
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Clock,
  Star
} from "lucide-react"

interface InterviewAnalyticsDashboardProps {
  session: SelectInterviewSession
}

export default function InterviewAnalyticsDashboard({
  session
}: InterviewAnalyticsDashboardProps) {
  if (session.status !== "completed" || !session.score) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="mx-auto mb-4 size-12 text-slate-400" />
            <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">
              Analysis in Progress
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your interview analysis will be ready shortly after the session
              ends.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 85) return "Excellent"
    if (score >= 70) return "Good"
    if (score >= 60) return "Average"
    return "Needs Improvement"
  }

  const toStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
      return []
    }

    return value.map(item => String(item))
  }

  const strengths = toStringArray(session.strengths)
  const improvements = toStringArray(session.improvements)
  const recommendations = toStringArray(session.recommendations)
  const getFeedbackSummary = (feedback: unknown): string | null => {
    if (
      feedback &&
      typeof feedback === "object" &&
      "summary" in feedback &&
      typeof (feedback as { summary?: unknown }).summary === "string"
    ) {
      return (feedback as { summary: string }).summary
    }

    return null
  }
  const feedbackSummary = getFeedbackSummary(session.feedback)
  const keyMoments = Array.isArray(session.keyMoments)
    ? (
        session.keyMoments as Array<{
          timestamp?: string
          topic: string
          analysis: string
          score?: number
        }>
      ).map(moment => ({
        ...moment,
        topic: String(moment.topic),
        analysis: String(moment.analysis),
        timestamp: moment.timestamp ? String(moment.timestamp) : undefined,
        score: typeof moment.score === "number" ? moment.score : undefined
      }))
    : []

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="size-5 text-yellow-500" />
            Overall Interview Performance
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of your interview performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="mb-1 text-4xl font-bold">
                <span className={getScoreColor(session.score)}>
                  {session.score}
                </span>
                <span className="text-2xl text-slate-400">/100</span>
              </div>
              <p
                className={`text-lg font-medium ${getScoreColor(session.score)}`}
              >
                {getScoreLabel(session.score)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Interview for {session.jobTitle}
              </p>
              {session.companyName && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  at {session.companyName}
                </p>
              )}
            </div>
          </div>

          <Progress value={session.score} className="h-2" />
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ScoreCard
          title="Communication"
          score={session.communicationScore || 0}
          icon={<MessageCircle className="size-5" />}
          description="Clarity and articulation"
        />
        <ScoreCard
          title="Technical Skills"
          score={session.technicalScore || 0}
          icon={<Code className="size-5" />}
          description="Job-relevant knowledge"
        />
        <ScoreCard
          title="Behavioral"
          score={session.behavioralScore || 0}
          icon={<Users className="size-5" />}
          description="Examples and soft skills"
        />
        <ScoreCard
          title="Job Fit"
          score={session.jobFitScore || 0}
          icon={<Target className="size-5" />}
          description="Role alignment"
        />
      </div>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="size-5" />
              Strengths
            </CardTitle>
            <CardDescription>
              What you did well in the interview
            </CardDescription>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-500" />
                    <span className="text-sm">{String(strength)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Analysis in progress...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertCircle className="size-5" />
              Areas for Improvement
            </CardTitle>
            <CardDescription>
              Opportunities to enhance your performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {improvements.length > 0 ? (
              <ul className="space-y-2">
                {improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-orange-500" />
                    <span className="text-sm">{String(improvement)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Analysis in progress...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Lightbulb className="size-5" />
            Recommendations
          </CardTitle>
          <CardDescription>
            Actionable steps to improve your interview skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20"
                >
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-blue-500" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Analysis in progress...</p>
          )}
        </CardContent>
      </Card>

      {/* Key Moments */}
      {keyMoments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Key Interview Moments
            </CardTitle>
            <CardDescription>
              Notable highlights from your interview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keyMoments.map((moment, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4">
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {moment.topic}
                    </h4>
                    {moment.score && (
                      <Badge variant="secondary">{moment.score}/100</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {moment.analysis}
                  </p>
                  {moment.timestamp && (
                    <p className="mt-1 text-xs text-slate-500">
                      {moment.timestamp}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {feedbackSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Summary</CardTitle>
            <CardDescription>Overall assessment and feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{feedbackSummary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ScoreCardProps {
  title: string
  score: number
  icon: React.ReactNode
  description: string
}

function ScoreCard({ title, score, icon, description }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-medium">{title}</h3>
          </div>
          <span className={`text-lg font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
        <Progress value={score} className="mb-2 h-1" />
        <p className="text-xs text-slate-500">{description}</p>
      </CardContent>
    </Card>
  )
}
