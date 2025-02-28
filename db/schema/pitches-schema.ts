/**
 * @description
 * This file defines the "pitches" table schema for APS Pitch Builder.
 * It stores user-submitted data about job application pitches, structured
 * according to the STAR methodology and referencing the user profile.
 *
 * Key columns & usage:
 * - id: Unique UUID primary key
 * - userId: Foreign key referencing "profilesTable.userId" (cascades on delete)
 * - roleName: APS role name (text)
 * - roleLevel: APS role level (text; e.g. "Junior", "Mid-level", "Senior", etc.)
 * - pitchWordLimit: The user's chosen word limit for the pitch (integer)
 * - roleDescription: Optional text describing the job or role
 * - yearsExperience: The user's years of experience (e.g. "1-2 years", "5-10 years")
 * - relevantExperience: Free-text detailing achievements/skills, or replaced by resume
 * - resumePath: Optional Supabase storage path for an uploaded resume
 * - starExample1, starExample2: JSONB fields containing STAR (Situation, Task, Action, Result) data
 * - pitchContent: The final AI-generated pitch text
 * - status: "draft", "final", or "submitted" (pgEnum: pitch_status)
 * - createdAt, updatedAt: Timestamps auto-managed by Drizzle
 *
 * @notes
 * - We do not generate migrations or run them as per instructions. This schema is for runtime usage.
 * - On user deletion (profilesTable row deletion), all referencing pitches are cascaded away.
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
 * The pitches table schema definition.
 */
export const pitchesTable = pgTable("pitches", {
  /**
   * @description
   * Primary key: Unique pitch ID, random UUID by default.
   */
  id: uuid("id")
    .defaultRandom()
    .primaryKey()
    .notNull(),

  /**
   * @description
   * User foreign key, referencing user_id from profilesTable.
   * Cascades on delete so all pitches are removed when a user is removed.
   */
  userId: text("user_id")
    .references(() => profilesTable.userId, { onDelete: "cascade" })
    .notNull(),

  /**
   * @description
   * Name of the APS role being applied for (free-text).
   */
  roleName: text("role_name").notNull(),

  /**
   * @description
   * APS role level (e.g. "Junior", "Mid-level", "Senior", "Manager", etc.).
   * Using text rather than an enum for flexibility in the interface.
   */
  roleLevel: text("role_level").notNull(),

  /**
   * @description
   * Word limit for the pitch. e.g. 500, 650, 750, 1000, 1500
   */
  pitchWordLimit: integer("pitch_word_limit").notNull(),

  /**
   * @description
   * Optional text field describing the role or job details.
   */
  roleDescription: text("role_description"),

  /**
   * @description
   * Years of experience, e.g. "Less than 1 year", "1-2 years", etc.
   */
  yearsExperience: text("years_experience").notNull(),

  /**
   * @description
   * Additional details about user's relevant experience, free-text field.
   */
  relevantExperience: text("relevant_experience").notNull(),

  /**
   * @description
   * Optional path in Supabase storage where the user's resume is saved.
   */
  resumePath: text("resume_path"),

  /**
   * @description
   * First STAR example, stored in JSONB. May contain { situation, task, action, result }.
   */
  starExample1: jsonb("star_example_1"),

  /**
   * @description
   * Second STAR example, stored in JSONB. Optional. 
   * Only required if pitchWordLimit >= 750, etc.
   */
  starExample2: jsonb("star_example_2"),

  /**
   * @description
   * Final AI-generated pitch content text from GPT-4o.
   */
  pitchContent: text("pitch_content"),

  /**
   * @description
   * The status of the pitch - "draft", "final", or "submitted".
   */
  status: pitchStatusEnum("status").notNull().default("draft"),

  /**
   * @description
   * Creation timestamp, defaults to now().
   */
  createdAt: timestamp("created_at").defaultNow().notNull(),

  /**
   * @description
   * Last updated timestamp, auto-updates to current date/time on update.
   */
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

/**
 * @description
 * Type for inserting new pitch data. Excludes auto-generated defaults.
 */
export type InsertPitch = typeof pitchesTable.$inferInsert

/**
 * @description
 * Type for selecting pitches from the DB (full record).
 */
export type SelectPitch = typeof pitchesTable.$inferSelect