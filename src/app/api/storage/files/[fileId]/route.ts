import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/utils/server/env-utils";

const FILES_ENDPOINT = `${serverEnv.STORAGE_API_HOST}/files`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const response = await fetch(`${FILES_ENDPOINT}/${fileId}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: response.status }
      );
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("Content-Disposition");
    const contentType = response.headers.get("Content-Type");

    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        ...(contentDisposition && { "Content-Disposition": contentDisposition }),
      },
    });
  } catch (error) {
    console.error("Download file error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const formData = await request.formData();

    const response = await fetch(`${FILES_ENDPOINT}/${fileId}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to replace file" },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Replace file error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    const response = await fetch(`${FILES_ENDPOINT}/${fileId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to delete file" },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
