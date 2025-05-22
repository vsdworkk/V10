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

    // Extract the pitch content. The agent may return "Integration Prompt"
    // containing JSON or the legacy "Final Pitch" field.
    let pitchContent: any = ""
    if (data.output?.data?.["Integration Prompt"]) {
      pitchContent = data.output.data["Integration Prompt"]
    } else if (data.data?.["Integration Prompt"]) {
      pitchContent = data.data["Integration Prompt"]
    } else if (data.output?.data?.["Final Pitch"]) {
      pitchContent = data.output.data["Final Pitch"]
    } else if (data.data?.["Final Pitch"]) {
      pitchContent = data.data["Final Pitch"]
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
 * Format plain text pitch as HTML for the rich text editor
 */
function formatPitchAsHtml(text: any): string {
  if (!text) return ""

  const escape = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // Attempt to parse JSON structure
  let json: any = null
  if (typeof text === "string") {
    try {
      json = JSON.parse(text)
    } catch {
      // not JSON
    }
  } else if (typeof text === "object") {
    json = text
  }

  if (json && (json.introduction || json.starExamples || json.conclusion)) {
    let html = ""
    if (json.introduction) {
      html += `<p>${escape(json.introduction)}</p>`
    }
    if (Array.isArray(json.starExamples)) {
      for (const ex of json.starExamples) {
        if (ex?.content) {
          html += `<p>${escape(ex.content)}</p>`
        }
      }
    }
    if (json.conclusion) {
      html += `<p>${escape(json.conclusion)}</p>`
    }
    return html
  }

  const plain = typeof text === "string" ? text : JSON.stringify(text)
  let html = ""
  const paragraphs = plain.split(/\n\s*\n/)
  for (const para of paragraphs) {
    if (!para.trim()) continue
    if (para.startsWith("# ")) {
      const headingText = para.substring(2).trim()
      html += `<h1>${escape(headingText)}</h1>`
    } else if (para.startsWith("## ")) {
      const headingText = para.substring(3).trim()
      html += `<h2>${escape(headingText)}</h2>`
    } else if (para.startsWith("### ")) {
      const headingText = para.substring(4).trim()
      html += `<h3>${escape(headingText)}</h3>`
    } else {
      const lines = para.split("\n")
      const processed = lines.map(l => escape(l)).join("<br>")
      html += `<p>${processed}</p>`
    }
  }
  return html
}
