/*
A tiny contact form for the footer that stores messages via Supabase.
*/

"use client"

import { useState, FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createContactMessageAction } from "@/actions/db/contact-messages-actions"

export default function ContactMicroForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const message = formData.get("message") as string

    setStatus("loading")
    const res = await createContactMessageAction({ email, message, name: "" })
    if (res.isSuccess) {
      setStatus("success")
      form.reset()
    } else {
      setStatus("idle")
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-sm">
      <Input name="email" type="email" placeholder="Your email" required />
      <Textarea
        name="message"
        rows={3}
        placeholder="Message"
        required
        className="min-h-[80px]"
      />
      <Button type="submit" className="w-full" role="button">
        {status === "loading" ? "Sending..." : "Send"}
      </Button>
      {status === "success" && (
        <p className="text-xs text-green-600">Thanks for reaching out!</p>
      )}
    </form>
  )
}
