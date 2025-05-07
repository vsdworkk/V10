import { NextRequest, NextResponse } from "next/server";
import { getPitchByIdAction } from "@/actions/db/pitches-actions";
import { auth } from "@clerk/nextjs/server";

/**
 * API endpoint to check if the AI guidance has been generated and fetch it
 * This allows the frontend to poll for updates after initiating the agent
 */
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the pitchId from the query parameters
    const url = new URL(req.url);
    const pitchId = url.searchParams.get("pitchId");
    
    if (!pitchId) {
      return NextResponse.json(
        { error: "Pitch ID is required" },
        { status: 400 }
      );
    }

    // Fetch the pitch from the database
    const result = await getPitchByIdAction(pitchId, userId);
    
    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.message },
        { status: 404 }
      );
    }

    // Check if the guidance has been generated
    const guidance = result.data.albertGuidance;
    const hasGuidance = !!guidance;
    
    return NextResponse.json({
      success: true,
      hasGuidance,
      guidance: hasGuidance ? guidance : null,
      pitchId: result.data.id,
      agentExecutionId: result.data.agentExecutionId
    });
  } catch (error) {
    console.error("Error checking guidance status:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
} 