import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer
} from "drizzle-orm/pg-core"

export const interviewStatusEnum = pgEnum("interview_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled"
])

export const interviewTypeEnum = pgEnum("interview_type", [
  "behavioral",
  "technical",
  "mixed",
  "custom"
])

export const interviewSessionsTable = pgTable("interview_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  pitchId: uuid("pitch_id"), // Optional - link to existing pitch
  jobTitle: text("job_title").notNull(),
  companyName: text("company_name"),
  jobDescription: text("job_description"), // Full job description for AI context
  interviewType: interviewTypeEnum("interview_type")
    .notNull()
    .default("behavioral"),
  status: interviewStatusEnum("status").notNull().default("scheduled"),

  // Tavus-specific fields
  conversationId: text("conversation_id"), // Tavus conversation ID
  conversationUrl: text("conversation_url"), // Tavus conversation URL
  replicaId: text("replica_id"), // Tavus replica ID used
  personaId: text("persona_id"), // Tavus persona ID used

  // Interview configuration
  duration: integer("duration").default(30), // Duration in minutes
  questions: jsonb("questions"), // Array of interview questions
  customInstructions: text("custom_instructions"), // Custom instructions for AI interviewer

  // Results and feedback
  transcript: text("transcript"), // Interview transcript
  visualAnalysis: text("visual_analysis"), // Tavus visual analysis
  feedback: jsonb("feedback"), // AI-generated feedback
  score: integer("score"), // Overall interview score (1-100)

  // Detailed analytics
  communicationScore: integer("communication_score"), // Communication skills (1-100)
  technicalScore: integer("technical_score"), // Technical competency (1-100)
  behavioralScore: integer("behavioral_score"), // Behavioral responses (1-100)
  jobFitScore: integer("job_fit_score"), // Job fit assessment (1-100)

  // Analysis results
  strengths: jsonb("strengths"), // Array of identified strengths
  improvements: jsonb("improvements"), // Array of improvement areas
  recommendations: jsonb("recommendations"), // Array of recommendations
  keyMoments: jsonb("key_moments"), // Array of notable interview moments

  // Timestamps
  scheduledFor: timestamp("scheduled_for"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertInterviewSession = typeof interviewSessionsTable.$inferInsert
export type SelectInterviewSession = typeof interviewSessionsTable.$inferSelect
