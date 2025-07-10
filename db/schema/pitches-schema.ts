/*
Defines the database schema for pitches with agent execution tracking.
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
import { ActionStep, StarSchema, StarJsonbSchema } from "@/types/pitches-types"

export const pitchStatusEnum = pgEnum("pitch_status", [
  "draft",
  "final",
  "submitted"
])

/* pitches table */

export const pitchesTable = pgTable("pitches", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),

  userId: text("user_id")
    .references(() => profilesTable.userId, { onDelete: "cascade" })
    .notNull(),

  roleName: text("role_name").notNull(),
  organisationName: text("organisation_name"),
  roleLevel: text("role_level").notNull(),
  pitchWordLimit: integer("pitch_word_limit").default(650).notNull(),
  roleDescription: text("role_description"),

  relevantExperience: text("relevant_experience").notNull(),
  starExamples: jsonb("star_examples").$type<StarJsonbSchema>(),
  starExampleDescriptions: text("star_example_descriptions").array(),

  albertGuidance: text("albert_guidance"),
  pitchContent: text("pitch_content"),

  /** NEW — PromptLayer workflow execution id */
  agentExecutionId: text("agent_execution_id"),

  status: pitchStatusEnum("status").default("draft").notNull(),
  starExamplesCount: integer("star_examples_count").default(2).notNull(),
  currentStep: integer("current_step").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertPitch = typeof pitchesTable.$inferInsert
export type SelectPitch = typeof pitchesTable.$inferSelect
