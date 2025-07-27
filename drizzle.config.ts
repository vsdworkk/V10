/*
Configures Drizzle for the app.
*/

import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local" })

const DB_URL = process.env.DATABASE_URL
if (!DB_URL) {
  throw new Error("Missing DATABASE_URL environment variable")
}

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: DB_URL }
})
