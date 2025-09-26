"use server"

import { db } from "@/db/db"
import { InsertInterviewSession, SelectInterviewSession, interviewSessionsTable } from "@/db/schema/interview-sessions-schema"
import { ActionState } from "@/types"
import { eq, and, desc } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export async function createInterviewSessionAction(
  session: Omit<InsertInterviewSession, "userId">
): Promise<ActionState<SelectInterviewSession>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const [newSession] = await db
      .insert(interviewSessionsTable)
      .values({ ...session, userId })
      .returning()

    return {
      isSuccess: true,
      message: "Interview session created successfully",
      data: newSession
    }
  } catch (error) {
    console.error("Error creating interview session:", error)
    return { isSuccess: false, message: "Failed to create interview session" }
  }
}

export async function getInterviewSessionsAction(
  userId: string
): Promise<ActionState<SelectInterviewSession[]>> {
  try {
    const sessions = await db.query.interviewSessions.findMany({
      where: eq(interviewSessionsTable.userId, userId),
      orderBy: [desc(interviewSessionsTable.createdAt)]
    })

    return {
      isSuccess: true,
      message: "Interview sessions retrieved successfully",
      data: sessions
    }
  } catch (error) {
    console.error("Error getting interview sessions:", error)
    return { isSuccess: false, message: "Failed to get interview sessions" }
  }
}

export async function getInterviewSessionByIdAction(
  id: string,
  userId: string
): Promise<ActionState<SelectInterviewSession>> {
  try {
    const session = await db.query.interviewSessions.findFirst({
      where: and(
        eq(interviewSessionsTable.id, id),
        eq(interviewSessionsTable.userId, userId)
      )
    })

    if (!session) {
      return { isSuccess: false, message: "Interview session not found" }
    }

    return {
      isSuccess: true,
      message: "Interview session retrieved successfully",
      data: session
    }
  } catch (error) {
    console.error("Error getting interview session:", error)
    return { isSuccess: false, message: "Failed to get interview session" }
  }
}

export async function updateInterviewSessionAction(
  id: string,
  data: Partial<InsertInterviewSession>
): Promise<ActionState<SelectInterviewSession>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const [updatedSession] = await db
      .update(interviewSessionsTable)
      .set(data)
      .where(and(
        eq(interviewSessionsTable.id, id),
        eq(interviewSessionsTable.userId, userId)
      ))
      .returning()

    if (!updatedSession) {
      return { isSuccess: false, message: "Interview session not found or unauthorized" }
    }

    return {
      isSuccess: true,
      message: "Interview session updated successfully",
      data: updatedSession
    }
  } catch (error) {
    console.error("Error updating interview session:", error)
    return { isSuccess: false, message: "Failed to update interview session" }
  }
}

export async function deleteInterviewSessionAction(id: string): Promise<ActionState<void>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const result = await db
      .delete(interviewSessionsTable)
      .where(and(
        eq(interviewSessionsTable.id, id),
        eq(interviewSessionsTable.userId, userId)
      ))
      .returning()

    if (result.length === 0) {
      return { isSuccess: false, message: "Interview session not found or unauthorized" }
    }

    return {
      isSuccess: true,
      message: "Interview session deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting interview session:", error)
    return { isSuccess: false, message: "Failed to delete interview session" }
  }
}

export async function startInterviewSessionAction(
  id: string
): Promise<ActionState<SelectInterviewSession>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const [updatedSession] = await db
      .update(interviewSessionsTable)
      .set({
        status: "in_progress",
        startedAt: new Date()
      })
      .where(and(
        eq(interviewSessionsTable.id, id),
        eq(interviewSessionsTable.userId, userId)
      ))
      .returning()

    if (!updatedSession) {
      return { isSuccess: false, message: "Interview session not found or unauthorized" }
    }

    return {
      isSuccess: true,
      message: "Interview session started successfully",
      data: updatedSession
    }
  } catch (error) {
    console.error("Error starting interview session:", error)
    return { isSuccess: false, message: "Failed to start interview session" }
  }
}

export async function completeInterviewSessionAction(
  id: string,
  transcript?: string,
  feedback?: any,
  score?: number
): Promise<ActionState<SelectInterviewSession>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const [updatedSession] = await db
      .update(interviewSessionsTable)
      .set({
        status: "completed",
        completedAt: new Date(),
        transcript,
        feedback,
        score
      })
      .where(and(
        eq(interviewSessionsTable.id, id),
        eq(interviewSessionsTable.userId, userId)
      ))
      .returning()

    if (!updatedSession) {
      return { isSuccess: false, message: "Interview session not found or unauthorized" }
    }

    return {
      isSuccess: true,
      message: "Interview session completed successfully",
      data: updatedSession
    }
  } catch (error) {
    console.error("Error completing interview session:", error)
    return { isSuccess: false, message: "Failed to complete interview session" }
  }
} 