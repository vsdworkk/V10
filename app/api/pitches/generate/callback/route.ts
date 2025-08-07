// Callback endpoint for PromptLayer pitch generation workflow
import { NextRequest, NextResponse } from "next/server"
import { updatePitchByExecutionId } from "@/actions/db/pitches-actions"
import { spendCreditsAction } from "@/actions/db/profiles-actions"
import sanitizeHtml from "sanitize-html"
import { debugLog } from "@/lib/debug"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const uniqueId = extractUniqueId(data)
    if (!uniqueId) {
      console.error("Callback Error: Missing unique ID")
      return NextResponse.json(
        { error: "No unique ID provided in callback" },
        { status: 400 }
      )
    }

    const pitchContent = extractPitchContent(data)
    if (!pitchContent) {
      console.error("Callback Error: No pitch content found")
      return NextResponse.json(
        { error: "No pitch content found in callback" },
        { status: 400 }
      )
    }

    const htmlPitchContent = sanitizeHtml(formatPitchAsHtml(pitchContent), {
      allowedTags: [
        "p",
        "br",
        "h1",
        "h2",
        "h3",
        "strong",
        "em",
        "ul",
        "li",
        "ol"
      ],
      allowedAttributes: {},
      disallowedTagsMode: "discard"
    })

    debugLog(
      `Updating pitch with execution ID ${uniqueId}. Sanitized content length: ${htmlPitchContent.length}`
    )

    // Update pitch with content and mark as final
    const updateResult = await updatePitchByExecutionId(uniqueId, {
      pitchContent: htmlPitchContent,
      status: "final"
    })

    if (!updateResult.isSuccess) {
      console.error(`Database update failed: ${updateResult.message}`)
      return NextResponse.json({ error: updateResult.message }, { status: 500 })
    }

    // Spend 1 credit on successful pitch generation
    const creditResult = await spendCreditsAction(updateResult.data.userId, 1)

    if (!creditResult.isSuccess) {
      console.error(
        `Failed to spend credit for userId=${updateResult.data.userId}: ${creditResult.message}`
      )
    } else {
      debugLog(
        `Credit deducted for userId=${updateResult.data.userId} on pitch ${uniqueId}`
      )
    }

    debugLog("Pitch saved successfully and credit spent.")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Callback Handler Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// === Helpers ===
function extractUniqueId(data: any): string | null {
  return (
    data?.input_variables?.id_unique ||
    data?.output?.data?.id_unique ||
    data?.data?.id_unique ||
    data?.id_unique ||
    null
  )
}

function extractPitchContent(data: any): string | object | null {
  return (
    data?.output?.data?.["Integration Prompt"] ||
    data?.data?.["Integration Prompt"] ||
    data?.output?.data?.["Final Pitch"] ||
    data?.data?.["Final Pitch"] ||
    null
  )
}

function formatPitchAsHtml(text: any): string {
  if (!text) return ""

  const escape = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  let json: any = null
  if (typeof text === "string") {
    try {
      json = JSON.parse(text)
    } catch {
      // Not JSON
    }
  } else if (typeof text === "object") {
    json = text
  }

  if (json && (json.introduction || json.starExamples || json.conclusion)) {
    let html = ""
    if (json.introduction) html += `<p>${escape(json.introduction)}</p>`
    if (Array.isArray(json.starExamples)) {
      for (const ex of json.starExamples) {
        if (ex?.content) html += `<p>${escape(ex.content)}</p>`
      }
    }
    if (json.conclusion) html += `<p>${escape(json.conclusion)}</p>`
    return html
  }

  const plain = typeof text === "string" ? text : JSON.stringify(text)
  return plain
    .split(/\n\s*\n/)
    .filter(p => p.trim())
    .map(para => {
      if (para.startsWith("### ")) return `<h3>${escape(para.slice(4))}</h3>`
      if (para.startsWith("## ")) return `<h2>${escape(para.slice(3))}</h2>`
      if (para.startsWith("# ")) return `<h1>${escape(para.slice(2))}</h1>`
      return `<p>${escape(para.replace(/\n/g, "<br>"))}</p>`
    })
    .join("")
}
