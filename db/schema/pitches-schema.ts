/**
 * db/schema/pitches-schema.ts
 *
 * + Added agentExecutionId column (nullable) so we can match
 *   PromptLayer callbacks back to the correct pitch record.
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
/*  enums & interfaces (unchanged)                                    */
/* ------------------------------------------------------------------ */

export const pitchStatusEnum = pgEnum("pitch_status", [
  "draft",
  "final",
  "submitted"
])

export interface ActionStep {
  stepNumber: number
  "what-did-you-specifically-do-in-this-step": string
  "how-did-you-do-it-tools-methods-or-skills": string
  "what-was-the-outcome-of-this-step-optional"?: string
}

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
    "what-positive-outcome-did-you-achieve"?: string
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"?: string
  }
}

export type StarJsonbSchema = StarSchema[]

/* ------------------------------------------------------------------ */
/*  pitches table                                                     */
/* ------------------------------------------------------------------ */

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

  /* AI‑related fields */
  albertGuidance: text("albert_guidance"),
  pitchContent: text("pitch_content"),

  /** NEW — PromptLayer workflow execution id */
  agentExecutionId: text("agent_execution_id"),

  /* bookkeeping */
  status: pitchStatusEnum("status").default("draft").notNull(),
  starExamplesCount: integer("star_examples_count").default(1).notNull(),
  currentStep: integer("current_step").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
})

/* inferred types */
export type InsertPitch = typeof pitchesTable.$inferInsert
export type SelectPitch = typeof pitchesTable.$inferSelect