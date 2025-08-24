/*
Initializes the database connection and schema for the app.
*/

import { drizzle } from "drizzle-orm/postgres-js"
import { profilesTable } from "@/db/schema"
import { pitchesTable } from "@/db/schema"
import { config } from "dotenv"
import postgres from "postgres"

const DB_URL = process.env.DATABASE_URL
if (!DB_URL) {
  throw new Error("Missing DATABASE_URL environment variable")
}

config({ path: ".env.local" })

const schema = { profiles: profilesTable, pitches: pitchesTable }

/**
 * @description
 * Initialize Postgres client using environment variable "DATABASE_URL".
 * OPTIMIZATION: Added connection pooling and performance configurations
 */
const client = postgres(DB_URL, {
  // Connection pooling for better performance
  max: 10, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 5, // Connection timeout in seconds
  // Performance optimizations
  prepare: false, // Disable prepared statements for better compatibility
  types: {
    bigint: postgres.BigInt
  },
  // Reduce connection overhead
  transform: {
    undefined: null
  }
})

export const db = drizzle(client, { schema })
