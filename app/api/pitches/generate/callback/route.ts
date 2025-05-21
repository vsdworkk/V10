// Callback endpoint for PromptLayer pitch generation workflow
import { NextRequest, NextResponse } from "next/server"
import { updatePitchByExecutionId } from "@/actions/db/pitches-actions"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Extract the unique ID (which is the pitch ID) from the callback data
    let uniqueId = ""

    // Check common locations for the ID - same approach as guidance system
    if (data.input_variables?.id_unique) {
      uniqueId = data.input_variables.id_unique
    } else if (data.output?.data?.id_unique) {
      uniqueId = data.output.data.id_unique
    } else if (data.id_unique) {
      uniqueId = data.id_unique
    } else if (data.data?.id_unique) {
      uniqueId = data.data.id_unique
    }

    if (!uniqueId) {
      console.error("No unique ID found in callback data", data)
      return NextResponse.json(
        { error: "No unique ID provided in callback" },
        { status: 400 }
      )
    }

  // Extract the pitch content
  let pitchContent = ""
  if (data.output?.data?.["Final Pitch"]) {
    pitchContent = data.output.data["Final Pitch"]
  } else if (data.data?.["Final Pitch"]) {
    pitchContent = data.data["Final Pitch"]
  } else if (data.output?.data?.["Integration Prompt"]) {
    pitchContent = extractFromIntegrationPrompt(
      data.output.data["Integration Prompt"]
    )
  } else if (data.data?.["Integration Prompt"]) {
    pitchContent = extractFromIntegrationPrompt(data.data["Integration Prompt"])
  }

    if (!pitchContent) {
      console.error("No pitch content found in callback data", data)
      return NextResponse.json(
        { error: "No pitch content found in callback" },
        { status: 400 }
      )
    }

    // Format the pitch content as HTML if needed
    const htmlPitchContent = formatPitchAsHtml(pitchContent)

    // Update the database using updatePitchByExecutionId which can find the record
    // using either the agentExecutionId field or the id field (the pitch ID)
    // This is the exact same pattern used by the guidance system
    console.log(
      `Updating pitch with execution ID ${uniqueId} and pitch content (${htmlPitchContent.length} chars)`
    )
    const updateResult = await updatePitchByExecutionId(uniqueId, {
      pitchContent: htmlPitchContent,
      status: "final"
    })

    if (!updateResult.isSuccess) {
      console.error(`Failed to update pitch: ${updateResult.message}`)
      return NextResponse.json({ error: updateResult.message }, { status: 500 })
    }

    console.log("Pitch saved successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in pitch callback:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Convert the Integration Prompt JSON into plain text.
 */
function extractFromIntegrationPrompt(raw: string): string {
  try {
    const parsed = JSON.parse(raw)
    const parts: string[] = []
    if (parsed.introduction) parts.push(parsed.introduction)
    if (Array.isArray(parsed.starExamples)) {
      for (const ex of parsed.starExamples) {
        if (typeof ex.content === "string") parts.push(ex.content)
      }
    }
    if (parsed.conclusion) parts.push(parsed.conclusion)
    return parts.join("\n\n")
  } catch {
    return raw
  }
}

/**
 * Format plain text pitch as HTML for the rich text editor
 */
function formatPitchAsHtml(text: string): string {
  if (!text) return ""

  // Basic conversion of plain text to HTML
  // Replace line breaks with paragraph tags
  let html = ""
  const paragraphs = text.split(/\n\s*\n/)

  for (const para of paragraphs) {
    if (!para.trim()) continue

    // Check if paragraph is a heading (e.g. "# Heading" or "## Subheading")
    if (para.startsWith("# ")) {
      const headingText = para.substring(2).trim()
      html += `<h1>${headingText}</h1>`
    } else if (para.startsWith("## ")) {
      const headingText = para.substring(3).trim()
      html += `<h2>${headingText}</h2>`
    } else if (para.startsWith("### ")) {
      const headingText = para.substring(4).trim()
      html += `<h3>${headingText}</h3>`
    } else {
      // Regular paragraph
      const lines = para.split("\n")
      const processedPara = lines.join("<br>")
      html += `<p>${processedPara}</p>`
    }
  }

  return html
}
