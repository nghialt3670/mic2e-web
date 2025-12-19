"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

export default function SignIn() {
  useEffect(() => {
    console.log("[SIGNIN PAGE] Loaded");
  }, []);

  const handleGoogleSignIn = async () => {
    console.log("[SIGNIN PAGE] Starting Google sign in...");
    try {
      const result = await signIn("google", {
        callbackUrl: "/", // basePath is handled by Next.js
        redirect: true,
      });
      console.log("[SIGNIN PAGE] Sign in result:", result);
    } catch (error) {
      console.error("[SIGNIN PAGE] Sign in error:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to continue to the application
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-md border bg-white px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          <FcGoogle className="h-5 w-5" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
