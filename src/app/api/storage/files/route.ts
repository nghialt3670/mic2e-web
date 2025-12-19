import { serverEnv } from "@/utils/server/env-utils";
import { NextRequest, NextResponse } from "next/server";

const FILES_ENDPOINT = `${serverEnv.STORAGE_API_HOST}/files`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const response = await fetch(FILES_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: response.status },
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Upload file error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
