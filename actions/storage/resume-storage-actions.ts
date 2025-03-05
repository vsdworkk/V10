/**
@description
Provides a server action for parsing a resume file (PDF or DOC/DOCX) that has
been uploaded to Supabase Storage. The `parseResumeStorageAction` function:
1. Downloads the specified file from the target bucket/path.
2. Checks its extension to determine which parser to use.
3. If PDF, uses pdf-parse to extract text.
4. If DOC or DOCX, returns a placeholder message (not yet implemented).
5. Returns an ActionState object containing either the extracted text or
an error message.
@dependencies
- pdf-parse: For parsing PDF files
- docx library is installed for generating docx, but not for parsing them,
  so doc/docx parsing is a placeholder here.
@notes
- The caller must provide a valid bucket and file path in Supabase.
- We rely on `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from env variables.
*/

"use server"

import { createClient } from "@supabase/supabase-js"
import { ActionState } from "@/types"
// Do not import pdf-parse directly at the module level
// import pdf from "pdf-parse"

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("ERROR: Missing Supabase environment variables.")
}

/**
@interface ParseResumeOutput
Defines the shape of the data returned by parseResumeStorageAction
*/
interface ParseResumeOutput {
  text: string
}

/**
@interface UploadResumeOutput
Defines the shape of the data returned by uploadResumeStorage
*/
interface UploadResumeOutput {
  path: string
}

/**
@function uploadResumeStorage
@description
Uploads a resume file (PDF, DOC, or DOCX) to Supabase Storage. 
The file is stored in a bucket with a path based on the user ID.
@param {File} file - The resume file to upload
@param {string} userId - The ID of the user who owns the resume
@returns {Promise<ActionState<UploadResumeOutput>>} - Contains `path` indicating where the file was stored
*/
export async function uploadResumeStorage(
  file: File,
  userId: string
): Promise<ActionState<UploadResumeOutput>> {
  try {
    // Initialize the Supabase client with service role
    const supabase = createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false }
    })

    // Determine the file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
    if (!['pdf', 'doc', 'docx'].includes(fileExtension)) {
      throw new Error("Unsupported file type. Only PDF, DOC, or DOCX files are allowed.")
    }

    // Define the bucket and path where the file will be stored
    const bucket = 'resumes'
    const fileName = `${Date.now()}-${file.name}`
    const path = `${userId}/${fileName}`

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        contentType: file.type
      })

    if (error) {
      throw new Error(`Failed to upload file to Supabase: ${error.message}`)
    }

    return {
      isSuccess: true,
      message: "Resume uploaded successfully",
      data: { path: data?.path || path }
    }
  } catch (error) {
    console.error("Error uploading resume:", error)
    return {
      isSuccess: false,
      message: (error as Error).message || "Failed to upload resume file"
    }
  }
}

/**
@function parseResumeStorageAction
@description
Downloads a resume file from Supabase Storage at the given path, determines whether
it is PDF or DOC/DOCX, and attempts to extract textual data.
For PDF:
- We parse it using pdf-parse
For DOC/DOCX:
- Currently a placeholder returning "DOCX parsing not implemented"
@param {string} bucket - The name of the Supabase Storage bucket
@param {string} path - The path (including folder/userId prefix and filename) in that bucket
@returns {Promise<ActionState<ParseResumeOutput>>} - Contains `text` with parsed resume data
on success, or an error message
*/
export async function parseResumeStorageAction(
  bucket: string,
  path: string
): Promise<ActionState<ParseResumeOutput>> {
  try {
    // Initialize the Supabase client with service role
    const supabase = createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false }
    })

    // Attempt to download the file from the specified bucket/path
    const { data: downloadData, error: downloadError } = await supabase
      .storage
      .from(bucket)
      .download(path)

    if (downloadError || !downloadData) {
      throw new Error(`Failed to download file from Supabase: ${downloadError?.message}`)
    }

    // Convert the downloaded file (Blob) to an ArrayBuffer
    const arrayBuffer = await downloadData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Simple extension check to determine parse method
    const lowerPath = path.toLowerCase()
    if (lowerPath.endsWith(".pdf")) {
      // Import pdf-parse dynamically only when needed
      const pdfParse = (await import('pdf-parse')).default
      
      // Parse PDF
      const pdfResult = await pdfParse(buffer)
      const text = pdfResult?.text ?? ""
      return {
        isSuccess: true,
        message: "Parsed PDF file successfully",
        data: { text }
      }
    } else if (lowerPath.endsWith(".doc") || lowerPath.endsWith(".docx")) {
      // Placeholder for doc/docx parsing
      // Could integrate a 3rd-party library that actually reads .docx content.
      // For now, we simply return a placeholder message.
      const docMessage =
        "DOC/DOCX parsing not yet implemented. Extend this action with a specialized library."
      return {
        isSuccess: true,
        message: "Parsed DOC/DOCX file (placeholder)",
        data: { text: docMessage }
      }
    } else {
      throw new Error(
        "Unsupported file extension for parsing. Only .pdf, .doc, or .docx are allowed."
      )
    }
  } catch (error) {
    console.error("Error parsing resume storage file:", error)
    return {
      isSuccess: false,
      message: (error as Error).message || "Failed to parse resume file"
    }
  }
}