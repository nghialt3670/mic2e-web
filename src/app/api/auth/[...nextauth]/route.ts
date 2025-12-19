import { handlers } from "@/auth";
import { NextRequest } from "next/server";

// Next.js strips basePath from the URL before it reaches route handlers.
// Auth.js needs the full URL including basePath to parse actions correctly.
// This function rewrites the request URL to include the basePath.
function rewriteRequestWithBasePath(req: NextRequest): NextRequest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  if (!basePath) {
    return req;
  }

  // Reconstruct URL with basePath
  const url = new URL(req.url);
  const newPathname = `${basePath}${url.pathname}`;
  const newUrl = new URL(newPathname + url.search, url.origin);

  console.log(
    "[AUTH ROUTE] Rewriting URL:",
    url.pathname,
    "->",
    newUrl.pathname,
  );

  // Create new NextRequest with corrected URL (preserves nextUrl property)
  return new NextRequest(newUrl.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.body,
    duplex: "half",
  });
}

async function wrappedGET(req: NextRequest) {
  try {
    console.log("[AUTH ROUTE] GET request:", req.nextUrl.pathname);
    const rewrittenReq = rewriteRequestWithBasePath(req);
    const response = await handlers.GET(rewrittenReq);
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
    const rewrittenReq = rewriteRequestWithBasePath(req);
    const response = await handlers.POST(rewrittenReq);
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
