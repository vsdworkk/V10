/**
 * @description
 * Exports a server action for uploading user resumes to Supabase Storage.
 *
 * Key features:
 * - Validates file size and extension (PDF, DOC, DOCX).
 * - Uses a "resume-uploads" bucket (configurable via SUPABASE_RESUME_BUCKET env var).
 * - Generates a unique path for each uploaded file: {userId}/resumes/timestamp-originalFilename
 * - Returns ActionState with success/failure to the caller.
 *
 * @dependencies
 * - Drizzle ActionState type for success/failure structure.
 * - Supabase server client for file uploads.
 *
 * @notes
 * - This file must be `use server` so that we can protect secrets and handle the file on the backend.
 * - We do not directly call this from a client component; it's invoked by an API route or other server logic.
 * - In production, you should handle more rigorous validation or virus scanning if needed.
 */

"use server"

import { createClient } from "@supabase/supabase-js"
import { ActionState } from "@/types"

// We read these from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = process.env.SUPABASE_RESUME_BUCKET || "resume-uploads"

// Basic file checks
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"]

/**
 * @function uploadResumeStorage
 * @description
 * Receives a File from an API route, validates it, and uploads it to Supabase Storage.
 *
 * @param file - The resume file from the user
 * @param userId - The user ID for path organization
 * @returns Promise<ActionState<{ path: string }>> The path to the uploaded file or an error
 */
export async function uploadResumeStorage(
  file: File,
  userId: string
): Promise<ActionState<{ path: string }>> {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment configuration.")
    }
    if (!userId) {
      throw new Error("Missing userId for resume upload.")
    }
    if (!file || file.size <= 0) {
      throw new Error("No file provided or empty file.")
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File exceeds size limit of ${MAX_FILE_SIZE / 1024 / 1024}MB.`
      )
    }

    // Check extension by name
    const fileName = file.name.toLowerCase()
    const isAllowed = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))
    if (!isAllowed) {
      throw new Error(
        `Invalid file type. Only PDF, DOC, or DOCX are allowed. Provided: ${file.name}`
      )
    }

    // Prepare a server-side supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    })

    // Generate a unique path for storing the file
    // e.g. "userId/resumes/1696589102573-myresume.pdf"
    const timestamp = Date.now()
    const storagePath = `${userId}/resumes/${timestamp}-${file.name}`

    // Upload to the designated bucket
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        upsert: false,
        contentType: file.type
      })

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`)
    }

    // If successful, data.path should contain the stored path
    return {
      isSuccess: true,
      message: "Resume uploaded successfully",
      data: { path: data.path }
    }
  } catch (error) {
    console.error("Error uploading resume:", error)
    return {
      isSuccess: false,
      message:
        (error as Error).message || "Failed to upload resume. Please try again."
    }
  }
}

/**
 * @function getResumeContentStorage
 * @description
 * Retrieves resume content from Supabase Storage using the stored path.
 * For now, this function assumes plain text extraction for simplicity.
 * In a production environment, proper PDF/DOC parsing would be needed.
 *
 * @param resumePath - The stored path of the resume file
 * @returns Promise<ActionState<string>> - The content of the resume or an error
 */
export async function getResumeContentStorage(
  resumePath: string
): Promise<ActionState<string>> {
  try {
    console.log("Getting resume content for path:", resumePath);
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase env configuration");
      throw new Error("Missing Supabase environment configuration.")
    }
    
    if (!resumePath) {
      console.log("No resume path provided");
      return {
        isSuccess: false,
        message: "No resume path provided"
      }
    }

    // Prepare a server-side supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    })

    // Download the file from storage
    console.log(`Attempting to download from bucket: ${BUCKET}, path: ${resumePath}`);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(resumePath)

    if (error) {
      console.error(`Supabase download error for ${resumePath}:`, error);
      throw new Error(`Supabase download error: ${error.message}`)
    }

    // Extract text based on file type
    // Note: In a production app, you would use more robust methods for
    // PDF and DOC parsing (e.g., pdf.js, mammoth.js, etc.)
    let textContent = "Resume content could not be extracted."
    
    // Simple text extraction - in a real app, use proper file format parsers
    if (data) {
      console.log(`Successfully downloaded file, size: ${data.size} bytes`);
      try {
        // Basic handling - convert blob to text for text-based files
        // For PDFs and DOCs, proper parsing libraries would be needed
        textContent = await data.text();
        console.log(`Successfully extracted text, length: ${textContent.length} chars`);
        
        // If text is too long, truncate it to prevent token issues
        if (textContent.length > 5000) {
          console.log("Text content too long, truncating to 5000 chars");
          textContent = textContent.substring(0, 5000) + "... [content truncated]";
        }
      } catch (textError) {
        console.error("Error extracting text from resume:", textError);
        textContent = "Resume uploaded but content extraction is not supported for this file type.";
      }
    } else {
      console.log("No data returned from Supabase download");
    }

    return {
      isSuccess: true,
      message: "Resume content retrieved successfully",
      data: textContent
    }
  } catch (error) {
    console.error("Error retrieving resume content:", error);
    // Ensure we return a valid ActionState even if there's an error
    return {
      isSuccess: false,
      message: (error as Error).message || "Failed to retrieve resume content."
    }
  }
}