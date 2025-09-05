/**
 * @file db/schema/pitches-schema.ts
 * @description Drizzle schema for APSPitchPro "pitches".
 * Extends the table with post-generation user feedback columns:
 * - pitchRating: integer 1–5 (nullable)
 * - ratingReason: text JSON or plain text (nullable)
 *
 * Key design points:
 * - Follows existing schema patterns and timestamps with $onUpdate.
 * - userId references profiles table with cascade delete.
 * - JSONB types for STAR examples.
 *
 * Deployment note:
 * - Add a DB-level CHECK constraint for pitchRating range via SQL (no migrations per project rules).
 */

import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb
} from "drizzle-orm/pg-core"
import { profilesTable } from "@/db/schema/profiles-schema"

/* ------------------------------------------------------------------ */
/* enums & interfaces                                                  */
/* ------------------------------------------------------------------ */

/**
 * Pitch lifecycle status.
 */
export const pitchStatusEnum = pgEnum("pitch_status", [
  "draft",
  "final",
  "submitted",
  "failed"
])

/**
 * Structured action step within STAR "Action".
 */
export interface ActionStep {
  /** 1-based ordinal in the action sequence */
  stepNumber: number
  /** What did you specifically do in this step? */
  "what-did-you-specifically-do-in-this-step": string
  /** What was the outcome of this step? (optional) */
  "what-was-the-outcome-of-this-step-optional"?: string
}

/**
 * STAR example data captured through the wizard.
 */
export interface StarSchema {
  situation: {
    "where-and-when-did-this-experience-occur"?: string
    "briefly-describe-the-situation-or-challenge-you-faced"?: string
  }
  task: {
    "what-was-your-responsibility-in-addressing-this-issue"?: string
    "what-constraints-or-requirements-did-you-need-to-consider"?: string
  }
  action: {
    steps: ActionStep[]
  }
  result: {
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"?: string
  }
}

/** JSONB array of STAR examples */
export type StarJsonbSchema = StarSchema[]

/* ------------------------------------------------------------------ */
/* pitches table                                                       */
/* ------------------------------------------------------------------ */

/**
 * Main pitches table.
 *
 * Notes:
 * - Mirrors existing fields for role data, AI outputs, and bookkeeping.
 * - Adds feedback fields (pitchRating, ratingReason) before timestamps.
 *
 * Reference style and existing columns confirmed from the codebase PDF.
 */
export const pitchesTable = pgTable("pitches", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  /* user relationship */
  userId: text("user_id")
    .references(() => profilesTable.userId, { onDelete: "cascade" })
    .notNull(),

  /* role information */
  roleName: text("role_name").notNull(),
  organisationName: text("organisation_name"),
  roleLevel: text("role_level").notNull(),
  pitchWordLimit: integer("pitch_word_limit").default(650).notNull(),
  roleDescription: text("role_description"),

  /* experience & STAR examples */
  relevantExperience: text("relevant_experience").notNull(),
  starExamples: jsonb("star_examples").$type<StarJsonbSchema>(),
  starExampleDescriptions: text("star_example_descriptions").array(),

  /* AI‑related fields */
  albertGuidance: text("albert_guidance"),
  pitchContent: text("pitch_content"),

  /** PromptLayer / workflow execution id (nullable) */
  agentExecutionId: text("agent_execution_id"),

  /* feedback (NEW) */
  /**
   * Nullable star rating after generation. Valid range 1–5.
   * DB-level CHECK constraint recommended; see deployment SQL.
   */
  pitchRating: integer("pitch_rating"),
  /**
   * Optional reason for the rating. Can be plain text or JSON stringified detail.
   */
  ratingReason: text("rating_reason"),

  /* bookkeeping */
  status: pitchStatusEnum("status").default("draft").notNull(),
  starExamplesCount: integer("star_examples_count").default(2).notNull(),
  currentStep: integer("current_step").default(1).notNull(),

  /* timestamps */
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

/* ------------------------------------------------------------------ */
/* inferred types                                                      */
/* ------------------------------------------------------------------ */

export type InsertPitch = typeof pitchesTable.$inferInsert
export type SelectPitch = typeof pitchesTable.$inferSelect
