// API route to update pitch content for a specific pitch ID

import { savePitchContentAction } from "@/actions/db/pitches-actions"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import sanitizeHtml from "sanitize-html"
import { z } from "zod"

// UUID v4 validator
const uuidSchema = z.string().uuid()

// pitchContent validator
const pitchContentSchema = z.object({
  pitchContent: z.string().min(1, "pitchContent is required").max(10000, {
    message: "pitchContent must be 10,000 characters or less"
  })
})

// Configure HTML sanitizer
const sanitizeContent = (dirty: string) =>
  sanitizeHtml(dirty, {
    allowedTags: [
      "b",
      "i",
      "em",
      "strong",
      "u",
      "a",
      "p",
      "ul",
      "ol",
      "li",
      "br",
      "blockquote",
      "code",
      "pre",
      "span",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6"
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      span: ["class"],
      code: ["class"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false
  })

export async function PATCH(
  request: NextRequest,
  context: { params: { pitchId: string } }
) {
  const params = context.params

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pitchId } = params
    const pitchIdCheck = uuidSchema.safeParse(pitchId)
    if (!pitchIdCheck.success) {
      return NextResponse.json(
        { error: "Invalid pitch ID (must be a valid UUID)" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsedBody = pitchContentSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedBody.error.flatten()
        },
        { status: 400 }
      )
    }

    const dirtyContent = parsedBody.data.pitchContent
    const sanitizedContent = sanitizeContent(dirtyContent)

    const result = await savePitchContentAction(
      pitchId,
      userId,
      sanitizedContent
    )

    if (!result.isSuccess) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Pitch content updated successfully",
        data: result.data
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("PATCH /api/pitches/[pitchId]/content error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
