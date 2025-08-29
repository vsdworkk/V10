/**
 * @file db/schema/job-picks-schema.ts
 * @description Drizzle schema for APS "Job Picks" listings used for public curation and admin management.
 * Defines enums, the `job_picks` table, inferred types, and recommended indexes.
 *
 * Key fields:
 * - `status` lifecycle: draft → published → archived
 * - `classification` APS level enum
 * - `monthTag` for grouping (e.g., "2025-08")
 * - `closingDate` optional (drafts may omit)
 *
 * Relationships:
 * - `userId` references `profilesTable.userId` with cascade on delete.
 *
 * Indexing:
 * - `closingDate` for ordering by soonest closing
 * - `status` to filter public vs admin
 * - `monthTag` for grouping on the public page
 *
 * Error handling and constraints:
 * - `apsJobsUrl` must be present; domain validation occurs in admin actions/pages.
 * - `createdAt`/`updatedAt` included for audit and cache revalidation.
 */

import {
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    index
  } from "drizzle-orm/pg-core"
  import { profilesTable } from "@/db/schema/profiles-schema"
  
  /** Lifecycle for job pick entries */
  export const jobPickStatusEnum = pgEnum("job_pick_status", [
    "draft",
    "published",
    "archived"
  ])
  
  /** APS classification levels */
  export const apsClassificationEnum = pgEnum("aps_class", [
    "APS1",
    "APS2",
    "APS3",
    "APS4",
    "APS5",
    "APS6",
    "EL1",
    "EL2",
    "SES"
  ])
  
  /**
   * @table job_picks
   * @notes
   * - `closingDate` is optional to allow drafts without dates.
   * - `salary` is freeform to accommodate ranges and notes (e.g., "A$82k–$96k + super").
   */
  export const jobPicksTable = pgTable(
    "job_picks",
    {
      /** Primary key */
      id: uuid("id").defaultRandom().primaryKey().notNull(),
  
      /** Owner: admin user who created the listing */
      userId: text("user_id")
        .references(() => profilesTable.userId, { onDelete: "cascade" })
        .notNull(),
  
      /** Display fields */
      title: text("title").notNull(),
      agency: text("agency").notNull(),
      classification: apsClassificationEnum("classification").notNull(),
      salary: text("salary"),
      location: text("location"),
      closingDate: timestamp("closing_date"),
  
      /** Mandatory source link for the role on APS Jobs */
      apsJobsUrl: text("aps_jobs_url").notNull(),
  
      /** Short note explaining why this role was highlighted */
      highlightNote: text("highlight_note"),
  
      /**
       * Month grouping tag in YYYY-MM format.
       * Examples: "2025-08", "2025-09".
       */
      monthTag: text("month_tag").notNull(),
  
      /** Lifecycle status */
      status: jobPickStatusEnum("status").notNull().default("draft"),
  
      /** Audit columns */
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date())
    },
    /**
     * Table-level indexes to optimize common queries:
     * - `closing_date` for public ordering (soonest first)
     * - `status` for public filter (published only)
     * - `month_tag` for grouping on public page
     */
    (table) => ({
      idxClosingDate: index("job_picks_closing_date_idx").on(table.closingDate),
      idxStatus: index("job_picks_status_idx").on(table.status),
      idxMonth: index("job_picks_month_tag_idx").on(table.monthTag)
    })
  )

  /** Insert type for `job_picks` */
export type InsertJobPick = typeof jobPicksTable.$inferInsert
/** Select type for `job_picks` */
export type SelectJobPick = typeof jobPicksTable.$inferSelect
