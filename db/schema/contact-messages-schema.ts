/*
Defines the database schema for contact messages.
*/

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const contactMessagesTable = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertContactMessage = typeof contactMessagesTable.$inferInsert
export type SelectContactMessage = typeof contactMessagesTable.$inferSelect
