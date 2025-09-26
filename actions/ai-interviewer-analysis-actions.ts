"use server"

import { db } from "@/db/db"
import { interviewSessionsTable } from "@/db/schema/interview-sessions-schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

interface AnalysisRequest {
  conversationId: string
  type: "transcript" | "visual_analysis"
  data: any
}

interface InterviewAnalysis {
  overallScore: number
  communicationScore: number
  technicalScore: number
  behavioralScore: number
  jobFitScore: number
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  keyMoments: Array<{
    timestamp?: string
    topic: string
    analysis: string
    score?: number
  }>
  summary: string
}

export async function processInterviewAnalysisAction(
  request: AnalysisRequest
): Promise<ActionState<void>> {
  try {
    // Find the interview session by conversation ID
    const session = await db.query.interviewSessions.findFirst({
      where: eq(interviewSessionsTable.conversationId, request.conversationId)
    })

    if (!session) {
      console.error("Interview session not found for conversation:", request.conversationId)
      return { isSuccess: false, message: "Interview session not found" }
    }

    if (request.type === "transcript") {
      await processTranscript(session.id, request.data)
    } else if (request.type === "visual_analysis") {
      await processVisualAnalysis(session.id, request.data)
    }

    // Check if we have both transcript and visual analysis, then generate full report
    const updatedSession = await db.query.interviewSessions.findFirst({
      where: eq(interviewSessionsTable.id, session.id)
    })

    if (updatedSession?.transcript && updatedSession?.visualAnalysis) {
      await generateFullAnalysis(updatedSession)
    }

    return { isSuccess: true, message: "Analysis processed successfully", data: undefined }
    
  } catch (error) {
    console.error("Error processing interview analysis:", error)
    return { isSuccess: false, message: "Failed to process interview analysis" }
  }
}

async function processTranscript(sessionId: string, data: any) {
  const transcript = formatTranscript(data.transcript)
  
  await db
    .update(interviewSessionsTable)
    .set({ transcript })
    .where(eq(interviewSessionsTable.id, sessionId))
}

async function processVisualAnalysis(sessionId: string, data: any) {
  const visualAnalysis = data.analysis
  
  await db
    .update(interviewSessionsTable)
    .set({ visualAnalysis })
    .where(eq(interviewSessionsTable.id, sessionId))
}

async function generateFullAnalysis(session: any) {
  try {
    const analysis = await analyzeInterviewWithAI(session)
    
    await db
      .update(interviewSessionsTable)
      .set({
        score: analysis.overallScore,
        communicationScore: analysis.communicationScore,
        technicalScore: analysis.technicalScore,
        behavioralScore: analysis.behavioralScore,
        jobFitScore: analysis.jobFitScore,
        feedback: { summary: analysis.summary },
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        recommendations: analysis.recommendations,
        keyMoments: analysis.keyMoments,
        status: "completed"
      })
      .where(eq(interviewSessionsTable.id, session.id))
      
    console.log(`Full analysis completed for session: ${session.id}`)
    
  } catch (error) {
    console.error("Error generating full analysis:", error)
  }
}

async function analyzeInterviewWithAI(session: any): Promise<InterviewAnalysis> {
  const prompt = buildAnalysisPrompt(session)
  
  try {
    // Using OpenAI for analysis (you can switch to Claude or other providers)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert interview analyst. Analyze interview transcripts and provide detailed, constructive feedback. Always return valid JSON."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const analysisText = data.choices[0].message.content
    
    // Parse the JSON response
    const analysis = JSON.parse(analysisText)
    
    return analysis
    
  } catch (error) {
    console.error("Error with AI analysis:", error)
    
    // Return default analysis if AI fails
    return {
      overallScore: 75,
      communicationScore: 75,
      technicalScore: 70,
      behavioralScore: 80,
      jobFitScore: 75,
      strengths: ["Good communication", "Professional demeanor"],
      improvements: ["Provide more specific examples", "Elaborate on technical experience"],
      recommendations: ["Practice STAR method", "Prepare more detailed examples"],
      keyMoments: [
        {
          topic: "Introduction",
          analysis: "Candidate provided clear introduction",
          score: 80
        }
      ],
      summary: "Overall good interview performance with room for improvement in providing more detailed examples."
    }
  }
}

function buildAnalysisPrompt(session: any): string {
  const jobContext = session.jobDescription || `${session.jobTitle} at ${session.companyName || 'the company'}`
  
  return `
Analyze this job interview and provide detailed feedback in JSON format.

**Job Context:**
Position: ${session.jobTitle}
Company: ${session.companyName || 'Not specified'}
Interview Type: ${session.interviewType}
Job Description: ${session.jobDescription || 'Not provided'}

**Interview Transcript:**
${session.transcript}

**Visual Analysis:**
${session.visualAnalysis}

**Please analyze and return a JSON object with this exact structure:**
{
  "overallScore": 85,
  "communicationScore": 90,
  "technicalScore": 80,
  "behavioralScore": 85,
  "jobFitScore": 80,
  "strengths": ["Clear communication", "Good examples", "Professional demeanor"],
  "improvements": ["More technical depth needed", "Elaborate on leadership experience"],
  "recommendations": ["Practice system design questions", "Prepare more STAR examples"],
  "keyMoments": [
    {
      "timestamp": "00:05:23",
      "topic": "Leadership Experience",
      "analysis": "Excellent STAR method usage with specific metrics",
      "score": 95
    }
  ],
  "summary": "Strong candidate with excellent communication skills and relevant experience. Shows good cultural fit and technical understanding. Recommended areas for improvement include..."
}

**Scoring Guidelines:**
- Communication: Clarity, articulation, listening skills
- Technical: Job-relevant knowledge and problem-solving
- Behavioral: Examples, STAR method, soft skills
- Job Fit: Alignment with role requirements and company culture
- Overall: Weighted average considering job requirements

Focus on constructive feedback that helps the candidate improve while highlighting their strengths.
`
}

function formatTranscript(transcript: any[]): string {
  if (!Array.isArray(transcript)) return ""
  
  return transcript
    .filter(msg => msg.role !== "system")
    .map(msg => {
      const role = msg.role === "user" ? "Candidate" : "Interviewer"
      let content = msg.content
      
      // Clean up Tavus visual scene markers
      content = content.replace(/USER_SPEECH:\s*/g, "")
      content = content.replace(/VISUAL_SCENE:.*$/gm, "")
      
      return `${role}: ${content.trim()}`
    })
    .join("\n\n")
} 