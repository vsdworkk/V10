/**
 * @description
 * This file defines the "pitches" table schema for APS Pitch Builder.
 * Updated to store an array of STAR examples in `starExamples` JSONB,
 * removing `starExample1` and `starExample2` in favor of a truly dynamic approach.
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

/**
 * @description
 * Enum for pitch status, supporting limited, known states.
 */
export const pitchStatusEnum = pgEnum("pitch_status", [
  "draft",
  "final",
  "submitted"
])

/**
 * @description
 * Interface defining a single action step in the STAR "Action" section.
 */
export interface ActionStep {
  stepNumber: number
  "what-did-you-specifically-do-in-this-step": string
  "how-did-you-do-it-tools-methods-or-skills": string
  "what-was-the-outcome-of-this-step-optional"?: string
}

/**
 * @description
 * Interface defining the structure of a single STAR example.
 */
export interface StarSchema {
  situation: {
    "where-and-when-did-this-experience-occur"?: string
    "briefly-describe-the-situation-or-challenge-you-faced"?: string
    "why-was-this-a-problem-or-why-did-it-matter"?: string
  }
  task: {
    "what-was-your-responsibility-in-addressing-this-issue"?: string
    "how-would-completing-this-task-help-solve-the-problem"?: string
    "what-constraints-or-requirements-did-you-need-to-consider"?: string
  }
  action: {
    steps: ActionStep[]
  }
  result: {
    "what-positive-outcome-did-you-achieve"?: string
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"?: string
    "what-did-you-learn-from-this-experience"?: string
  }
}

/**
 * If you store multiple STAR examples in one pitch, it's an array of StarSchema objects.
 */
export type StarJsonbSchema = StarSchema[]

/**
 * @description
 * The pitches table schema, updated to store starExamples as an array (JSONB).
 */
export const pitchesTable = pgTable("pitches", {
  // Primary key
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  // Foreign key referencing user profiles
  userId: text("user_id")
    .references(() => profilesTable.userId, { onDelete: "cascade" })
    .notNull(),

  // Role info
  roleName: text("role_name").notNull(),
  organisationName: text("organisation_name"),
  roleLevel: text("role_level").notNull(),

  // Word limit
  pitchWordLimit: integer("pitch_word_limit").default(650).notNull(),

  // Optional job/role description
  roleDescription: text("role_description"),

  // Experience fields
  yearsExperience: text("years_experience").notNull(),
  relevantExperience: text("relevant_experience").notNull(),

  // Resume
  resumePath: text("resume_path"),

  /**
   * @description
   * Replaces starExample1 & starExample2 with a single array of STAR examples.
   * e.g. [ { situation, task, action, result }, { situation, task, action, result }, ... ]
   */
  starExamples: jsonb("star_examples").$type<StarJsonbSchema>(),

  // Guidance from Albert AI
  albertGuidance: text("albert_guidance"),

  // Final AI-generated pitch text
  pitchContent: text("pitch_content"),

  // Pitch status
  status: pitchStatusEnum("status").default("draft").notNull(),

  /**
   * @description
   * Number of STAR examples the user selected. 
   * Defaults to 1, but you can set any range. (Wizard can store 1..10, etc.)
   */
  starExamplesCount: integer("star_examples_count").default(1).notNull(),

  // Current step the user is on
  currentStep: integer("current_step").default(1).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
})

// Insert and Select types
export type InsertPitch = typeof pitchesTable.$inferInsert
export type SelectPitch = typeof pitchesTable.$inferSelect