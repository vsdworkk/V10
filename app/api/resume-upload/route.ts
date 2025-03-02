/**
@description
Handles POST requests for uploading a user's resume file to Supabase Storage.
Expects multipart/form-data with fields:
- userId (string)
- file (the actual File blob)

On success, returns { path: string } in JSON to indicate where the file was stored.
@dependencies
- uploadResumeStorage from "@/actions/storage/resume-storage-actions"
- parse multipart form data from the request
@notes
This route is used by the wizard (Step 2 -> Next) to automatically upload the
resume file if the user selected one.
*/
import { NextRequest, NextResponse } from "next/server"
import { uploadResumeStorage } from "@/actions/storage/resume-storage-actions"

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
    const result = await uploadResumeStorage(resumeFile, userId)
    if (!result.isSuccess) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json({ path: result.data?.path || "" }, { status: 200 })
  } catch (error: any) {
    console.error("Error in POST /api/resume-upload:", error)
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}