/*
Contains server actions related to contact message submissions.
*/

"use server"

import { db } from "@/db/db"
import {
  contactMessagesTable,
  InsertContactMessage,
  SelectContactMessage
} from "@/db/schema/contact-messages-schema"
import { ActionState } from "@/types"

export async function createContactMessageAction(
  data: InsertContactMessage
): Promise<ActionState<SelectContactMessage>> {
  try {
    const [message] = await db
      .insert(contactMessagesTable)
      .values(data)
      .returning()

    return { isSuccess: true, message: "Message saved", data: message }
  } catch (error) {
    console.error("Error creating contact message:", error)
    return { isSuccess: false, message: "Failed to save message" }
  }
}
