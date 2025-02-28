/**
 * @description
 * Initializes the database connection and references the application schema.
 * 
 * @notes
 * - Uses Drizzle ORM for typed PostgreSQL operations.
 * - The "schema" object holds references to each table so we can
 *   use them within our server actions easily.
 * - We do NOT generate or run migrations here, as per project instructions.
 */

import { profilesTable } from "@/db/schema/profiles-schema"
import { pitchesTable } from "@/db/schema/pitches-schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

config({ path: ".env.local" })

/**
 * @description
 * Schema object that includes all defined tables in the app.
 * Add new tables here for Drizzle to be aware of them at runtime.
 */
const schema = {
  profiles: profilesTable,
  pitches: pitchesTable
}

/**
 * @description
 * Initialize Postgres client using environment variable "DATABASE_URL".
 */
const client = postgres(process.env.DATABASE_URL!)

/**
 * @description
 * Drizzle database object with the defined schema.
 */
export const db = drizzle(client, { schema })