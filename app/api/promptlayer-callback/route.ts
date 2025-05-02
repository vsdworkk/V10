// app/api/promptlayer-callback/route.ts

import { NextResponse } from "next/server"
import { updatePitchByExecutionId } from "@/actions/db/pitches-actions"

// Simple HTML-escape to avoid accidental markup injection
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function POST(request: Request) {
  console.log("📣 PromptLayer callback received")
  try {
    // 1) Parse payload
    const payload = await request.json()
    console.log("📦 FULL PAYLOAD:", JSON.stringify(payload))
    
    const data = payload?.data
    if (!data || typeof data !== "object") {
      console.error("🚨 Invalid payload structure:", payload)
      throw new Error("Missing or invalid data structure in payload")
    }

    // 2) Extract and parse the Integration Prompt JSON
    const rawIntegrationPrompt = data["Integration Prompt"] as string
    console.log("🔍 Raw Integration Prompt:\n", rawIntegrationPrompt)
    
    let integrationData: {
      introduction: string;
      starExamples: Array<{
        exampleNumber: number;
        content: string;
      }>;
      conclusion: string;
    }
    
    try {
      integrationData = JSON.parse(rawIntegrationPrompt)
      console.log("✅ Successfully parsed Integration Prompt JSON")
      console.log("📄 Parsed data structure:", JSON.stringify(integrationData))
    } catch (err) {
      console.error("🚨 Failed to parse Integration Prompt JSON:", err)
      console.error("🔎 Attempted to parse:", rawIntegrationPrompt)
      throw new Error("Invalid JSON in Integration Prompt")
    }
    
    // 3) Extract the introduction and conclusion
    const introduction = integrationData.introduction || ""
    const conclusion = integrationData.conclusion || ""
    console.log("✂️ Introduction length:", introduction.length)
    console.log("✂️ Conclusion length:", conclusion.length)
    
    // 4) Extract the STAR examples
    const starExamples = integrationData.starExamples || []
    console.log(`⭐ Found ${starExamples.length} STAR examples`)
    starExamples.forEach((ex, i) => {
      console.log(`  Example #${i+1} length: ${ex.content.length} chars`)
    })
    
    // 5) Build HTML
    const htmlParts: string[] = []
    // Introduction without header
    htmlParts.push(`<p>${escapeHtml(introduction)}</p>`)
    
    // STAR examples without headers
    starExamples.forEach((ex) => {
      htmlParts.push(`<p>${escapeHtml(ex.content)}</p>`)
    })
    
    // Conclusion without header
    htmlParts.push(`<p>${escapeHtml(conclusion)}</p>`)
    const formattedContent = htmlParts.join("\n\n")

    // 6) Log what we're about to save
    console.log("💾 Formatted HTML to save (first 200 chars):\n", formattedContent.substring(0, 200) + "...")
    console.log("💾 Total HTML length:", formattedContent.length)

    // 7) Determine execId
    const inputVars = payload?.input_variables || {}
    let execId =
      (typeof data["id_unique"] === "string" && data["id_unique"]) ||
      (typeof inputVars.id_unique === "string" && inputVars.id_unique) ||
      payload.workflow_version_execution_id ||
      payload.execution_id ||
      payload.workflow_execution_id ||
      ""
      
    if (!execId && typeof data.job_description === "string") {
      execId = data.job_description.slice(0, 6) + Math.floor(Math.random() * 1000)
    }
    if (!execId) {
      console.error("🚨 Missing execution ID; payload:", payload)
      throw new Error("Missing execution identifier in callback payload")
    }
    console.log("🆔 Using execId:", execId)

    // 8) Perform the update and log the response
    console.log("🔄 Calling updatePitchByExecutionId with execId:", execId)
    const updateRes = await updatePitchByExecutionId(execId, {
      pitchContent: formattedContent,
      status: "final"
    })
    console.log("🔄 updatePitchByExecutionId result:", JSON.stringify(updateRes))

    if (!updateRes.isSuccess) {
      console.error("💥 Failed to update pitch:", updateRes.message)
      console.error("💥 Could not find pitch with execId:", execId)
      // Despite failure, we return success to PromptLayer to prevent retries
      return NextResponse.json({ 
        success: true, 
        executionId: execId,
        warning: "Pitch not found in database with this execution ID"
      })
    }

    // 9) Return success
    console.log("✅ Callback processing completed successfully")
    return NextResponse.json({ success: true, executionId: execId })
  } catch (err: any) {
    console.error("❌ Error in PromptLayer callback:", err)
    console.error("❌ Stack trace:", err.stack)
    return new NextResponse("Invalid payload", { status: 400 })
  }
}