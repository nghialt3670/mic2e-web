import { handlers } from "@/auth";
import { NextRequest } from "next/server";

// Wrap handlers with error logging
async function wrappedGET(req: NextRequest) {
  try {
    console.log("[AUTH ROUTE] GET request:", req.nextUrl.pathname);
    const response = await handlers.GET(req);
    console.log("[AUTH ROUTE] GET response status:", response?.status);
    return response;
  } catch (error) {
    console.error("[AUTH ROUTE] GET error:", error);
    throw error;
  }
}

async function wrappedPOST(req: NextRequest) {
  try {
    console.log("[AUTH ROUTE] POST request:", req.nextUrl.pathname);
    const response = await handlers.POST(req);
    console.log("[AUTH ROUTE] POST response status:", response?.status);
    return response;
  } catch (error) {
    console.error("[AUTH ROUTE] POST error:", error);
    throw error;
  }
}

export { wrappedGET as GET, wrappedPOST as POST };

// Force Node.js runtime (not Edge) for database access
export const runtime = "nodejs";
