import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest) => {
  const start = Date.now();
  const { pathname, search } = req.nextUrl;
  const method = req.method;
  
  console.log(`[${new Date().toISOString()}] ${method} ${pathname}${search}`);
  
  // Log auth status
  const session = (req as any).auth;
  if (session?.user) {
    console.log(`  ↳ User: ${session.user.email}`);
  } else {
    console.log(`  ↳ User: Anonymous`);
  }
  
  const response = NextResponse.next();
  
  // Log response (this won't show timing but shows the request completed)
  const duration = Date.now() - start;
  console.log(`  ↳ Completed in ${duration}ms`);
  
  return response;
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
