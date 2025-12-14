import { auth } from "@/auth";
import type { NextRequest } from "next/server";

// Middleware runs in Edge Runtime - keep it simple
export default auth((req: NextRequest) => {
  try {
    const { pathname, search } = req.nextUrl;
    const method = req.method;
    
    console.log(`[${new Date().toISOString()}] ${method} ${pathname}${search}`);
    
    // Log auth status
    const session = (req as any).auth;
    if (session?.user) {
      console.log(`  ↳ User: ${session.user.email}`);
    } else if (pathname.startsWith("/api/auth")) {
      console.log(`  ↳ Auth endpoint`);
    } else {
      console.log(`  ↳ Anonymous`);
    }
  } catch (error) {
    console.error("[MIDDLEWARE ERROR]", error);
  }
  
  // Don't create NextResponse, just let auth handle it
  // return undefined to continue with default behavior
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
