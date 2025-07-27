"use server"

/**
 * Uploads user resume to Supabase Storage with strict validation and sanitization.
 * Features:
 * - Validates size (max 5MB), type (PDF, DOC, DOCX)
 * - Sanitizes file name to avoid path injection or unsafe characters
 * - Adds timestamp prefix to prevent name collisions
 * - Stores in: {userId}/resumes/{timestamp}-{safeFilename}
 */

import { createClient } from "@supabase/supabase-js"
import { ActionState } from "@/types"

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"]
const BUCKET = process.env.SUPABASE_RESUME_BUCKET || "resume-uploads"

// Environment validation
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// Sanitize filename
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.\-_]/g, "_") // replace unsafe chars
    .replace(/_+/g, "_") // compress multiple underscores
    .replace(/^\.+/, "") // remove leading dots
    .substring(0, 100) // max length
}

/**
 * @function uploadResumeStorage
 * @description Upload a user resume to Supabase Storage with validation and sanitization.
 *
 * @param file - File to upload
 * @param userId - Authenticated user's ID
 */
export async function uploadResumeStorage(
  file: File,
  userId: string
): Promise<ActionState<{ path: string }>> {
  try {
    // Validate environment
    getEnvVar("SUPABASE_URL")
    getEnvVar("SUPABASE_SERVICE_ROLE_KEY")

    if (!userId) throw new Error("Missing user ID.")
    if (!file || file.size <= 0) throw new Error("No file provided.")

    // Size check
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File exceeds size limit of ${MAX_FILE_SIZE / 1024 / 1024}MB.`
      )
    }

    // Type / extension check
    const originalName = file.name.toLowerCase()
    const isAllowedExt = ALLOWED_EXTENSIONS.some(ext =>
      originalName.endsWith(ext)
    )
    if (!isAllowedExt) {
      throw new Error(`Invalid file type. Only PDF, DOC, or DOCX allowed.`)
    }

    const safeFilename = sanitizeFilename(originalName)
    const timestamp = Date.now()
    const storagePath = `${userId}/resumes/${timestamp}-${safeFilename}`

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false }
    })

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        upsert: false,
        contentType: file.type
      })

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`)
    }

    return {
      isSuccess: true,
      message: "Resume uploaded successfully.",
      data: { path: data.path }
    }
  } catch (error) {
    console.error("Upload resume error:", error)
    return {
      isSuccess: false,
      message:
        (error as Error).message || "Failed to upload resume. Please try again."
    }
  }
}
