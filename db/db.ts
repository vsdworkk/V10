/**
 * @file db/db.ts
 * @description Initializes the database connection and registers the schema for the app.
 * Uses postgres-js with Drizzle ORM. Adds connection pooling and performance options.
 *
 * Important:
 * - Reads DATABASE_URL from env. Throws if missing.
 * - Registers all tables in `schema` so Drizzle can infer query helpers.
 */

import { drizzle } from "drizzle-orm/postgres-js"
import { profilesTable } from "@/db/schema"
import { pitchesTable } from "@/db/schema"
import { jobPicksTable } from "@/db/schema"
import { config } from "dotenv"
import postgres from "postgres"

const DB_URL = process.env.DATABASE_URL
if (!DB_URL) {
  throw new Error("Missing DATABASE_URL environment variable")
}

config({ path: ".env.local" })

/**
 * Register all tables here.
 * Keys determine `db.query.<key>` accessors (e.g., `db.query.profiles`).
 */
const schema = {
  profiles: profilesTable,
  pitches: pitchesTable,
  jobPicks: jobPicksTable
}

/**
 * Initialize Postgres client using environment variable "DATABASE_URL".
 * OPTIMIZATION: Connection pooling and basic transform to map undefined→null.
 */
const client = postgres(DB_URL, {
  // Connection pooling
  max: 10,            // max connections
  idle_timeout: 20,   // seconds
  connect_timeout: 5, // seconds

  // Performance
  prepare: false, // disable prepared statements for broad compatibility

  // Types
  types: {
    bigint: postgres.BigInt
  },

  // Reduce connection overhead for nullables
  transform: {
    undefined: null
  }
})

export const db = drizzle(client, { schema })