"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    // Log error to console for debugging
    console.error("[AUTH ERROR PAGE] Error:", error);
    console.error("[AUTH ERROR PAGE] Full URL:", window.location.href);
  }, [error]);

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    OAuthSignin: "Error in constructing an authorization URL.",
    OAuthCallback: "Error in handling the response from OAuth provider.",
    OAuthCreateAccount: "Could not create OAuth provider user in the database.",
    EmailCreateAccount: "Could not create email provider user in the database.",
    Callback: "Error in the OAuth callback handler route.",
    OAuthAccountNotLinked: "Email already exists with different provider.",
    SessionRequired: "Please sign in to access this page.",
    Default: "Unable to sign in.",
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
          <p className="mt-4 text-muted-foreground">{errorMessage}</p>
          {error && (
            <p className="mt-2 text-sm text-muted-foreground">
              Error code: <code className="rounded bg-muted px-1 py-0.5">{error}</code>
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full rounded-md bg-primary px-4 py-2 text-center text-primary-foreground hover:bg-primary/90"
          >
            Go Home
          </Link>
          
          <details className="rounded border border-border p-4">
            <summary className="cursor-pointer text-sm font-medium">
              Troubleshooting Information
            </summary>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p><strong>Common causes:</strong></p>
              <ul className="list-inside list-disc space-y-1">
                <li>OAuth redirect URI mismatch</li>
                <li>Invalid or expired credentials</li>
                <li>Database connection issues</li>
                <li>Missing environment variables</li>
              </ul>
              <p className="mt-4"><strong>Check server logs for details:</strong></p>
              <code className="block rounded bg-muted p-2">
                docker-compose logs -f web
              </code>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
