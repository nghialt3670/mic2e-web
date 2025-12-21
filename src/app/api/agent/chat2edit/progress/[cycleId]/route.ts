import { serverEnv } from "@/utils/server/env-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cycleId: string }> },
) {
  try {
    const { cycleId } = await params;
    const progressUrl = `${serverEnv.AGENT_API_URL}/chat2edit/progress/${cycleId}`;

    const response = await fetch(progressUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch progress" },
        { status: response.status },
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Fetch progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
