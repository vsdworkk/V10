/*
Initializes the database connection and schema for the app.
*/

import { profilesTable } from "@/db/schema"
import { pitchesTable } from "@/db/schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

config({ path: ".env.local" })

const schema = { profiles: profilesTable, pitches: pitchesTable }

/**
 * @description
 * Initialize Postgres client using environment variable "DATABASE_URL".
 * OPTIMIZATION: Added connection pooling and performance configurations
 */
const client = postgres(process.env.DATABASE_URL!, {
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
