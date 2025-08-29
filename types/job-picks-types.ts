/**
 * @file Job Picks type exports
 * @description
 * Strongly-typed aliases inferred from the Drizzle schema for the `job_picks` table.
 * These types are consumed by server actions, admin pages, and public UI.
 *
 * Exports:
 * - InsertJobPick: Type for inserts/creates into the job_picks table.
 * - SelectJobPick: Type for reads/selections from the job_picks table.
 *
 * @notes
 * - We import the table from "@/db/schema" per project rules to centralize schema imports.
 * - Using Drizzle's $inferInsert and $inferSelect keeps types in sync with the schema.
 *
 * @assumptions
 * - The DB schema exports `jobPicksTable` via "@/db/schema".
 */

import { jobPicksTable } from "@/db/schema"

/**
 * Type used when creating new job pick rows.
 * Matches nullable and default column semantics defined in the schema.
 */
export type InsertJobPick = typeof jobPicksTable.$inferInsert

/**
 * Type returned when selecting job pick rows.
 * Reflects all columns as selected by Drizzle.
 */
export type SelectJobPick = typeof jobPicksTable.$inferSelect