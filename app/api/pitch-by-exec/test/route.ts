import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    isSuccess: true,
    message: "Test endpoint is working",
    timestamp: new Date().toISOString()
  })
} 