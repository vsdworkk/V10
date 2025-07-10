/*
Initializes the database connection and schema for the app.
*/

import { profilesTable, pitchesTable } from "@/db/schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

config({ path: ".env.local" })

const schema = { profiles: profilesTable, pitches: pitchesTable }

const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 5,
  prepare: false,
  types: {
    bigint: postgres.BigInt
  },
  transform: {
    undefined: null
  }
})

export const db = drizzle(client, { schema })
