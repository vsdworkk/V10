/**
@description
Handles POST requests for uploading a user's resume file to Supabase Storage.
Expects multipart/form-data with fields:
- userId (string)
- file (the actual File blob)

After the file is uploaded, we immediately parse it via `parseResumeStorageAction`
(pdf-parse for PDFs and a placeholder for DOC/DOCX).
We then return:
{
  path: string,      // where the file is stored
  parsedText: string // extracted text, or a placeholder if doc/docx
}

@dependencies
- uploadResumeStorage from "@/actions/storage/resume-storage-actions"
- parseResumeStorageAction from "@/actions/storage/resume-storage-actions"
- NextResponse for JSON responses

@notes
We call parseResumeStorageAction with the "resumes" bucket and the path
returned from uploadResumeStorage.
If parsing fails, we return an error. Otherwise, the route responds
with both the file storage path and the parsed text.
*/

import { NextRequest, NextResponse } from "next/server"
import {
  uploadResumeStorage,
  parseResumeStorageAction
} from "@/actions/storage/resume-storage-actions"

export async function POST(req: NextRequest) {
  try {
    // We expect a multipart form body
    const formData = await req.formData()

    // Extract userId
    const userId = formData.get("userId")
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        {
          error: "Missing or invalid userId field in form data."
        },
        { status: 400 }
      )
    }

    // Extract file
    const file = formData.get("file")
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No file provided or invalid file type." },
        { status: 400 }
      )
    }

    // Convert the Blob to a File (for compatibility with our server action)
    const resumeFile = new File([file], (file as File).name, {
      type: file.type
    })

    // Call our server action to upload to Supabase
    const uploadResult = await uploadResumeStorage(resumeFile, userId)

    if (!uploadResult.isSuccess) {
      return NextResponse.json({ error: uploadResult.message }, { status: 500 })
    }

    const filePath = uploadResult.data?.path || ""
    if (!filePath) {
      return NextResponse.json(
        { error: "Failed to determine resume path after upload." },
        { status: 500 }
      )
    }

    // Now parse the uploaded file to extract text
    const parseResult = await parseResumeStorageAction("resumes", filePath)
    if (!parseResult.isSuccess) {
      return NextResponse.json(
        {
          error: `Resume uploaded but parsing failed: ${parseResult.message}`
        },
        { status: 500 }
      )
    }

    const parsedText = parseResult.data?.text || ""

    return NextResponse.json(
      {
        path: filePath,
        parsedText
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error in POST /api/resume-upload:", error)
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}